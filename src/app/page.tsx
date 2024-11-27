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

const FILTER_NAV_HEIGHT = 22;

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
        textBlocks: textBlocks.map(({ id, current_position: { x, y } }) => ({
          id,
          position: { x, y }
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
          />
        ))}

        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px',
          height: '40px',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20px',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <button 
            onClick={handleCleanupLayout}
            style={{
              padding: '4px 8px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              marginRight: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
          >
            Clean Up Layout
          </button>
          <DisplayFilters
            showImages={showImages}
            showText={showText}
            onToggleImages={setShowImages}
            onToggleText={setShowText}
          />
        </div>
      </main>
    </ZIndexProvider>
  );
}
