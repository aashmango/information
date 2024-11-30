import { ImageItem, TextBlock, VideoItem } from '@/types';
import { CSSProperties, useState, useEffect } from 'react';

interface MinimapProps {
  images: ImageItem[];
  textBlocks: TextBlock[];
  videos: VideoItem[];
  showImages: boolean;
  showText: boolean;
  showVideos: boolean;
  scrollPosition: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  zoomLevel: number;
}

export default function Minimap({ images, textBlocks, videos, showImages, showText, showVideos, scrollPosition, containerWidth, containerHeight, zoomLevel }: MinimapProps) {
  const [viewportWidth, setViewportWidth] = useState(5000);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth);

      const handleResize = () => {
        setViewportWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const getBounds = () => {
    if (typeof window === 'undefined') {
      return { maxX: 0, maxY: 0, minX: 0, minY: 0 };
    }
    const allItems = [
      ...(showImages ? images : []),
      ...(showText ? textBlocks : []),
      ...(showVideos ? videos : [])
    ];

    if (allItems.length === 0) {
      return {
        maxX: window.innerWidth,
        maxY: window.innerHeight,
        minX: 0,
        minY: 0
      };
    }

    return allItems.reduce((bounds, item) => {
      const width = item.width;
      const height = width / (item.aspectRatio || 1);
      
      return {
        maxX: Math.max(bounds.maxX, item.current_position.x + width),
        maxY: Math.max(bounds.maxY, item.current_position.y + height),
        minX: Math.min(bounds.minX, item.current_position.x),
        minY: Math.min(bounds.minY, item.current_position.y),
      };
    }, { maxX: 0, maxY: 0, minX: Infinity, minY: Infinity });
  };

  const bounds = getBounds();
  const contentWidth = Math.max(bounds.maxX - bounds.minX, typeof window !== 'undefined' ? window.innerWidth : 0);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, typeof window !== 'undefined' ? window.innerHeight : 0);

  const scaleX = containerWidth / contentWidth;
  const scaleY = containerHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY);

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
    pointerEvents: 'all',
  };

  return (
    <div style={minimapStyle}>
      {showImages && images.map(image => {
        const aspectRatio = image.aspectRatio || 1;
        const width = (image.isExpanded ? 600 : 300) * scale;
        const height = width / aspectRatio;
        return (
          <div
            key={image.id}
            style={{
              position: 'absolute',
              left: `${image.current_position.x * scale}px`,
              top: `${image.current_position.y * scale}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: '#007AFF',
              opacity: 0.5,
            }}
          />
        );
      })}

      {showVideos && videos.map(video => {
        const aspectRatio = video.aspectRatio || 1;
        const width = (video.isExpanded ? 600 : 300) * scale;
        const height = width / aspectRatio;
        return (
          <div
            key={video.id}
            style={{
              position: 'absolute',
              left: `${video.current_position.x * scale}px`,
              top: `${video.current_position.y * scale}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: '#FF3B30',
              opacity: 0.5,
            }}
          />
        );
      })}

      {showText && textBlocks.map(text => {
        const aspectRatio = text.aspectRatio || 2;
        const width = 300 * scale;
        const height = width / aspectRatio;
        return (
          <div
            key={text.id}
            style={{
              position: 'absolute',
              left: `${text.current_position.x * scale}px`,
              top: `${text.current_position.y * scale}px`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: '#FF9500',
              opacity: 0.5,
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: `${(scrollPosition.x / zoomLevel) * scale}px`,
          top: `${(scrollPosition.y / zoomLevel) * scale}px`,
          width: `${(window.innerWidth / zoomLevel) * scale}px`,
          height: `${(window.innerHeight / zoomLevel) * scale}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}