import { ImageItem, TextBlock, VideoItem, Position } from '@/types';

interface ItemWithDimensions {
  id: string;
  type: 'image' | 'video' | 'text';
  width: number;
  height: number;
  current_position: Position;
  isExpanded?: boolean;
}

const PADDING = 32; // Space between items
const COLUMN_WIDTH = 300; // Fixed column width
const DEFAULT_TEXT_WIDTH = COLUMN_WIDTH;
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
    const width = COLUMN_WIDTH;
    const height = Math.round(width * (item.height / item.width));
    return {
      id: item.id,
      type: 'video',
      width,
      height,
      current_position: item.current_position,
      isExpanded: item.isExpanded
    };
  }

  // ImageItem
  const image = item as ImageItem;
  const width = COLUMN_WIDTH;
  const height = Math.round(width * (image.height / image.width));
  return {
    id: image.id,
    type: 'image',
    width,
    height,
    current_position: image.current_position,
    isExpanded: image.isExpanded
  };
}

export function gridLayout(items: ItemWithDimensions[]): Position[] {
  const containerWidth = window.innerWidth - PADDING * 2;
  const columnCount = Math.floor(containerWidth / (COLUMN_WIDTH + PADDING));
  const columns = Array(columnCount).fill(0); // Track height of each column
  const positions: Position[] = [];

  items.forEach((item) => {
    // Find the shortest column
    const shortestColumnIndex = columns.indexOf(Math.min(...columns));
    
    // Calculate position
    const x = PADDING + shortestColumnIndex * (COLUMN_WIDTH + PADDING);
    const y = columns[shortestColumnIndex] + (columns[shortestColumnIndex] > 0 ? PADDING : 0);
    
    // Update column height
    columns[shortestColumnIndex] = y + item.height;
    
    // Store position
    positions.push({ x, y });
  });

  return positions;
} 