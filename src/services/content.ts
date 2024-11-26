import { supabase } from '@/lib/supabase'
import { ImageItem, TextBlock, DatabaseImage, DatabaseText, Position } from '@/types'

interface SavePositionsPayload {
  images: Array<{ id: string; position: Position }>;
  textBlocks: Array<{ id: string; position: Position }>;
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

    const mappedData = (data as DatabaseImage[]).map(img => {
      const fallbackPosition = { x: 0, y: 0 };
      const currentPosition = (img.current_position && 
        typeof img.current_position.x === 'number' && 
        typeof img.current_position.y === 'number')
        ? img.current_position 
        : fallbackPosition;

      const defaultPosition = {
        x: img.default_position_x,
        y: img.default_position_y
      };

      return {
        id: img.id,
        src: img.src,
        alt: img.alt,
        current_position: currentPosition,
        default_position: defaultPosition,
        width: img.width,
        height: img.height,
        isExpanded: false
      };
    });

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

  async updatePosition(
    table: 'images' | 'text_blocks',
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

  async savePositions(changes: SavePositionsPayload): Promise<void> {
    try {
      for (const { id, position } of changes.images) {
        const { data, error, status } = await supabase
          .from('images')
          .update({ current_position: position })
          .eq('id', id)
          .select('*');

        if (error) {
          throw new Error(`Failed to update image ${id}: ${error.message}`);
        }
      }

      const { data: verificationData } = await supabase
        .from('images')
        .select('id, current_position')
        .in('id', changes.images.map(img => img.id));

    } catch (error) {
      throw error;
    }
  }
}