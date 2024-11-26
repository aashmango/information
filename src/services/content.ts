import { supabase } from '@/lib/supabase'
import { ImageItem, TextBlock, DatabaseImage, DatabaseText, Position, VideoItem, DatabaseVideo } from '@/types'

interface SavePositionsPayload {
  images: Array<{ id: string; position: Position; description: string }>;
  textBlocks: Array<{ id: string; position: Position }>;
  videos: Array<{ id: string; position: Position; description: string }>;
}

export const contentService = {
  handleError(error: any, context: string): never {
    console.error(`Error ${context}:`, error)
    throw error
  },

  createPosition(x: number, y: number): Position {
    return { x, y }
  },

  async fetchImages(): Promise<ImageItem[]> {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      this.handleError(error, 'fetching images');
    }

    const mappedData = (data as DatabaseImage[]).map(img => ({
      id: img.id,
      src: img.thumbnail_url || img.src,
      alt: img.alt,
      current_position: img.current_position || { x: 0, y: 0 },
      default_position: {
        x: img.default_position_x,
        y: img.default_position_y
      },
      width: img.width,
      height: img.height,
      isExpanded: false,
      description: img.description,
      thumbnail_url: img.thumbnail_url,
      original_url: img.original_url
    }));

    return mappedData;
  },

  async fetchTextBlocks(): Promise<TextBlock[]> {
    const { data, error } = await supabase
      .from('text_blocks')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching text blocks')
    }

    return (data as DatabaseText[]).map(text => {
      const defaultPosition = this.createPosition(text.default_position_x, text.default_position_y)
      const currentPosition = text.current_position || defaultPosition
      
      return {
        id: text.id,
        content: text.content,
        current_position: currentPosition,
        default_position: defaultPosition,
        width: text.width
      }
    })
  },

  async fetchVideos(): Promise<VideoItem[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      this.handleError(error, 'fetching videos');
    }

    return (data as DatabaseVideo[]).map(video => ({
      id: video.id,
      src: video.src,
      type: 'video',
      width: video.width,
      height: video.height,
      current_position: video.current_position || { x: 0, y: 0 },
      default_position: {
        x: video.default_position_x,
        y: video.default_position_y
      },
      description: video.description,
      isExpanded: false,
      autoplay: true,
      loop: true,
      muted: true
    }));
  },

  async updatePosition(
    table: 'images' | 'text_blocks' | 'videos',
    id: string, 
    position: Position
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .update({ current_position: position })
      .eq('id', id)

    if (error) {
      this.handleError(error, `updating ${table} position`)
    }
  },

  async savePositions({ images, textBlocks, videos }: SavePositionsPayload): Promise<void> {
    try {
      // Save image positions
      for (const { id, position, description } of images) {
        const { error } = await supabase
          .from('images')
          .update({ current_position: position, description })
          .eq('id', id);

        if (error) {
          throw new Error(`Failed to update image ${id}: ${error.message}`);
        }
      }

      // Save text block positions
      for (const { id, position } of textBlocks) {
        const { error } = await supabase
          .from('text_blocks')
          .update({ current_position: position })
          .eq('id', id);

        if (error) {
          throw new Error(`Failed to update text block ${id}: ${error.message}`);
        }
      }

      // Save video positions
      for (const { id, position, description } of videos) {
        const { error } = await supabase
          .from('videos')
          .update({ current_position: position, description })
          .eq('id', id);

        if (error) {
          throw new Error(`Failed to update video ${id}: ${error.message}`);
        }
      }
    } catch (error) {
      throw error;
    }
  }
}