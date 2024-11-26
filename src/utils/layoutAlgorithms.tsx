import { ImageItem, TextBlock, VideoItem, Position } from '@/types';

interface ItemWithDimensions {
  id: string;
  type: 'image' | 'video' | 'text';
  width: number;
  height: number;
  current_position: Position;
  isExpanded?: boolean;
}

const PADDING = 16;
const DEFAULT_TEXT_WIDTH = 200;
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
  const GRID_SIZE = 316; // 300 + 16 padding
  const positions: Position[] = [];
  const columnsPerRow = Math.floor((window.innerWidth - PADDING) / GRID_SIZE);

  items.forEach((_, index) => {
    const row = Math.floor(index / columnsPerRow);
    const col = index % columnsPerRow;

    positions.push({
      x: col * GRID_SIZE + PADDING,
      y: row * GRID_SIZE + PADDING
    });
  });

  return positions;
}

export function masonry(items: ItemWithDimensions[]): Position[] {
  const columns: { height: number; items: Position[] }[] = [];
  const COLUMN_WIDTH = 316; // 300 + 16 padding
  const numColumns = Math.floor((window.innerWidth - PADDING) / COLUMN_WIDTH);

  // Initialize columns
  for (let i = 0; i < numColumns; i++) {
    columns.push({ height: PADDING, items: [] });
  }

  // Place each item in the shortest column
  items.forEach((item) => {
    const shortestColumn = columns.reduce((min, col, index) => 
      col.height < columns[min].height ? index : min, 0);

    const position = {
      x: shortestColumn * COLUMN_WIDTH + PADDING,
      y: columns[shortestColumn].height
    };

    columns[shortestColumn].items.push(position);
    columns[shortestColumn].height += item.height + PADDING;
  });

  // Combine all positions in order
  return items.map((_, index) => {
    const columnIndex = index % numColumns;
    const itemIndex = Math.floor(index / numColumns);
    return columns[columnIndex].items[itemIndex] || { x: 0, y: 0 };
  });
}

export function compactLayout(items: ItemWithDimensions[]): Position[] {
  // Sort items by height to optimize space usage
  const sortedItems = [...items].sort((a, b) => b.height - a.height);
  const positions: Position[] = new Array(items.length);
  const containerWidth = window.innerWidth - PADDING * 2;
  
  // Track occupied spaces
  const spaces: { x: number; y: number; width: number; height: number }[] = [];

  sortedItems.forEach((item, sortedIndex) => {
    const originalIndex = items.findIndex(i => i.id === item.id);
    let bestPosition = { x: PADDING, y: PADDING };
    let minY = Infinity;

    // Find the best position for this item
    for (let x = PADDING; x <= containerWidth - item.width; x += PADDING) {
      let y = PADDING;
      let canPlace = true;

      // Check for overlaps with existing items
      spaces.forEach(space => {
        if (x < space.x + space.width && 
            x + item.width > space.x && 
            y < space.y + space.height) {
          y = space.y + space.height + PADDING;
        }
      });

      if (y + item.height <= window.innerHeight && y < minY) {
        canPlace = true;
        spaces.forEach(space => {
          if (x < space.x + space.width && 
              x + item.width > space.x && 
              y < space.y + space.height && 
              y + item.height > space.y) {
            canPlace = false;
          }
        });

        if (canPlace) {
          minY = y;
          bestPosition = { x, y };
        }
      }
    }

    // Add the placed item to occupied spaces
    spaces.push({
      x: bestPosition.x,
      y: bestPosition.y,
      width: item.width,
      height: item.height
    });

    positions[originalIndex] = bestPosition;
  });

  return positions;
}