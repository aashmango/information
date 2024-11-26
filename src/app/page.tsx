'use client';
import { useState, useEffect, useCallback } from 'react';
import { ImageItem, TextBlock, Position } from '@/types';
import { contentService } from '@/services/content';
import DraggableImage from '@/components/DraggableImage';
import DraggableText from '@/components/DraggableText';
import DisplayFilters from '@/components/DisplayFilters';
import Minimap from '@/components/Minimap';

const FILTER_NAV_HEIGHT = 22;

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [showImages, setShowImages] = useState(true);
  const [showText, setShowText] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [images, texts] = await Promise.all([
          contentService.fetchImages(),
          contentService.fetchTextBlocks()
        ]);
        
        const defaultPosition = { x: 0, y: 0 };
        setImages(images.map(img => ({
          ...img,
          current_position: img.current_position || defaultPosition
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

  const handlePositionChange = useCallback((
    id: string,
    newPosition: Position,
    isImage: boolean
  ) => {
    const snappedPosition = {
      x: Math.round(newPosition.x / 16) * 16,
      y: Math.round(newPosition.y / 16) * 16
    };

    if (isImage) {
      setImages(prev => prev.map(item =>
        item.id === id
          ? { ...item, current_position: snappedPosition }
          : item
      ));
    } else {
      setTextBlocks(prev => prev.map(item =>
        item.id === id
          ? { ...item, current_position: snappedPosition }
          : item
      ));
    }
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveChanges = useCallback(async () => {
    try {
      await contentService.savePositions({
        images: images.map(({ id, current_position: { x, y } }) => ({
          id,
          position: { x, y }
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
  }, [images, textBlocks]);

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
      img.id === id ? { ...img, isExpanded: !img.isExpanded } : img
    ));
  }, []);

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
      />
      
      {showImages && images.map(image => (
        <DraggableImage
          key={image.id}
          id={image.id}
          position={image.current_position}
          image={image}
          onPositionChange={(pos) => handlePositionChange(image.id, pos, true)}
          onToggleSize={() => handleToggleSize(image.id)}
        />
      ))}

      {showText && textBlocks.map(text => (
        <DraggableText
          key={text.id}
          id={text.id}
          text={text}
          position={text.current_position}
          onPositionChange={(pos) => handlePositionChange(text.id, pos, false)}
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
        <span style={{ marginRight: '20px' }}>
          Placeholder Text
        </span>
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
