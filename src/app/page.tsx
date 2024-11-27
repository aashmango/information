'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageItem, TextBlock, Position, VideoItem } from '@/types';
import { contentService } from '@/services/content';
import DraggableImage from '@/components/DraggableImage';
import DraggableText from '@/components/DraggableText';
import DisplayFilters from '@/components/DisplayFilters';
import Minimap from '@/components/Minimap';
import DraggableVideo from '@/components/DraggableVideo';
import { getItemDimensions, gridLayout, calculateDescriptionHeight, DEFAULT_TEXT_HEIGHT, PADDING } from '@/utils/layoutAlgorithms';
import { ZIndexProvider } from '@/utils/ZIndexContext';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from '@/components/Toolbar';

const FILTER_NAV_HEIGHT = 22;
const TOOLBAR_HEIGHT = 40;
const SPAWN_OFFSET_Y = 100;

type LayoutType = 'grid' | 'masonry' | 'compact';

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [showImages, setShowImages] = useState(true);
  const [showText, setShowText] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [videos, setVideos] = useState<VideoItem[]>([]);

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
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        images: images.map(({ id, current_position: { x, y }, description }) => ({
          id,
          position: { x, y },
          description: description ?? ''
        })),
        videos: videos.map(({ id, current_position: { x, y }, description }) => ({
          id,
          position: { x, y },
          description: description ?? ''
        })),
        textBlocks: textBlocks.map(({ id, current_position: { x, y }, content }) => ({
          id,
          position: { x, y },
          content: content
        }))
      });
      setHasUnsavedChanges(false);
      alert('Saved!');
    } catch (error) {
      console.error('Failed to save positions:', error);
      alert('Failed to save!');
    }
  }, [images, videos, textBlocks]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (hasUnsavedChanges) handleSaveChanges();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasUnsavedChanges, handleSaveChanges]);

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

  return (
    <ZIndexProvider>
      <main 
        style={{
          width: '100%',
          height: '5000px',
          position: 'relative',
          backgroundColor: 'white',
          backgroundImage: `
            radial-gradient(#CCCCCC 1px, 
            transparent 1px)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: `8px ${FILTER_NAV_HEIGHT + 8}px`,
          backgroundRepeat: 'repeat',
          overflow: 'auto',
        }}
      >
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
          showVideos={showImages}
          scrollPosition={scrollPosition}
          containerWidth={100}
          containerHeight={200}
        />
        
        {showImages && images.map(image => (
          <DraggableImage
            key={image.id}
            id={image.id}
            position={image.current_position}
            image={image}
            onPositionChange={(pos) => handlePositionChange(image.id, pos, 'image')}
            onToggleSize={() => handleToggleSize(image.id, 'image')}
            onDescriptionChange={(desc) => handleDescriptionChange(image.id, desc)}
          />
        ))}

        {showImages && videos.map(video => (
          <DraggableVideo
            key={video.id}
            id={video.id}
            position={video.current_position}
            video={video}
            onPositionChange={(pos) => handlePositionChange(video.id, pos, 'video')}
            onToggleSize={() => handleToggleSize(video.id, 'video')}
            onDescriptionChange={(desc) => handleDescriptionChange(video.id, desc)}
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
          />
        ))}

        <Toolbar
          onCleanupLayout={handleCleanupLayout}
          onAddTextBlock={handleAddTextBlock}
          showImages={showImages}
          showText={showText}
          onToggleImages={setShowImages}
          onToggleText={setShowText}
        />
      </main>
    </ZIndexProvider>
  );
}
