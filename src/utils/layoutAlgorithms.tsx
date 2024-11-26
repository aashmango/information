import { ImageItem, TextBlock, VideoItem, Position } from '@/types';

interface ItemWithDimensions {
  id: string;
  type: 'image' | 'video' | 'text';
  width: number;
  height: number;
  current_position: Position;
  isExpanded?: boolean;
}

export const DESCRIPTION_MIN_HEIGHT = 24;
export const DESCRIPTION_LINE_HEIGHT = 18;
export const PADDING = 32;
export const DEFAULT_TEXT_WIDTH = 300;
export const DEFAULT_TEXT_HEIGHT = 100;

export function calculateDescriptionHeight(description?: string): number {
  if (!description) return DESCRIPTION_MIN_HEIGHT;
  
  // Estimate number of lines based on character count and container width
  // Assuming roughly 50 characters per line for 300px width
  const charsPerLine = 50;
  const lines = Math.ceil(description.length / charsPerLine);
  return DESCRIPTION_MIN_HEIGHT + (lines * DESCRIPTION_LINE_HEIGHT);
}

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

  const baseWidth = item.isExpanded ? 600 : 300;
  const mediaHeight = item.isExpanded ? 
    Math.round(600 * (item.height / item.width)) : 
    Math.round(300 * (item.height / item.width));
  
  // Add description height to total height
  const descriptionHeight = calculateDescriptionHeight(item.description);
  const totalHeight = mediaHeight + descriptionHeight + PADDING;

  if ('type' in item && item.type === 'video') { // VideoItem
    return {
      id: item.id,
      type: 'video',
      width: baseWidth,
      height: totalHeight,
      current_position: item.current_position,
      isExpanded: item.isExpanded
    };
  }

  // ImageItem
  return {
    id: item.id,
    type: 'image',
    width: baseWidth,
    height: totalHeight,
    current_position: item.current_position,
    isExpanded: item.isExpanded
  };
}

export function gridLayout(items: ItemWithDimensions[]): Position[] {
  const COLUMN_GAP = 60;
  const ROW_GAP = 40;
  const COLUMN_WIDTH = 300;
  const containerWidth = window.innerWidth;
  
  // Calculate the number of columns that can fit in the container
  const columnCount = Math.max(1, Math.floor((containerWidth + COLUMN_GAP) / (COLUMN_WIDTH + COLUMN_GAP)));
  
  // Initialize columns with their starting heights
  const columns: number[] = new Array(columnCount).fill(ROW_GAP);
  const positions: Position[] = [];

  // Calculate starting X position to center the grid
  const totalWidth = (columnCount * COLUMN_WIDTH) + ((columnCount - 1) * COLUMN_GAP);
  const startX = (containerWidth - totalWidth) / 2;

  items.forEach((item) => {
    // Find the shortest column
    const shortestColumnIndex = columns.indexOf(Math.min(...columns));
    
    // Calculate position
    const x = startX + shortestColumnIndex * (COLUMN_WIDTH + COLUMN_GAP);
    const y = columns[shortestColumnIndex];
    
    positions.push({ x, y });
    
    // Update column height
    columns[shortestColumnIndex] = y + item.height + ROW_GAP;
  });

  return positions;
} 