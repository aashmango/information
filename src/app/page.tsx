'use client';
import { useState, useEffect } from 'react';
import { Block } from '@/types';
import { BlockContent } from '@/components/blocks/BlockContent';
import { DraggableBlock } from '@/components/DraggableBlock';
const INITIAL_BLOCKS: Block[] = [
  {
    id: '1',
    type: 'image',
    src: '/images/image1.jpg',
    position: { x: 800, y: 200 },
    width: 300,
    height: 400,
  },
  {
    id: 't1',
    type: 'text',
    content: 'The architecture of memory...',
    position: { x: 100, y: 100 },
    width: 300,
  },
  {
    id: 'v1',
    type: 'video',
    url: 'https://www.youtube.com/embed/...',
    position: { x: 400, y: 300 },
    width: 560,
    height: 315,
  },
];

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBlocks(blocks.map(block => {
          if (block.type === 'image') {
            return { ...block, isExpanded: false };
          }
          return block;
        }));
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [blocks]);

  const handleDrag = (id: string, x: number, y: number) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, position: { x, y } } : block
    ));
  };

  const handleAction = (id: string, action: string) => {
    setBlocks(blocks.map(block => {
      if (block.id !== id) return block;

      switch (action) {
        case 'toggle-expand':
          return block.type === 'image' 
            ? { ...block, isExpanded: !block.isExpanded }
            : block;
        case 'toggle-play':
          return block.type === 'video'
            ? { ...block, isPlaying: !block.isPlaying }
            : block;
        default:
          return block;
      }
    }));
  };

  return (
    <main className="min-h-screen">
      <div className="relative w-full overflow-visible">
        {blocks.map((block) => (
          <DraggableBlock
            key={block.id}
            block={block}
            isDragging={isDragging}
            hoveredId={hoveredId}
            onDrag={handleDrag}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onHover={setHoveredId}
            onAction={handleAction}
          />
        ))}
      </div>
    </main>
  );
}
