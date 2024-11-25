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
}

export interface SavePositionsPayload {
  images: Array<{
    id: string;
    current_position_x: number;
    current_position_y: number;
  }>;
  textBlocks: Array<{
    id: string;
    current_position_x: number;
    current_position_y: number;
  }>;
}
