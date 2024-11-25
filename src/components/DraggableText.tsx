import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { TextBlock, DraggableProps } from '@/types';

interface Props extends DraggableProps {
  text: TextBlock;
}

export default function DraggableText({ text, position, onPositionChange, id }: Props) {
  const nodeRef = useRef(null);
  const [localPosition, setLocalPosition] = useState(position);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={localPosition}
      onStop={(_, data) => {
        const newPosition = { x: data.x, y: data.y };
        setLocalPosition(newPosition);
        onPositionChange(newPosition);
      }}
      handle=".handle"
    >
      <div 
        ref={nodeRef} 
        style={{ position: 'absolute' }}
        className="cursor-move handle"
      >
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-black leading-relaxed">
            {text.content}
          </p>
        </div>
      </div>
    </Draggable>
  );
}