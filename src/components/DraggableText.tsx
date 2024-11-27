import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { TextBlock, DraggableProps, Position } from '@/types';
import { useZIndex } from '@/utils/ZIndexContext';

interface Props extends DraggableProps {
  text: string;
  className?: string;
}

interface DraggableTextProps {
  id: string;
  text: string;
  position: Position;
  onPositionChange: (pos: Position) => void;
}

export default function DraggableText({ text, position, onPositionChange, id, className }: Props) {
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const { getNextZIndex } = useZIndex();

  const bringToFront = () => {
    setZIndex(getNextZIndex());
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      grid={[16, 16]}
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
        }}
        className={className}
        onClick={bringToFront}
        onMouseDown={bringToFront}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="select-none"
          style={{
            transition: 'transform 0.3s ease-in-out, box-shadow 0.2s ease-in-out',
            borderRadius: '2px',
            padding: '8px',
            border: `1px solid ${isHovered ? '#A0A0A0' : isDragging ? '#E5E5E5' : '#F0F0F0'}`,
            backgroundColor: 'white',
            zIndex: isDragging ? 1000 : 'auto',
            boxShadow: isHovered 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              : 'none',
          }}
        >
          <p 
            className="text-black leading-normal"
            style={{ 
              margin: 0,
              maxWidth: '300px',
              borderRadius: '0px'
            }}
          >
            {text}
          </p>
        </div>
      </div>
    </Draggable>
  );
}