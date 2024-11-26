import { ImageItem, TextBlock, VideoItem, Position } from '@/types';

interface ItemWithDimensions {
  id: string;
  type: 'image' | 'video' | 'text';
  width: number;
  height: number;
  current_position: Position;
  isExpanded?: boolean;
}

const PADDING = 32;
const DEFAULT_TEXT_WIDTH = 300;
const DEFAULT_TEXT_HEIGHT = 100;

export function getItemDimensions(item: ImageItem | VideoItem | TextBlock): ItemWithDimensions {
  if ('content' in item) { // TextBlock
    return {
      id: item.id,
      type: 'text',
      width: DEFAULT_TEXT_WIDTH,
      height: DEFAULT_TEXT_HEIGHT,
      current_position: item.current_position
    };
  }

  if ('type' in item && item.type === 'video') { // VideoItem
    return {
      id: item.id,
      type: 'video',
      width: item.isExpanded ? 600 : 300,
      height: item.isExpanded ? 
        Math.round(600 * (item.height / item.width)) : 
        Math.round(300 * (item.height / item.width)),
      current_position: item.current_position,
      isExpanded: item.isExpanded
    };
  }

  // ImageItem
  const image = item as ImageItem;
  return {
    id: image.id,
    type: 'image',
    width: image.isExpanded ? 600 : 300,
    height: image.isExpanded ? 
      Math.round(600 * (image.height / image.width)) : 
      Math.round(300 * (image.height / image.width)),
    current_position: image.current_position,
    isExpanded: image.isExpanded
  };
}

export function gridLayout(items: ItemWithDimensions[]): Position[] {
  const COLUMN_GAP = 32;
  const COLUMN_WIDTH = 300;
  const containerWidth = window.innerWidth - COLUMN_GAP * 2;
  const columnCount = Math.floor(containerWidth / (COLUMN_WIDTH + COLUMN_GAP));
  
  // Initialize columns with their starting heights
  const columns: number[] = new Array(columnCount).fill(COLUMN_GAP);
  const positions: Position[] = [];

  // Calculate starting X position to center the columns
  const totalWidth = columnCount * COLUMN_WIDTH + (columnCount - 1) * COLUMN_GAP;
  const startX = (containerWidth - totalWidth) / 2 + COLUMN_GAP;

  items.forEach((item) => {
    // Find the shortest column
    const shortestColumnIndex = columns.indexOf(Math.min(...columns));
    
    // Calculate position
    const x = startX + shortestColumnIndex * (COLUMN_WIDTH + COLUMN_GAP);
    const y = columns[shortestColumnIndex];
    
    // Add position
    positions.push({ x, y });
    
    // Update column height
    columns[shortestColumnIndex] = y + item.height + COLUMN_GAP;
  });

  return positions;
} 