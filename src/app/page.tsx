'use client';
import Image from 'next/image';
import Draggable from 'react-draggable';
import { useState, useEffect, useRef } from 'react';

const IMAGES = [
  {
    id: '1',
    src: '/images/image1.jpg',
    alt: 'Image 1',
    defaultPosition: { x: 800, y: 200 },
    width: 300,
    height: 400,
  },
  {
    id: '2',
    src: '/images/image2.jpg',
    alt: 'Image 2',
    defaultPosition: { x: 150, y: 700 },
    width: 350,
    height: 250,
  },
  {
    id: '3',
    src: '/images/image3.jpg',
    alt: 'Image 3',
    defaultPosition: { x: 200, y: 900 },
    width: 400,
    height: 300,
  },
  {
    id: '4',
    src: '/images/image4.jpg',
    alt: 'Image 4',
    defaultPosition: { x: 850, y: 1200 },
    width: 250,
    height: 350,
  },
  {
    id: '5',
    src: '/images/image5.jpg',
    alt: 'Image 5',
    defaultPosition: { x: 350, y: 1500 },
    width: 300,
    height: 300,
  },
];

const TEXT_BLOCKS = [
  {
    id: 't1',
    content: 'The architecture of memory shapes our understanding of the past. Each moment leaves an imprint, a trace of what was and what could have been. The way we remember influences how we move forward, creating patterns that echo through time.',
    defaultPosition: { x: 100, y: 100 },
    width: 300,
  },
  {
    id: 't2',
    content: 'Light bends differently through city windows at dawn. The glass and steel create prisms that scatter morning rays across empty streets. In these quiet moments, the urban landscape transforms into something almost organic.',
    defaultPosition: { x: 500, y: 400 },
    width: 300,
  },
  {
    id: 't3',
    content: 'Digital spaces have their own kind of gravity. We orbit around streams of information, pulled by invisible forces of connection. The boundaries between virtual and physical continue to blur, creating new territories of experience. Each click echoes into this expanding universe.',
    defaultPosition: { x: 750, y: 850 },
    width: 300,
  },
  {
    id: 't4',
    content: 'Time moves differently in spaces of transition. Train stations, airports, and empty corridors hold a unique kind of stillness. These in-between places remind us that every journey is both an ending and a beginning. The liminal space becomes its own destination.',
    defaultPosition: { x: 150, y: 1100 },
    width: 300,
  },
];

interface ImageItem {
  id: string;
  src: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  isExpanded?: boolean;
}

interface TextBlock {
  id: string;
  content: string;
  position: { x: number; y: number };
  width: number;
}

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
        {images.map((image) => {
          const nodeRef = useRef(null);
          const scale = image.isExpanded ? 1.5 : 1;
          
          return (
            <Draggable
              key={image.id}
              nodeRef={nodeRef}
              position={image.position}
              onStart={() => setIsDragging(true)}
              onStop={() => setIsDragging(false)}
              onDrag={(e, data) => {
                const updatedImages = images.map((img) =>
                  img.id === image.id
                    ? { ...img, position: { x: data.x, y: data.y } }
                    : img
                );
                setImages(updatedImages);
              }}
            >
              <div 
                ref={nodeRef}
                className="fixed hover:shadow-lg"
                style={{
                  width: image.width * scale,
                  height: image.height * scale,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  border: '4px solid transparent',
                  position: 'absolute',
                  transform: 'none',
                  transition: isDragging ? 'none' : 'width 0.3s ease-in-out, height 0.3s ease-in-out',
                  zIndex: image.isExpanded ? 10 : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '4px solid black';
                  setHoveredImage(image.id);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '4px solid transparent';
                  setHoveredImage(null);
                }}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ 
                    objectFit: 'cover',
                    userSelect: 'none',
                    zIndex: -1,
                  }}
                  draggable={false}
                />
                {hoveredImage === image.id && (
                  <button
                    className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-sm rounded z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(image.id);
                    }}
                  >
                    {image.isExpanded ? 'shrink' : 'expand'}
                  </button>
                )}
              </div>
            </Draggable>
          );
        })}

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
