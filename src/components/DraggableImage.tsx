import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import Image from 'next/image';
import { ImageItem, DraggableProps } from '@/types';

interface Props extends DraggableProps {
  image: ImageItem;
}

export default function DraggableImage({ image, position, onPositionChange, id }: Props) {
  const nodeRef = useRef(null);
  const [localPosition, setLocalPosition] = useState(position);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={localPosition}
      onStop={(e, data) => {
        const newPosition = { x: data.x, y: data.y };
        setLocalPosition(newPosition);
        onPositionChange(newPosition);
      }}
    >
      <div 
        ref={nodeRef} 
        style={{ 
          position: 'absolute',
          cursor: 'move',
          zIndex: 1000
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="rounded-lg"
          draggable={false}
          priority
        />
      </div>
    </Draggable>
  );
}