import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import Image from 'next/image';
import { ImageItem, DraggableProps } from '@/types';

interface Props extends DraggableProps {
  image: ImageItem;
  className?: string;
  onToggleSize?: () => void;
}

export default function DraggableImage({ 
  image, 
  position, 
  onPositionChange, 
  id, 
  className,
  onToggleSize 
}: Props) {
  const nodeRef = useRef(null);
  const [localPosition, setLocalPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const scale = image.isExpanded ? 1.5 : 1;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={localPosition}
      onStart={() => setIsDragging(true)}
      onStop={() => {
        setIsDragging(false);
        onPositionChange(localPosition);
      }}
      onDrag={(_, data) => {
        const newPosition = { x: data.x, y: data.y };
        setLocalPosition(newPosition);
        onPositionChange(newPosition);
      }}
    >
      <div 
        ref={nodeRef} 
        className={`${className} pointer-events-auto`}
        style={{ 
          position: 'absolute',
          zIndex: isDragging ? 1001 : 1000,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
            outline: isHovered ? '2px solid #3b82f6' : 'none',
            outlineOffset: '4px',
          }}
          className="rounded-lg relative overflow-visible"
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.3s ease-in-out',
              transformOrigin: 'center center',
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="rounded-lg select-none"
              style={{ maxWidth: '100%', height: 'auto' }}
              draggable={false}
              priority
            />
          </div>
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSize?.();
              }}
              className="absolute bottom-2 left-2 text-xs bg-black/75 text-white px-2 py-1 rounded hover:bg-black/90 transition-colors"
              style={{
                transform: 'scale(1)',  // Force button to maintain size
                transformOrigin: 'bottom left',
              }}
            >
              {image.isExpanded ? 'Shrink' : 'Expand'}
            </button>
          )}
        </div>
      </div>
    </Draggable>
  );
}