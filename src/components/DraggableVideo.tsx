import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { VideoItem, DraggableProps } from '@/types';
import { useZIndex } from '@/utils/ZIndexContext';

interface Props extends DraggableProps {
  video: VideoItem;
  className?: string;
  onToggleSize?: () => void;
  onDescriptionChange?: (newDescription: string) => void;
}

export default function DraggableVideo({ 
  video, 
  position, 
  onPositionChange, 
  id, 
  className,
  onToggleSize,
  onDescriptionChange = () => {},
}: Props) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const { getNextZIndex } = useZIndex();

  // Define dimensions based on expanded state
  const dimensions = {
    thumbnail: { width: 300, height: Math.round(300 * (video.height / video.width)) },
    expanded: { width: 600, height: Math.round(600 * (video.height / video.width)) }
  };

  const currentDimensions = video.isExpanded ? dimensions.expanded : dimensions.thumbnail;

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
      onStart={() => {
        setIsDragging(true);
        bringToFront();
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
          zIndex,
          backgroundColor: 'white',
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'none',
        }}
        className={className}
        onClick={bringToFront}
        onMouseDown={bringToFront}
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
            overflow: 'hidden'
          }}
          className="flex flex-col gap-2"
        >
          <video
            ref={videoRef}
            src={video.src}
            width={currentDimensions.width}
            height={currentDimensions.height}
            autoPlay
            loop
            muted
            playsInline
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              transition: 'all 0.2s ease-out',
              willChange: 'width, height'
            }}
          />
          <div className="w-full flex flex-col gap-1">
            <div className="flex justify-end">
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSize?.();
                  }}
                  className="!text-xs transition-colors"
                  style={{
                    fontSize: '10px',
                    border: '1px solid #E0E0E0',
                    padding: '2px 4px',
                    margin: 0,
                    background: 'white',
                    cursor: 'pointer',
                    color: '#000',
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {video.isExpanded ? 'Small' : 'Big'}
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
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  minHeight: '1.5em',
                  color: '#A0A0A0'
                }}
                onClick={() => setIsEditing(true)}
              >
                {video.description}
              </div>
            ) : (
              <textarea
                value={video.description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Edit description"
                style={{ 
                  width: `${currentDimensions.width}px`, 
                  marginTop: '8px',
                  lineHeight: '1.5',
                  minHeight: '1.5em',
                  resize: 'none',
                  overflow: 'hidden',
                  fontSize: '0.75rem'
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Draggable>
  );
}