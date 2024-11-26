export interface Position {
  x: number;
  y: number;
}

export interface ImageItem {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  current_position: Position;
  default_position: Position;
  isExpanded?: boolean;
  description?: string;
  thumbnail_url?: string;
  original_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export interface TextBlock {
  id: string;
  content: string;
  width: number;
  current_position: Position;
  default_position: Position;
}

export interface DatabaseImage {
  id: string;
  src: string;
  alt: string;
  default_position_x: number;
  default_position_y: number;
  current_position?: Position;
  width: number;
  height: number;
  created_at: string;
  description?: string;
  thumbnail_url?: string;
  original_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export interface DatabaseText {
  id: string;
  content: string;
  default_position_x: number;
  default_position_y: number;
  current_position?: Position;
  width: number;
  created_at: string;
}

export interface DraggableProps {
  position: Position;
  onPositionChange: (newPosition: Position) => void;
  id: string;
  className?: string;
}

export interface SavePositionsPayload {
  images: Array<{
    id: string;
    position: Position;
  }>;
  textBlocks: Array<{
    id: string;
    position: Position;
  }>;
}
