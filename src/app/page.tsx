'use client';
import { useState, useEffect, useCallback } from 'react';
import { ImageItem, TextBlock, Position, SavePositionsPayload } from '@/types';
import { contentService } from '@/services/content';
import DraggableImage from '@/components/DraggableImage';
import DraggableText from '@/components/DraggableText';
import DisplayFilters from '@/components/DisplayFilters';

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [showImages, setShowImages] = useState(true);
  const [showText, setShowText] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [fetchedImages, fetchedTextBlocks] = await Promise.all([
          contentService.fetchImages(),
          contentService.fetchTextBlocks()
        ]);
        
        const imagesWithPositions = fetchedImages.map(img => ({
          ...img,
          current_position: img.current_position || { x: 0, y: 0 }
        }));
        
        const textBlocksWithPositions = fetchedTextBlocks.map(block => ({
          ...block,
          current_position: block.current_position || { x: 0, y: 0 }
        }));
        
        setImages(imagesWithPositions);
        setTextBlocks(textBlocksWithPositions);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    updateContentHeight();
  }, [images, textBlocks]);

  const handleSaveChanges = useCallback(async () => {
    try {
      await contentService.savePositions({
        images: images.map(img => ({
          id: img.id,
          position: {
            x: img.current_position.x,
            y: img.current_position.y
          }
        })),
        textBlocks: textBlocks.map(block => ({
          id: block.id,
          position: {
            x: block.current_position.x,
            y: block.current_position.y
          }
        }))
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save positions:', error);
    }
  }, [images, textBlocks]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.metaKey && event.key === 's') {
        event.preventDefault(); // Prevent browser's save dialog
        console.log('Ctrl+S pressed, hasUnsavedChanges:', hasUnsavedChanges); // Debug log
        if (hasUnsavedChanges) {
          handleSaveChanges();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasUnsavedChanges, handleSaveChanges]);

  const handleImagePositionChange = (id: string, newPosition: Position) => {
    setImages(prevImages => prevImages.map(img =>
      img.id === id
        ? { ...img, current_position: newPosition }
        : img
    ));
    setHasUnsavedChanges(true);
    requestAnimationFrame(updateContentHeight);
  };

  const handleTextPositionChange = (id: string, newPosition: Position) => {
    setTextBlocks(prevBlocks => prevBlocks.map(block =>
      block.id === id
        ? { ...block, current_position: newPosition }
        : block
    ));
    setHasUnsavedChanges(true);
    requestAnimationFrame(updateContentHeight);
  };

  const updateContentHeight = () => {
    const elements = document.querySelectorAll('.draggable-item');
    let maxY = 0;
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const bottomY = rect.bottom;
      maxY = Math.max(maxY, bottomY);
    });

    // Add padding below the lowest element
    setContentHeight(maxY + 100);
  };

  const handleToggleSize = (id: string) => {
    setImages(prevImages => prevImages.map(img =>
      img.id === id
        ? { ...img, isExpanded: !img.isExpanded }
        : img
    ));
  };

  return (
    <>
      <div 
        style={{ 
          position: 'relative',
          width: '100%',
          minHeight: `${contentHeight}px`,
          backgroundColor: 'white',
          border: '1px solid black',
        }}
      >
        <main className="p-8 relative flex flex-row justify-between">
          <DisplayFilters
            showImages={showImages}
            showText={showText}
            onToggleImages={setShowImages}
            onToggleText={setShowText}
          />
          
          <div className="relative">
            {showImages && images.map((image) => (
              <DraggableImage
                key={image.id}
                id={image.id}
                image={image}
                position={image.current_position}
                onPositionChange={(newPosition) => handleImagePositionChange(image.id, newPosition)}
                className="draggable-item"
                onToggleSize={() => handleToggleSize(image.id)}
              />
            ))}
            
            {showText && textBlocks.map(text => (
              <DraggableText
                key={text.id}
                id={text.id}
                text={text}
                position={text.current_position}
                onPositionChange={(pos) => handleTextPositionChange(text.id, pos)}
                className="draggable-item"
              />
            ))}
          </div>
        </main>
      </div>
      <div className="w-full h-[900px] bg-black" />
    </>
  );
}
