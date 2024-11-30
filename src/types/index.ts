export interface Position {
  x: number;
  y: number;
}

interface MediaItem {
  id: string;
  src: string;
  width: number;
  height: number;
  current_position: Position;
  default_position: Position;
  isExpanded?: boolean;
  description?: string;
  aspectRatio?: number;
}

export interface ImageItem extends MediaItem {
  alt: string;
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
  aspectRatio?: number;
}

interface DatabaseMediaItem {
  id: string;           // uuid
  src: string;          // text
  width: number;        // integer
  height: number;       // integer
  default_position_x: number;  // integer
  default_position_y: number;  // integer
  current_position?: Position; // jsonb
  description?: string;        // text
  is_expanded?: boolean;       // boolean
  created_at: string;         // timestamp with time zone
  updated_at: string;         // timestamp with time zone
}

export interface DatabaseImage extends DatabaseMediaItem {
  alt: string;
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

export interface DatabaseVideo extends DatabaseMediaItem {
  // No additional fields needed based on the schema
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
    description: string;
    isExpanded: boolean;
  }>;
  videos: Array<{
    id: string;
    position: Position;
    description: string;
    isExpanded: boolean;
  }>;
  textBlocks: Array<{
    id: string;
    position: Position;
    content: string;
  }>;
}

export interface VideoItem extends MediaItem {
  type: 'video';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}
