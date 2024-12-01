import React from 'react';
import DraggableImage from './DraggableImage';
import DraggableText from './DraggableText';
import DraggableVideo from './DraggableVideo';
import { ImageItem, TextBlock, VideoItem, Position } from '@/types';

interface ContentCanvasProps {
  images: ImageItem[];
  videos: VideoItem[];
  textBlocks: TextBlock[];
  onPositionChange: (id: string, newPosition: Position, type: 'image' | 'text' | 'video') => void;
  onDescriptionChange: (id: string, newDescription: string) => void;
  onTextChange: (id: string, newContent: string) => void;
  onDeleteText: (id: string) => void;
  onToggleSize: (id: string, type: 'image' | 'video') => void;
}

const ContentCanvas: React.FC<ContentCanvasProps> = ({
  images,
  videos,
  textBlocks,
  onPositionChange,
  onDescriptionChange,
  onTextChange,
  onDeleteText,
  onToggleSize,
}) => {
  return (
    <main style={{
      width: '100%',
      height: '100%',
      overflow: 'auto',
      position: 'relative',
      backgroundColor: 'white',
      backgroundSize: '16px 16px',
      backgroundPosition: '8px 8px',
      backgroundRepeat: 'repeat',
      transform: `scale(1)`,
      transformOrigin: '0 0',
      minHeight: '100vh',
    }}>
      {images.map(image => (
        <DraggableImage
          key={image.id}
          id={image.id}
          position={image.current_position}
          image={image}
          onPositionChange={(pos) => onPositionChange(image.id, pos, 'image')}
          onToggleSize={() => onToggleSize(image.id, 'image')}
          onDescriptionChange={(desc) => onDescriptionChange(image.id, desc)}
        />
      ))}
      {videos.map(video => (
        <DraggableVideo
          key={video.id}
          id={video.id}
          position={video.current_position}
          video={video}
          onPositionChange={(pos) => onPositionChange(video.id, pos, 'video')}
          onToggleSize={() => onToggleSize(video.id, 'video')}
          onDescriptionChange={(desc) => onDescriptionChange(video.id, desc)}
        />
      ))}
      {textBlocks.map(text => (
        <DraggableText
          key={text.id}
          id={text.id}
          text={text.content}
          position={text.current_position}
          onPositionChange={(pos) => onPositionChange(text.id, pos, 'text')}
          onTextChange={(newText) => onTextChange(text.id, newText)}
          onDelete={() => onDeleteText(text.id)}
        />
      ))}
    </main>
  );
};

export default ContentCanvas;
