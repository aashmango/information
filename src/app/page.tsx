'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageItem, TextBlock, Position, VideoItem } from '@/types';
import { contentService } from '@/services/content';
import DraggableImage from '@/components/DraggableImage';
import DraggableText from '@/components/DraggableText';
import DisplayFilters from '@/components/DisplayFilters';
import Minimap from '@/components/Minimap';
import DraggableVideo from '@/components/DraggableVideo';
import { getItemDimensions, gridLayout } from '@/utils/layoutAlgorithms';

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

  const handleToggleSize = useCallback((id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { 
        ...img, 
        isExpanded: !img.isExpanded,
        src: !img.isExpanded ? (img.original_url || img.src) : (img.thumbnail_url || img.src)
      } : img
    ));
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
        images={images}
        textBlocks={textBlocks}
        showImages={showImages}
        showText={showText}
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
          onToggleSize={() => handleToggleSize(image.id)}
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
          onToggleSize={() => handleToggleSize(video.id)}
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
        bottom: 0,
        left: 0,
        right: 0,
        height: '50px',
        backgroundColor: 'white',
        borderTop: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 1000,
      }}>
        <button 
          onClick={handleCleanupLayout}
          style={{
            padding: '4px 8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '20px',
          }}
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
  );
}
