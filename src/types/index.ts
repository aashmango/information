export interface Position {
  x: number;
  y: number;
}

export interface ImageItem {
  id: string;
  src: string;
  alt: string;
  position: Position;
  default_position: Position;
  width: number;
  height: number;
  isExpanded?: boolean;
}

export interface TextBlock {
  id: string;
  content: string;
  position: Position;
  default_position: Position;
  width: number;
}

// Database types (matching your Supabase schema)
export interface DatabaseImage {
  id: string;
  src: string;
  alt: string;
  default_position_x: number;
  default_position_y: number;
  width: number;
  height: number;
  created_at: string;
}

export interface DatabaseText {
  id: string;
  content: string;
  default_position_x: number;
  default_position_y: number;
  width: number;
  created_at: string;
}