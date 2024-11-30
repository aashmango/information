'use client';
import { useState, useEffect, useCallback } from 'react';
import { ImageItem, TextBlock, Position, VideoItem } from '@/types';
import { contentService } from '@/services/content';
import Toolbar from '@/components/Toolbar';
import ContentCanvas from '@/components/ContentCanvas';
import { ZIndexProvider } from '@/utils/ZIndexContext';
import { v4 as uuidv4 } from 'uuid';
import { useContentHandlers } from '@/utils/handlers';

const TOOLBAR_HEIGHT = 40;
const SPAWN_OFFSET_Y = 100;
const CANVAS_HEIGHT = 5000;
const DEFAULT_TEXT_WIDTH = 100;

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showText, setShowText] = useState(true);

  const { handlePositionChange } = useContentHandlers(setImages, setVideos, setTextBlocks, setHasUnsavedChanges);

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

  const handleDescriptionChange = useCallback((id: string, newDescription: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, description: newDescription } : img
    ));
    setHasUnsavedChanges(true);
  }, []);

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

  return (
    <ZIndexProvider>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <Toolbar
          onAddTextBlock={handleAddTextBlock}
          onToggleSize={handleToggleSize}
          onDescriptionChange={handleDescriptionChange}
          onTextChange={handleTextChange}
          onDeleteText={handleDeleteText}
        />
        <ContentCanvas
          images={images}
          videos={videos}
          textBlocks={textBlocks}
          onPositionChange={handlePositionChange}
          onToggleSize={handleToggleSize}
          onDescriptionChange={handleDescriptionChange}
          onTextChange={handleTextChange}
          onDeleteText={handleDeleteText}
        />
      </div>
    </ZIndexProvider>
  );
}
