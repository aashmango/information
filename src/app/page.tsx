'use client';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadContent = async () => {
      console.log('Starting to load content...');
      try {
        const [fetchedImages, fetchedTextBlocks] = await Promise.all([
          contentService.fetchImages(),
          contentService.fetchTextBlocks()
        ]);
        
        console.log('Fetched images:', fetchedImages);
        console.log('Fetched text blocks:', fetchedTextBlocks);
        
        const imagesWithPositions = fetchedImages.map(img => ({
          ...img,
          current_position: img.current_position || { x: 0, y: 0 }
        }));
        
        const textBlocksWithPositions = fetchedTextBlocks.map(block => ({
          ...block,
          current_position: block.current_position || { x: 0, y: 0 }
        }));
        
        console.log('Processed images:', imagesWithPositions);
        console.log('Processed text blocks:', textBlocksWithPositions);
        
        setImages(imagesWithPositions);
        setTextBlocks(textBlocksWithPositions);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();
  }, []);

  const handleImagePositionChange = (id: string, newPosition: Position) => {
    setImages(prevImages => prevImages.map(img =>
      img.id === id
        ? { ...img, current_position: newPosition }
        : img
    ));
    setHasUnsavedChanges(true);
  };

  const handleTextPositionChange = (id: string, newPosition: Position) => {
    setTextBlocks(prevBlocks => prevBlocks.map(block =>
      block.id === id
        ? { ...block, current_position: newPosition }
        : block
    ));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
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
  };

  return (
    <main className="min-h-screen p-8 bg-white">
      <DisplayFilters
        showImages={showImages}
        showText={showText}
        onToggleImages={setShowImages}
        onToggleText={setShowText}
      />
      
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        {images.map((image) => (
          <DraggableImage
            key={image.id}
            id={image.id}
            image={image}
            position={image.current_position}
            onPositionChange={(newPosition) => handleImagePositionChange(image.id, newPosition)}
          />
        ))}
        
        {showText && textBlocks.map(text => (
          <DraggableText
            key={text.id}
            id={text.id}
            text={text}
            position={text.current_position}
            onPositionChange={(pos) => handleTextPositionChange(text.id, pos)}
          />
        ))}
      </div>

      {hasUnsavedChanges && (
        <button 
          onClick={handleSaveChanges}
          className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800"
        >
          Save Changes
        </button>
      )}
    </main>
  );
}
