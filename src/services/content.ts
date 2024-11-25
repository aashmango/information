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

      const defaultPosition = (img.default_position && 
        typeof img.default_position.x === 'number' && 
        typeof img.default_position.y === 'number')
        ? img.default_position
        : currentPosition;

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

    console.log('Loaded images with positions:', mappedData.map(img => ({
      id: img.id,
      position: img.current_position
    })));

    return mappedData;
  },

  async fetchTextBlocks(): Promise<TextBlock[]> {
    console.log('Fetching text blocks from Supabase...');
    const { data, error } = await supabase
      .from('text_blocks')
      .select('*')
      .order('created_at', { ascending: true })

    console.log('Supabase text blocks response:', { data, error });

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
      console.log('Saving positions:', changes);

      const updates = [
        ...changes.images.map(({ id, position }) => {
          const formattedPosition = {
            x: Number(position.x),
            y: Number(position.y)
          };
          
          return supabase
            .from('images')
            .update({ current_position: formattedPosition })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error(`Failed to update image ${id}:`, error);
              return { error };
            });
        }),
        ...changes.textBlocks.map(({ id, position }) => {
          console.log(`Preparing text update for id ${id}:`, position);
          return supabase
            .from('text_blocks')
            .update({ current_position: position })
            .eq('id', id)
            .then(({ error }) => {
              if (error) {
                console.error(`Failed to update text block ${id}:`, error);
                return { error };
              }
              console.log(`Successfully updated text block ${id}`);
              return { error: null };
            });
        })
      ];

      console.log('Executing updates...');
      const results = await Promise.all(updates);
      
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Error updating item ${index}:`, result.error);
        } else {
          console.log(`Successfully updated item ${index}`);
        }
      });

      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        console.error('Errors during position updates:', errors);
        throw new Error('Failed to save some position updates');
      } else {
        console.log('All positions saved successfully');
      }
    } catch (error) {
      console.error('Error in savePositions:', error);
      throw error;
    }
  }
}