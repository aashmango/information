'use client';
import Image from 'next/image';
import Draggable from 'react-draggable';
import { useState, useEffect, useRef } from 'react';
import { ImageItem, TextBlock } from '../types';
import { IMAGES, TEXT_BLOCKS } from '../data/content';
import { DraggableImage } from '../components/DraggableImage';

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>(() =>
    IMAGES.map(img => ({
      id: img.id,
      src: img.src,
      position: img.defaultPosition,
      width: img.width,
      height: img.height,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const [textBlocks, setTextBlocks] = useState<TextBlock[]>(() => {
    const blocks = TEXT_BLOCKS.map(text => ({
      id: text.id,
      content: text.content,
      position: text.defaultPosition,
      width: text.width,
    }));
    console.log('Initializing text blocks:', blocks);
    return blocks;
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedImage(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleExpand = (imageId: string) => {
    setImages(images.map(img => 
      img.id === imageId 
        ? { ...img, isExpanded: !img.isExpanded }
        : img
    ));
  };

  return (
    <main className="min-h-screen p-8 bg-white relative">
      <div className="relative w-full overflow-visible">
        {images.map((image) => (
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

        {textBlocks.map((text) => {
          const nodeRef = useRef(null);
          
          return (
            <Draggable
              key={text.id}
              nodeRef={nodeRef}
              position={text.position}
              onStart={() => setIsDragging(true)}
              onStop={() => setIsDragging(false)}
              onDrag={(e, data) => {
                const updatedTextBlocks = textBlocks.map((block) =>
                  block.id === text.id
                    ? { ...block, position: { x: data.x, y: data.y } }
                    : block
                );
                setTextBlocks(updatedTextBlocks);
              }}
            >
              <div 
                ref={nodeRef}
                className="fixed rounded-lg transition-all duration-200"
                style={{
                  width: text.width,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  position: 'absolute',
                  transform: 'none',
                  zIndex: 5,
                  padding: '24px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.boxShadow = '0 0 30px 10px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <p className="select-none text-black font-bold leading-relaxed m-0">
                  {text.content}
                </p>
              </div>
            </Draggable>
          );
        })}
      </div>
    </main>
  );
}
