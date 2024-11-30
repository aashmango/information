import { useCallback } from 'react';
import { ImageItem, VideoItem, TextBlock, Position } from '@/types';

export const useContentHandlers = (
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>, 
  setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>, 
  setTextBlocks: React.Dispatch<React.SetStateAction<TextBlock[]>>, 
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const handlePositionChange = useCallback((id: string, newPosition: Position, type: 'image' | 'text' | 'video') => {
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
  }, [setImages, setVideos, setTextBlocks, setHasUnsavedChanges]);

  return { handlePositionChange };
}; 