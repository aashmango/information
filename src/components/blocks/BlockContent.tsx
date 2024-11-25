import Image from 'next/image';
import { Block } from '@/types';

interface Props {
  block: Block;
  isDragging: boolean;
  isHovered: boolean;
  onAction?: (action: string) => void;
}

export function BlockContent({ block, isDragging, isHovered, onAction }: Props) {
  switch (block.type) {
    case 'image':
      return (
        <>
          <Image
            src={block.src}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ 
              objectFit: 'cover',
              userSelect: 'none',
              zIndex: -1,
            }}
            draggable={false}
          />
          {isHovered && (
            <button
              className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-sm rounded z-10"
              onClick={(e) => {
                e.stopPropagation();
                onAction?.('toggle-expand');
              }}
            >
              {block.isExpanded ? 'shrink' : 'expand'}
            </button>
          )}
        </>
      );

    case 'text':
      return (
        <p className="select-none text-black font-bold leading-relaxed m-0">
          {block.content}
        </p>
      );

    case 'video':
      return (
        <>
          <iframe
            src={block.url}
            width={block.width}
            height={block.height}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
          {isHovered && (
            <button
              className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-sm rounded z-10"
              onClick={(e) => {
                e.stopPropagation();
                onAction?.('toggle-play');
              }}
            >
              {block.isPlaying ? 'pause' : 'play'}
            </button>
          )}
        </>
      );
  }
}
