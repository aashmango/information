import { supabase } from '@/lib/supabase'
import { ImageItem, TextBlock, DatabaseImage, DatabaseText, Position } from '@/types'

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
      .order('created_at', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching images')
    }

    return (data as DatabaseImage[]).map(img => {
      const defaultPosition = this.createPosition(img.default_position_x, img.default_position_y)
      const currentPosition = img.current_position || defaultPosition
      
      return {
        id: img.id,
        src: img.src,
        alt: img.alt,
        current_position: currentPosition,
        default_position: defaultPosition,
        width: img.width,
        height: img.height,
        isExpanded: false
      }
    })
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

  async savePositions(changes: {
    images: Array<{ id: string; position: Position }>;
    textBlocks: Array<{ id: string; position: Position }>;
  }): Promise<void> {
    const updates = [
      ...changes.images.map(({ id, position }) => 
        supabase
          .from('images')
          .update({ current_position: position })
          .eq('id', id)
      ),
      ...changes.textBlocks.map(({ id, position }) => 
        supabase
          .from('text_blocks')
          .update({ current_position: position })
          .eq('id', id)
      )
    ];

    const results = await Promise.all(updates);
    const errors = results.map(r => r.error).filter(Boolean);
    
    if (errors.length > 0) {
      this.handleError(errors[0], 'saving positions');
    }
  }
}