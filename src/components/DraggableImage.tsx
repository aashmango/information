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
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const scale = image.isExpanded ? 1.5 : 1;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      grid={[16, 16]}
      offsetParent={document.body}
      scale={1}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      onDrag={(_, data) => {
        onPositionChange({ x: data.x, y: data.y });
      }}
    >
      <div 
        ref={nodeRef} 
        style={{ 
          position: 'absolute',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: isDragging ? 1000 : 'auto',
          backgroundColor: 'white',
        }}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.2s ease-in-out',
            transformOrigin: 'bottom right',
            borderRadius: '2px',
            padding: '8px',
            border: `1px solid ${isHovered ? '#A0A0A0' : isDragging ? '#E5E5E5' : '#F0F0F0'}`,
            backgroundColor: 'white',
            boxShadow: isHovered 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              : 'none',
          }}
          className="flex flex-col gap-2"
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
          <div className="w-full flex justify-between items-center">
            <div 
              className="!text-xs text-gray-700"
              style={{ fontSize: '0.75rem' }}
            >
              {image.description}
            </div>
            {isHovered && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSize?.();
                }}
                className="!text-xs text-gray-700 hover:text-black transition-colors"
                style={{
                  fontSize: '0.75rem',
                  border: 'none',
                  borderBottom: '1px solid currentColor',
                  padding: 0,
                  margin: 0,
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                {image.isExpanded ? 'Shrink' : 'Expand'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Draggable>
  );
}