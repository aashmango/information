interface Position {
    x: number;
    y: number;
  }
  
  interface BaseBlock {
    id: string;
    position: Position;
    width: number;
    type: 'image' | 'text' | 'video';
  }
  
  interface ImageBlock extends BaseBlock {
    type: 'image';
    src: string;
    height: number;
    isExpanded?: boolean;
  }
  
  interface TextBlock extends BaseBlock {
    type: 'text';
    content: string;
  }
  
  interface VideoBlock extends BaseBlock {
    type: 'video';
    url: string;
    height: number;
    isPlaying?: boolean;
  }
  
  export type Block = ImageBlock | TextBlock | VideoBlock;
  export type { Position, BaseBlock };