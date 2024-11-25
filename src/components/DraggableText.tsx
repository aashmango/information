'use client';
import { useRef } from 'react';
import Draggable from 'react-draggable';
import { TextBlock } from '../types';

interface DraggableTextProps {
  text: TextBlock;
  isDragging: boolean;
  onDragStart: () => void;
  onDragStop: () => void;
  onDrag: (id: string, x: number, y: number) => void;
}

export default function DraggableText({
  text,
  isDragging,
  onDragStart,
  onDragStop,
  onDrag,
}: DraggableTextProps) {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={text.current_position}
      onStart={onDragStart}
      onStop={onDragStop}
      onDrag={(e, data) => onDrag(text.id, data.x, data.y)}
    >
      <div 
        ref={nodeRef}
        className="absolute rounded-lg transition-all duration-200"
        style={{
          width: text.width,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 5,
          padding: '24px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.boxShadow = '0 0 30px 10px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <p className="select-none text-black font-bold leading-relaxed m-0">
          {text.content}
        </p>
      </div>
    </Draggable>
  );
}