import { useRef } from 'react';
import Draggable from 'react-draggable';
import { Block } from '@/types';
import { BlockContent } from './blocks/BlockContent';

interface Props {
  block: Block;
  isDragging: boolean;
  hoveredId: string | null;
  onDrag: (id: string, x: number, y: number) => void;
  onDragStart: () => void;
  onDragStop: () => void;
  onHover: (id: string | null) => void;
  onAction?: (id: string, action: string) => void;
}

export function DraggableBlock({
  block,
  isDragging,
  hoveredId,
  onDrag,
  onDragStart,
  onDragStop,
  onHover,
  onAction,
}: Props) {
  const nodeRef = useRef(null);
  const isHovered = hoveredId === block.id;

  const getStyles = () => {
    const baseStyles = {
      width: block.width,
      cursor: isDragging ? 'grabbing' : 'grab',
      position: 'absolute' as const,
      transform: 'none',
    };

    switch (block.type) {
      case 'image':
        const scale = block.isExpanded ? 1.5 : 1;
        return {
          ...baseStyles,
          height: block.height * scale,
          transition: isDragging ? 'none' : 'all 0.3s ease-in-out',
          zIndex: block.isExpanded ? 10 : 'auto',
        };
      
      case 'video':
        return {
          ...baseStyles,
          height: block.height,
          zIndex: 5,
        };

      case 'text':
        return {
          ...baseStyles,
          padding: '24px',
          zIndex: 5,
          backgroundColor: isHovered ? 'white' : 'transparent',
          boxShadow: isHovered ? '0 0 30px 10px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'background-color 0.2s, box-shadow 0.2s',
        };
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={block.position}
      onStart={onDragStart}
      onStop={onDragStop}
      onDrag={(e, data) => onDrag(block.id, data.x, data.y)}
    >
      <div 
        ref={nodeRef}
        className="fixed hover:shadow-lg rounded-lg"
        style={getStyles()}
        onMouseEnter={() => onHover(block.id)}
        onMouseLeave={() => onHover(null)}
      >
        <BlockContent
          block={block}
          isDragging={isDragging}
          isHovered={isHovered}
          onAction={(action) => onAction?.(block.id, action)}
        />
      </div>
    </Draggable>
  );
}
