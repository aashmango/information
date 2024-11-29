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
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            boxShadow: isHovered 
              ? '0 0px 50px rgba(0, 0, 0, 0.15)'
              : 'none',
            overflow: 'hidden',
          }}
          className="flex flex-col"
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
          <div className="w-full flex flex-col">
            <div className="flex justify-end">
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSize?.();
                  }}
                  className="!text-xs transition-colors"
                  style={{
                    fontSize: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '20px',
                    padding: '3px 8px',
                    margin: 0,
                    background: '#fff',
                    cursor: 'pointer',
                    color: '#000',
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {image.isExpanded ? 'Small' : 'Big'}
                </button>
              )}
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
                  color: '#A0A0A0',
                  padding: '8px'
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