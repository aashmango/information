'use client';
import { useState, useEffect, useCallback } from 'react';
import { ImageItem, TextBlock, Position, VideoItem } from '@/types';
import { contentService } from '@/services/content';
import Toolbar from '@/components/Toolbar';
import ContentCanvas from '@/components/ContentCanvas';
import { ZIndexProvider } from '@/utils/ZIndexContext';
import { v4 as uuidv4 } from 'uuid';
import { useContentHandlers } from '@/utils/handlers';

const DEFAULT_TEXT_WIDTH = 100;

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { handlePositionChange, handleDescriptionChange, handleTextChange, handleDeleteText } = useContentHandlers(setImages, setVideos, setTextBlocks, setHasUnsavedChanges);

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

  const handleAddTextBlock = () => {
    return new Promise<void>((resolve) => {
      const newTextBlock: TextBlock = {
        id: uuidv4(),
        content: '',
        width: DEFAULT_TEXT_WIDTH,
        current_position: { x: 0, y: 0 },
        default_position: { x: 0, y: 0 },
      };
      setTextBlocks(prev => [...prev, newTextBlock]);
      setHasUnsavedChanges(true);
      resolve();
    });
  };

  const handleToggleSize = (id: string, type: 'image' | 'video') => {
    if (type === 'video') {
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id ? { ...video, isExpanded: !video.isExpanded } : video
        )
      );
    } else {
      setImages(prevImages => 
        prevImages.map(image => 
          image.id === id ? { ...image, isExpanded: !image.isExpanded } : image
        )
      );
    }
  };

  return (
    <ZIndexProvider>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <Toolbar
          onAddTextBlock={handleAddTextBlock}
        />
        <ContentCanvas
          images={images}
          videos={videos}
          textBlocks={textBlocks}
          onPositionChange={handlePositionChange}
          onDescriptionChange={handleDescriptionChange}
          onTextChange={handleTextChange}
          onDeleteText={handleDeleteText}
          onToggleSize={handleToggleSize}
        />
      </div>
    </ZIndexProvider>
  );
}
