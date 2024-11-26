import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { TextBlock, DraggableProps } from '@/types';

interface Props extends DraggableProps {
  text: TextBlock;
  className?: string;
}

export default function DraggableText({ text, position, onPositionChange, id, className }: Props) {
  const nodeRef = useRef(null);
  const [localPosition, setLocalPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={localPosition}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      onDrag={(_, data) => {
        const newPosition = { x: data.x, y: data.y };
        setLocalPosition(newPosition);
        onPositionChange(newPosition);
      }}
    >
      <div 
        ref={nodeRef} 
        style={{ 
          position: 'absolute',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="bg-gray-50 rounded-full select-none"
          style={{
            transition: 'all 0.1s ease-in-out',
            border: isHovered ? '1px solid #E5E5E5' : 'none',
            borderRadius: '2px',
            padding: '4px',
            backgroundColor: isHovered ? 'white' : 'transparent',
            zIndex: isDragging ? 1000 : 'auto',
          }}
        >
          <p 
            className="text-black leading-relaxed p-8 border-2 border-gray-200 rounded-full"
            style={{ 
              margin: 0,
              maxWidth: '300px' 
            }}
          >
            {text.content}
          </p>
        </div>
      </div>
    </Draggable>
  );
}