export interface ImageItem {
  id: string;
  src: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  isExpanded?: boolean;
}

export interface TextBlock {
  id: string;
  content: string;
  position: { x: number; y: number };
  width: number;
}
