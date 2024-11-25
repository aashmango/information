'use client';
import { useRef } from 'react';
import Image from 'next/image';
import Draggable from 'react-draggable';
import { ImageItem } from '../types';

interface DraggableImageProps {
  image: ImageItem;
  isDragging: boolean;
  hoveredImage: string | null;
  onDragStart: () => void;
  onDragStop: () => void;
  onDrag: (id: string, x: number, y: number) => void;
  onHover: (id: string | null) => void;
  toggleExpand: (id: string) => void;
}

export function DraggableImage({
  image,
  isDragging,
  hoveredImage,
  onDragStart,
  onDragStop,
  onDrag,
  onHover,
  toggleExpand
}: DraggableImageProps) {
  const nodeRef = useRef(null);
  const scale = image.isExpanded ? 3 : 1;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={image.position}
      onStart={onDragStart}
      onStop={onDragStop}
      onDrag={(e, data) => onDrag(image.id, data.x, data.y)}
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
          onHover(image.id);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = '4px solid transparent';
          onHover(null);
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
}