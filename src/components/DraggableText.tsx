import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Position } from '@/types';
import { useZIndex } from '@/utils/ZIndexContext';

interface Props {
  id: string;
  text: string;
  position: Position;
  onPositionChange: (position: Position) => void;
  onTextChange: (newText: string) => void;
  onDelete: () => void;
  zoomLevel: number;
}

export default function DraggableText({ 
  text, 
  position, 
  onPositionChange,
  onTextChange,
  onDelete,
  zoomLevel
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const { getNextZIndex } = useZIndex();

  const bringToFront = () => {
    setZIndex(getNextZIndex());
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    bringToFront();
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  // Prevent dragging when in edit mode
  const dragHandlers = isEditing ? { onStart: () => false as const } : {
    onStart: () => {
      setIsDragging(true);
      bringToFront();
    },
    onStop: () => setIsDragging(false),
    onDrag: (_: any, data: { x: number; y: number }) => {
      onPositionChange({ x: data.x, y: data.y });
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      grid={[16, 16]}
      scale={zoomLevel}
      {...dragHandlers}
    >
      <div
        ref={nodeRef}
        style={{
          position: 'absolute',
          cursor: isEditing ? 'default' : isDragging ? 'grabbing' : 'grab',
          zIndex,
          width: '300px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            transition: 'box-shadow 0.2s ease-in-out',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            backgroundColor: 'white',
            boxShadow: isHovered 
              ? '0 0px 50px rgba(0, 0, 0, 0.15)'
              : 'none',
            overflow: 'hidden',

          }}
        >
          {!isEditing ? (
            <div
              className="text-sm leading-relaxed"
              style={{
                minHeight: '24px',
                whiteSpace: 'pre-wrap',
                userSelect: 'none',
              }}
            >
              {text}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={handleBlur}
              className="text-sm leading-relaxed"
              style={{
                width: '100%',
                minHeight: '24px',
                padding: '0',
                border: 'none',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {isHovered && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#ff4444',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </Draggable>
  );
}