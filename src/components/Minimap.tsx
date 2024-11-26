import { ImageItem, TextBlock } from '@/types';
import { CSSProperties, useState, useEffect } from 'react';

interface MinimapProps {
  images: ImageItem[];
  textBlocks: TextBlock[];
  showImages: boolean;
  showText: boolean;
  scrollPosition: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
}

export default function Minimap({ images, textBlocks, showImages, showText, scrollPosition, containerWidth, containerHeight }: MinimapProps) {
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
  const contentWidth = Math.max(bounds.maxX - bounds.minX, viewportWidth);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, 5000);

  // Calculate scale for width and height separately
  const scaleX = containerWidth / contentWidth;
  const scaleY = containerHeight / contentHeight;

  // Use scaleX for all calculations
  const scale = scaleX;

  // Log the content and container widths
  console.log('Content Width:', contentWidth);
  console.log('Container Width:', containerWidth);

  const minimapStyle: CSSProperties = {
    position: 'fixed',
    right: '20px',
    top: '20px',
    width: `${containerWidth}px`,
    height: `${containerHeight}px`,
    border: '1px solid #ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    zIndex: 1000,
  };

  return (
    <div style={minimapStyle}>
      {showImages && images.map(image => (
        <div
          key={image.id}
          style={{
            position: 'absolute',
            left: `${image.current_position.x * scaleX}px`,
            top: `${image.current_position.y * scaleX}px`,
            width: `${(image.isExpanded ? 300 : 150) * scaleX}px`,
            height: `${(image.isExpanded ? 300 : 150) * scaleX}px`,
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
            left: `${text.current_position.x * scaleX}px`,
            top: `${text.current_position.y * scaleX}px`,
            width: `${100 * scaleX}px`,
            height: `${50 * scaleX}px`,
            backgroundColor: '#FF9500',
            opacity: 0.5,
          }}
        />
      ))}

      {/* Viewport indicator */}
      <div
        style={{
          position: 'absolute',
          left: `${scrollPosition.x * scaleX}px`,
          top: `${scrollPosition.y * scaleX}px`,
          width: `${containerWidth}px`,
          height: `${window.innerHeight * scaleX}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}