import { supabase } from '@/lib/supabase'
import { ImageItem, TextBlock, DatabaseImage, DatabaseText } from '@/types'

export const contentService = {
  async fetchImages(): Promise<ImageItem[]> {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching images:', error)
      return []
    }

    return (data as DatabaseImage[]).map(img => ({
      id: img.id,
      src: img.src,
      alt: img.alt,
      position: {
        x: img.default_position_x,
        y: img.default_position_y
      },
      default_position: {
        x: img.default_position_x,
        y: img.default_position_y
      },
      width: img.width,
      height: img.height,
      isExpanded: false
    }))
  },

  async fetchTextBlocks(): Promise<TextBlock[]> {
    const { data, error } = await supabase
      .from('text_blocks')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching text blocks:', error)
      return []
    }

    return (data as DatabaseText[]).map(text => ({
      id: text.id,
      content: text.content,
      position: {
        x: text.default_position_x,
        y: text.default_position_y
      },
      default_position: {
        x: text.default_position_x,
        y: text.default_position_y
      },
      width: text.width
    }))
  }
}