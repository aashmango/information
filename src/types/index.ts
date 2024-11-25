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
  default_position: Position;
  current_position: Position;
  isExpanded?: boolean;
}

export interface TextBlock {
  id: string;
  content: string;
  width: number;
  default_position: Position;
  current_position: Position;
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