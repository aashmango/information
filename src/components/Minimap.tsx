import { ImageItem, TextBlock } from '@/types';
import { CSSProperties, useState, useEffect } from 'react';

interface MinimapProps {
  images: ImageItem[];
  textBlocks: TextBlock[];
  showImages: boolean;
  showText: boolean;
}

export default function Minimap({ images, textBlocks, showImages, showText }: MinimapProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 5000
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBounds = () => {
    const allItems = [
      ...(showImages ? images : []),
      ...(showText ? textBlocks : [])
    ];

    if (allItems.length === 0) return { maxX: 0, maxY: 0, minX: 0, minY: 0 };

    return allItems.reduce((bounds, item) => {
      const width = 'isExpanded' in item ? (item.isExpanded ? 300 : 150) : 100;
      const height = 'isExpanded' in item ? (item.isExpanded ? 300 : 150) : 50;
      
      return {
        maxX: Math.max(bounds.maxX, item.current_position.x + width),
        maxY: Math.max(bounds.maxY, item.current_position.y + height),
        minX: Math.min(bounds.minX, item.current_position.x),
        minY: Math.min(bounds.minY, item.current_position.y),
      };
    }, { maxX: 0, maxY: 0, minX: Infinity, minY: Infinity });
  };

  const bounds = getBounds();
  // Use viewport width and fixed height for the canvas size
  const contentWidth = Math.max(bounds.maxX - bounds.minX + 32, viewportWidth);
  const contentHeight = Math.max(bounds.maxY - bounds.minY + 32, 5000);

  // Calculate scale to fit in the minimap container
  const containerWidth = 200;
  const containerHeight = 300;
  const scale = Math.min(
    containerWidth / contentWidth,
    containerHeight / contentHeight
  ) * 0.9;

  const minimapStyle: CSSProperties = {
    position: 'fixed',
    right: '20px',
    top: '20px',
    width: '200px',
    height: '300px',
    border: '1px solid #ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    zIndex: 1000,
  };

  const contentStyle: CSSProperties = {
    position: 'absolute',
    width: `${contentWidth * scale}px`,
    height: `${contentHeight * scale}px`,
    backgroundImage: `radial-gradient(#CCCCCC 1px, transparent 1px)`,
    backgroundSize: `${16 * scale}px ${16 * scale}px`,
    transform: `translate(${-bounds.minX * scale}px, ${-bounds.minY * scale}px)`,
    transformOrigin: '0 0',
  };

  return (
    <div style={minimapStyle}>
      <div style={contentStyle}>
        {showImages && images.map(image => (
          <div
            key={image.id}
            style={{
              position: 'absolute',
              left: `${image.current_position.x * scale}px`,
              top: `${image.current_position.y * scale}px`,
              width: `${(image.isExpanded ? 300 : 150) * scale}px`,
              height: `${(image.isExpanded ? 300 : 150) * scale}px`,
              backgroundColor: '#007AFF',
              opacity: 0.5,
            }}
          />
        ))}
        {showText && textBlocks.map(text => (
          <div
            key={text.id}
            style={{
              position: 'absolute',
              left: `${text.current_position.x * scale}px`,
              top: `${text.current_position.y * scale}px`,
              width: `${100 * scale}px`,
              height: `${50 * scale}px`,
              backgroundColor: '#FF9500',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}