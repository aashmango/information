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

  const handleDescriptionChange = useCallback((id: string, newDescription: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, description: newDescription } : img
    ));
    setHasUnsavedChanges(true);
  }, [setImages, setHasUnsavedChanges]);

  const handleTextChange = useCallback((id: string, newContent: string) => {
    setTextBlocks(prev => prev.map(text =>
      text.id === id ? { ...text, content: newContent } : text
    ));
    setHasUnsavedChanges(true);
  }, [setTextBlocks, setHasUnsavedChanges]);

  const handleDeleteText = useCallback(async (id: string) => {
    // Implement the delete logic here, e.g., API call
    setTextBlocks(prev => prev.filter(text => text.id !== id));
    setHasUnsavedChanges(true);
  }, [setTextBlocks, setHasUnsavedChanges]);

  return { handlePositionChange, handleDescriptionChange, handleTextChange, handleDeleteText };
}; 