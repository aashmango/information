import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import Image from 'next/image';
import { ImageItem, DraggableProps } from '@/types';

interface Props extends DraggableProps {
  image: ImageItem;
  className?: string;
  onToggleSize?: () => void;
  onDescriptionChange?: (newDescription: string) => void;
}

export default function DraggableImage({ 
  image, 
  position, 
  onPositionChange, 
  id, 
  className,
  onToggleSize,
  onDescriptionChange = () => {}
}: Props) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Define dimensions based on expanded state
  const dimensions = {
    thumbnail: { width: 300, height: Math.round(300 * (image.height / image.width)) },
    expanded: { width: 600, height: Math.round(600 * (image.height / image.width)) }
  };

  const currentDimensions = image.isExpanded ? dimensions.expanded : dimensions.thumbnail;
  const currentSrc = image.isExpanded ? (image.original_url || image.src) : (image.thumbnail_url || image.src);

  // Handle clicks outside the component to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nodeRef]);

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
            transition: 'box-shadow 0.2s ease-in-out',
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
            src={currentSrc}
            alt={image.alt}
            width={currentDimensions.width}
            height={currentDimensions.height}
            className="rounded-lg select-none"
            style={{ maxWidth: '100%', height: 'auto' }}
            draggable={false}
            priority={image.isExpanded}
          />
          <div className="w-full flex justify-between items-center">
            {!isEditing ? (
              <div 
                className="!text-xs text-gray-700"
                style={{ 
                  fontSize: '0.75rem', 
                  cursor: 'pointer', 
                  maxWidth: `${currentDimensions.width}px`, 
                  lineHeight: '1.5', 
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap', // Preserve line breaks
                  overflowWrap: 'break-word', // Break long words
                  minHeight: '1.5em', // Ensure consistent height
                  color: '#A0A0A0' // Muted gray color
                }}
                onClick={() => setIsEditing(true)}
              >
                {image.description}
              </div>
            ) : (
              <textarea
                value={image.description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Edit description"
                style={{ 
                  width: `${currentDimensions.width}px`, 
                  marginTop: '8px',
                  lineHeight: '1.5', // Match line height
                  minHeight: '1.5em', // Ensure consistent height
                  resize: 'none', // Disable manual resizing
                  overflow: 'hidden', // Hide overflow to prevent scrollbars
                  fontSize: '0.75rem' // Explicitly set font size to match the div
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto'; // Reset height
                  target.style.height = `${target.scrollHeight}px`; // Set to scroll height
                }}
              />
            )}
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
                {image.isExpanded ? 'Small' : 'Big'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Draggable>
  );
}