'use client';
import { useState, useEffect } from 'react';
import { ImageItem, TextBlock } from '@/types';
import { contentService } from '@/services/content';
import { DraggableImage } from '@/components/DraggableImage';
import DraggableText from '@/components/DraggableText';
import DisplayFilters from '@/components/DisplayFilters';

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const [showImages, setShowImages] = useState(true);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedImage(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    async function loadContent() {
      try {
        setIsLoading(true);
        const [imagesData, textData] = await Promise.all([
          contentService.fetchImages(),
          contentService.fetchTextBlocks()
        ]);
        console.log('Loaded images:', imagesData);
        console.log('Loaded text:', textData);
        
        const initializedImages = imagesData.map(img => ({
          ...img,
          position: img.position || img.defaultPosition
        }));
        const initializedText = textData.map(text => ({
          ...text,
          position: text.position || text.default_position
        }));
        setImages(initializedImages);
        setTextBlocks(initializedText);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  const toggleExpand = (imageId: string) => {
    if (expandedImage === imageId) {
      setExpandedImage(null);
    } else {
      setExpandedImage(imageId);
    }
    
    setImages(images.map(img => 
      img.id === imageId 
        ? { ...img, isExpanded: !img.isExpanded }
        : img
    ));
  };

  return (
    <main className="min-h-screen p-8 bg-white relative">
      <DisplayFilters
        showImages={showImages}
        showText={showText}
        onToggleImages={setShowImages}
        onToggleText={setShowText}
      />

      <div className="relative w-full overflow-visible">
        {showImages && images.map((image) => (
          <DraggableImage
            key={image.id}
            image={image}
            isDragging={isDragging}
            hoveredImage={hoveredImage}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onDrag={(id, x, y) => {
              const updatedImages = images.map((img) =>
                img.id === id
                  ? { ...img, position: { x, y } }
                  : img
              );
              setImages(updatedImages);
            }}
            onHover={setHoveredImage}
            toggleExpand={toggleExpand}
          />
        ))}

        {showText && textBlocks.map((text) => (
          <DraggableText
            key={text.id}
            text={text}
            isDragging={isDragging}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onDrag={(id, x, y) => {
              const updatedTextBlocks = textBlocks.map((block) =>
                block.id === id
                  ? { ...block, position: { x, y } }
                  : block
              );
              setTextBlocks(updatedTextBlocks);
            }}
          />
        ))}
      </div>
    </main>
  );
}
