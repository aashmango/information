'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageItem, TextBlock, Position, VideoItem } from '@/types';
import { contentService } from '@/services/content';
import DraggableImage from '@/components/DraggableImage';
import DraggableText from '@/components/DraggableText';
import Minimap from '@/components/Minimap';
import DraggableVideo from '@/components/DraggableVideo';
import { getItemDimensions, gridLayout, calculateDescriptionHeight, DEFAULT_TEXT_HEIGHT, PADDING } from '@/utils/layoutAlgorithms';
import { ZIndexProvider } from '@/utils/ZIndexContext';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from '@/components/Toolbar';

const TOOLBAR_HEIGHT = 40;
const SPAWN_OFFSET_Y = 100;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const CANVAS_HEIGHT = 5000;

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [showImages, setShowImages] = useState(true);
  const [showText, setShowText] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showVideos, setShowVideos] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [images, texts, videos] = await Promise.all([
          contentService.fetchImages(),
          contentService.fetchTextBlocks(),
          contentService.fetchVideos()
        ]);
        
        const defaultPosition = { x: 0, y: 0 };
        setImages(images.map(img => ({
          ...img,
          current_position: img.current_position || defaultPosition
        })));
        setVideos(videos.map(video => ({
          ...video,
          current_position: video.current_position || defaultPosition
        })));
        setTextBlocks(texts.map(text => ({
          ...text,
          current_position: text.current_position || defaultPosition
        })));
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        const container = document.querySelector('main')?.parentElement;
        if (container) {
          setScrollPosition({
            x: container.scrollLeft,
            y: container.scrollTop
          });
        }
      };

      const container = document.querySelector('main')?.parentElement;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }
  }, []);

  const handlePositionChange = useCallback((
    id: string,
    newPosition: Position,
    type: 'image' | 'text' | 'video'
  ) => {
    const snappedPosition = {
      x: Math.round(newPosition.x / 16) * 16,
      y: Math.round(newPosition.y / 16) * 16
    };

    switch (type) {
      case 'image':
        setImages(prev => prev.map(item =>
          item.id === id
            ? { ...item, current_position: snappedPosition }
            : item
        ));
        break;
      case 'video':
        setVideos(prev => prev.map(item =>
          item.id === id
            ? { ...item, current_position: snappedPosition }
            : item
        ));
        break;
      case 'text':
        setTextBlocks(prev => prev.map(item =>
          item.id === id
            ? { ...item, current_position: snappedPosition }
            : item
        ));
        break;
    }
    setHasUnsavedChanges(true);
  }, []);

  const handleDescriptionChange = useCallback((id: string, newDescription: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, description: newDescription } : img
    ));
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveChanges = useCallback(async () => {
    try {
      await contentService.savePositions({
        images: images.map(img => ({
          id: img.id,
          position: img.current_position,
          description: img.description || '',
          isExpanded: img.isExpanded || false
        })),
        videos: videos.map(video => ({
          id: video.id,
          position: video.current_position,
          description: video.description || '',
          isExpanded: video.isExpanded || false
        })),
        textBlocks: textBlocks.map(text => ({
          id: text.id,
          position: text.current_position,
          content: text.content
        }))
      });
      setHasUnsavedChanges(false);
      alert('Saved!');
    } catch (error) {
      console.error('Failed to save positions:', error);
      alert('Failed to save!');
    }
  }, [images, videos, textBlocks]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoomLevel(prevZoom => {
      const newZoom = direction === 'in' 
        ? prevZoom + ZOOM_STEP 
        : prevZoom - ZOOM_STEP;
      return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (hasUnsavedChanges) handleSaveChanges();
      }
      if (event.ctrlKey && event.key === '=') {
        event.preventDefault();
        handleZoom('in');
      }
      if (event.ctrlKey && event.key === '-') {
        event.preventDefault();
        handleZoom('out');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasUnsavedChanges, handleSaveChanges, handleZoom]);

  const handleToggleSize = useCallback((id: string, type: 'image' | 'video') => {
    if (type === 'image') {
      setImages(prev => prev.map(img =>
        img.id === id ? { ...img, isExpanded: !img.isExpanded } : img
      ));
    } else if (type === 'video') {
      setVideos(prev => prev.map(video =>
        video.id === id ? { ...video, isExpanded: !video.isExpanded } : video
      ));
    }
    setHasUnsavedChanges(true);
  }, []);

  const handleCleanupLayout = useCallback(() => {
    const allItems = [
      ...images.map(item => ({
        ...getItemDimensions(item),
        type: 'image' as const
      })),
      ...videos.map(item => ({
        ...getItemDimensions({
          ...item,
          type: 'video'
        }),
        type: 'video' as const
      })),
      ...textBlocks.map(item => ({
        ...getItemDimensions(item),
        type: 'text' as const
      }))
    ];

    const positions = gridLayout(allItems);

    // Update positions for each type
    const imagePositions = positions.slice(0, images.length);
    const videoPositions = positions.slice(images.length, images.length + videos.length);
    const textPositions = positions.slice(images.length + videos.length);

    setImages(prev => prev.map((img, i) => ({
      ...img,
      current_position: imagePositions[i] || img.current_position
    })));

    setVideos(prev => prev.map((video, i) => ({
      ...video,
      current_position: videoPositions[i] || video.current_position
    })));

    setTextBlocks(prev => prev.map((text, i) => ({
      ...text,
      current_position: textPositions[i] || text.current_position
    })));

    setHasUnsavedChanges(true);
  }, [images, videos, textBlocks]);

  const handleAddTextBlock = async () => {
    if (typeof window !== 'undefined') {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const spawnX = scrollX + (viewportWidth / 2) - 150;
      const spawnY = scrollY + viewportHeight - TOOLBAR_HEIGHT - SPAWN_OFFSET_Y;

      const newText: TextBlock = {
        id: uuidv4(),
        content: 'New text block',
        current_position: { 
          x: Math.round(spawnX / 16) * 16,
          y: Math.round(spawnY / 16) * 16
        },
        default_position: {
          x: Math.round(spawnX / 16) * 16,
          y: Math.round(spawnY / 16) * 16
        },
        width: 300
      };
      
      try {
        await contentService.createTextBlock(newText);
        setTextBlocks(prev => [...prev, newText]);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Failed to create text block:', error);
        alert('Failed to create text block');
      }
    }
  };

  const handleTextChange = (id: string, newContent: string) => {
    setTextBlocks(prev => prev.map(text =>
      text.id === id ? { ...text, content: newContent } : text
    ));
    setHasUnsavedChanges(true);
  };

  const handleDeleteText = async (id: string) => {
    try {
      await contentService.deleteTextBlock(id);
      setTextBlocks(prev => prev.filter(text => text.id !== id));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Failed to delete text block:', error);
      alert('Failed to delete text block');
    }
  };

  // First, calculate the bounds of all items
  const getBounds = () => {
    if (typeof window === 'undefined') {
      // Provide default values or handle the case when window is not available
      return { maxX: 0, maxY: 0, minX: 0, minY: 0 };
    }

    const allItems = [
      ...(showImages ? images : []),
      ...(showText ? textBlocks : []),
      ...(showVideos ? videos : [])
    ];

    if (allItems.length === 0) {
      return {
        maxX: window.innerWidth,
        maxY: window.innerHeight,
        minX: 0,
        minY: 0
      };
    }

    return allItems.reduce((bounds, item) => {
      const itemHeight = 'height' in item ? item.height : DEFAULT_TEXT_HEIGHT;
      return {
        maxX: Math.max(bounds.maxX, item.current_position.x + (item.width || 300)),
        maxY: Math.max(bounds.maxY, item.current_position.y + itemHeight),
        minX: Math.min(bounds.minX, item.current_position.x),
        minY: Math.min(bounds.minY, item.current_position.y),
      };
    }, { maxX: 0, maxY: 0, minX: Infinity, minY: Infinity });
  };

  // Then use these bounds to calculate appropriate minimap dimensions
  const bounds = getBounds();
  const contentWidth = Math.max(bounds.maxX - bounds.minX, typeof window !== 'undefined' ? window.innerWidth : 0);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, typeof window !== 'undefined' ? window.innerHeight : 0);
  const aspectRatio = contentWidth / contentHeight;

  // Use a maximum width of 150px for the minimap
  const minimapWidth = typeof window !== 'undefined' ? window.innerWidth * 0.1 : 500; // Default value for SSR
  const minimapHeight = minimapWidth / aspectRatio;

  console.log('Minimap Width:', minimapWidth);
  console.log('WindowWidth:', typeof window !== 'undefined' ? window.innerWidth : 0);
  console.log('Aspect Ratio:', aspectRatio);
  console.log('Minimap Height:', minimapHeight);

  return (
    <ZIndexProvider>
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 1000,
          pointerEvents: 'none', // Allow clicking through to elements underneath
        }}>
          <Minimap
            images={images.map(img => {
              const baseWidth = img.isExpanded ? 600 : 300;
              const mediaHeight = img.isExpanded ? 
                Math.round(600 * (img.height / img.width)) : 
                Math.round(300 * (img.height / img.width));
              const descriptionHeight = calculateDescriptionHeight(img.description);
              const totalHeight = mediaHeight + descriptionHeight + PADDING;
              
              return {
                ...img,
                width: baseWidth,
                aspectRatio: baseWidth / totalHeight
              };
            })}
            videos={videos.map(video => ({
              ...video,
              width: video.isExpanded ? 600 : 300,
              aspectRatio: (video.isExpanded ? 600 : 300) / 
                (Math.round((video.isExpanded ? 600 : 300) * (video.height / video.width)) + 
                 calculateDescriptionHeight(video.description) + 
                 PADDING)
            }))}
            textBlocks={textBlocks.map(text => ({
              ...text,
              width: text.width,
              aspectRatio: text.width / DEFAULT_TEXT_HEIGHT
            }))}
            showImages={showImages}
            showText={showText}
            showVideos={showVideos}
            scrollPosition={scrollPosition}
            containerWidth={minimapWidth}
            containerHeight={minimapHeight}
            zoomLevel={zoomLevel}
          />
        </div>

        <div 
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
        >
          <main 
            style={{
              width: `${100 / zoomLevel}%`,
              height: `${CANVAS_HEIGHT / zoomLevel}px`,
              position: 'relative',
              backgroundColor: 'white',
              backgroundSize: `${16}px ${16}px`,
              backgroundPosition: `${8}px ${8}px`,
              backgroundRepeat: 'repeat',
              transform: `scale(${zoomLevel})`,
              transformOrigin: '0 0',
              minHeight: '100vh',
            }}
          >
            {showImages && images.map(image => (
              <DraggableImage
                key={image.id}
                id={image.id}
                position={image.current_position}
                image={image}
                onPositionChange={(pos) => handlePositionChange(image.id, pos, 'image')}
                onToggleSize={() => handleToggleSize(image.id, 'image')}
                onDescriptionChange={(desc) => handleDescriptionChange(image.id, desc)}
                zoomLevel={zoomLevel}
              />
            ))}

            {showVideos && videos.map(video => (
              <DraggableVideo
                key={video.id}
                id={video.id}
                position={video.current_position}
                video={video}
                onPositionChange={(pos) => handlePositionChange(video.id, pos, 'video')}
                onToggleSize={() => handleToggleSize(video.id, 'video')}
                onDescriptionChange={(desc) => handleDescriptionChange(video.id, desc)}
                zoomLevel={zoomLevel}
              />
            ))}

            {showText && textBlocks.map(text => (
              <DraggableText
                key={text.id}
                id={text.id}
                text={text.content}
                position={text.current_position}
                onPositionChange={(pos) => handlePositionChange(text.id, pos, 'text')}
                onTextChange={(newText) => handleTextChange(text.id, newText)}
                onDelete={() => handleDeleteText(text.id)}
                zoomLevel={zoomLevel}
              />
            ))}
          </main>
        </div>

        <Toolbar
          onCleanupLayout={handleCleanupLayout}
          onAddTextBlock={handleAddTextBlock}
          showImages={showImages}
          showText={showText}
          onToggleImages={setShowImages}
          onToggleText={setShowText}
          onZoomIn={() => handleZoom('in')}
          onZoomOut={() => handleZoom('out')}
          zoomLevel={zoomLevel}
        />
      </div>
    </ZIndexProvider>
  );
}
