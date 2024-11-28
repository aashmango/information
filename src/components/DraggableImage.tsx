import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import Image from 'next/image';
import { ImageItem, DraggableProps } from '@/types';
import { useZIndex } from '@/utils/ZIndexContext';

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
  const [isActive, setIsActive] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const { getNextZIndex } = useZIndex();

  // Define dimensions based on expanded state
  const dimensions = {
    thumbnail: { width: 300, height: Math.round(300 * (image.height / image.width)) },
    expanded: { width: 600, height: Math.round(600 * (image.height / image.width)) }
  };

  const currentDimensions = image.isExpanded ? dimensions.expanded : dimensions.thumbnail;
  const currentSrc = image.isExpanded ? (image.original_url || image.src) : (image.thumbnail_url || image.src);

  // At the top of the component, update the transition style to be more specific
  const transitionStyle = {
    transition: 'width 0.2s ease-out, height 0.2s ease-out',
    willChange: 'width, height' // Optimize for animations
  };

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

  const bringToFront = () => {
    setZIndex(getNextZIndex());
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      grid={[16, 16]}
      offsetParent={document.body}
      scale={1}
      onStart={() => {
        setIsDragging(true);
        bringToFront(); // Bring to front when starting drag
      }}
      onStop={() => {
        setIsDragging(false);
      }}
      onDrag={(_, data) => {
        onPositionChange({ x: data.x, y: data.y });
      }}
    >
      <div 
        ref={nodeRef} 
        style={{ 
          position: 'absolute',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex, // Use the managed zIndex instead of isActive
          backgroundColor: 'white',
          transform: `translate(${position.x}px, ${position.y}px)`, // Explicit transform
          transition: 'none', // Prevent transition during drag
        }}
        className={className}
        onClick={bringToFront} // Bring to front on click
        onMouseDown={bringToFront} // Also bring to front on mouse down
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            transition: 'box-shadow 0.2s ease-in-out',
            borderRadius: '2px',
            padding: '8px',
            border: '1px solid #F0F0F0',
            backgroundColor: 'white',
            boxShadow: isHovered 
              ? 'shadow-lg'
              : 'shadow-none',
          }}
          className="flex flex-col gap-2"
        >
          <Image
            src={currentSrc}
            alt={image.alt}
            width={currentDimensions.width}
            height={currentDimensions.height}
            className="select-none"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              transition: 'all 0.2s ease-out',
              willChange: 'width, height'
            }}
            draggable={false}
            priority={image.isExpanded}
          />
          <div className="w-full flex flex-col gap-1">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSize?.();
                }}
                className="!text-xs transition-colors"
                style={{
                  fontSize: '0.75rem',
                  border: 'none',
                  borderBottom: !image.isExpanded ? '1px solid currentColor' : 'none',
                  padding: 0,
                  margin: 0,
                  background: 'none',
                  cursor: 'pointer',
                  color: !image.isExpanded ? '#000' : '#A0A0A0',
                }}
                onMouseEnter={(e) => {
                  if (image.isExpanded) {
                    e.currentTarget.style.borderBottom = '1px solid #E5E5E5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (image.isExpanded) {
                    e.currentTarget.style.borderBottom = 'none';
                  }
                }}
              >
                Small
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSize?.();
                }}
                className="!text-xs transition-colors"
                style={{
                  fontSize: '0.75rem',
                  border: 'none',
                  borderBottom: image.isExpanded ? '1px solid currentColor' : 'none',
                  padding: 0,
                  margin: 0,
                  background: 'none',
                  cursor: 'pointer',
                  color: image.isExpanded ? '#000' : '#A0A0A0',
                }}
                onMouseEnter={(e) => {
                  if (!image.isExpanded) {
                    e.currentTarget.style.borderBottom = '1px solid #E5E5E5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!image.isExpanded) {
                    e.currentTarget.style.borderBottom = 'none';
                  }
                }}
              >
                Big
              </button>
            </div>
            {!isEditing ? (
              <div 
                className="!text-xs text-gray-700"
                style={{ 
                  fontSize: '0.75rem', 
                  cursor: 'pointer', 
                  maxWidth: `${currentDimensions.width}px`, 
                  lineHeight: '1.5', 
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  minHeight: '1.5em',
                  color: '#A0A0A0'
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
          </div>
        </div>
      </div>
    </Draggable>
  );
}