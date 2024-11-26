import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import probe from 'probe-image-size'
import sharp from 'sharp'

// Load environment variables from .env.local instead of .env
dotenv.config({ path: '.env.local' })

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in .env.local')
}
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_KEY is not defined in .env.local')
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
)

async function getImageDimensions(url: string) {
  try {
    const result = await probe(url)
    return {
      width: result.width,
      height: result.height
    }
  } catch (error) {
    console.error(`Failed to get dimensions for ${url}:`, error)
    return null
  }
}

async function processAndUploadImage(file: any, supabase: any) {
  try {
    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    // Download the original file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('assets')
      .download(file.name)

    if (downloadError) throw downloadError

    // Convert Blob to Buffer
    const fileBuffer = Buffer.from(await fileData.arrayBuffer())

    let thumbnailPath: string
    let processedBuffer: Buffer

    // Handle different file types
    if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
      // Process image files with higher quality settings
      processedBuffer = await sharp(fileBuffer)
        .resize(400, null, {  // Increased from 300 to 400
          withoutEnlargement: true,
          fit: 'inside'  // Ensure the smallest dimension is at least 400px
        })
        .webp({ quality: 90 })  // Increased from 80 to 90
        .toBuffer()
      
      thumbnailPath = `thumbnails/${file.name.replace(/\.[^/.]+$/, "")}.webp`
    } else if (['gif', 'mov', 'mp4'].includes(fileExt)) {
      // For GIFs and videos, just use the original file
      console.log(`Skipping processing for ${file.name} - using original file for both URLs`)
      const { data: { publicUrl } } = supabase
        .storage
        .from('assets')
        .getPublicUrl(file.name)
      
      return {
        originalUrl: publicUrl,
        thumbnailUrl: publicUrl // Use same URL for both
      }
    } else {
      console.log(`Unsupported file type for ${file.name}`)
      return null
    }

    // Upload thumbnail for image files with upsert option
    if (processedBuffer) {
      const { error: uploadError } = await supabase
        .storage
        .from('assets')
        .upload(thumbnailPath, processedBuffer, {
          contentType: 'image/webp',
          upsert: true  // This will overwrite existing files
        })

      if (uploadError) throw uploadError
    }

    // Get public URLs
    const { data: { publicUrl: originalUrl } } = supabase
      .storage
      .from('assets')
      .getPublicUrl(file.name)

    const { data: { publicUrl: thumbnailUrl } } = supabase
      .storage
      .from('assets')
      .getPublicUrl(thumbnailPath)

    const thumbnailDimensions = await sharp(processedBuffer).metadata()

    return {
      originalUrl,
      thumbnailUrl,
      thumbnail_width: thumbnailDimensions.width,
      thumbnail_height: thumbnailDimensions.height
    }
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error)
    return null
  }
}

// Add this function at the top level
function calculateStaggeredPosition(index: number) {
  const GRID_SIZE = 200  // Base grid size
  const STAGGER_OFFSET = 50  // How much to offset each item
  
  // Calculate position based on index
  const row = Math.floor(index / 3)  // 3 items per row
  const col = index % 3
  
  return {
    x: (col * GRID_SIZE) + (row * STAGGER_OFFSET),
    y: (row * GRID_SIZE)
  }
}

async function updateImagesTable() {
  try {
    // First, clear existing data
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteError) throw deleteError

    // List all files in your bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from('assets')
      .list()

    if (listError) throw listError

    // Filter out the thumbnails folder and any other non-image files
    const imageFiles = files?.filter(file => 
      !file.name.startsWith('thumbnails/') && 
      file.name !== 'thumbnails'
    )

    console.log(`Found ${imageFiles?.length} files`)

    // Process each file
    for (const [index, file] of imageFiles!.entries()) {
      // Get public URL for the image
      const { data: { publicUrl } } = supabase
        .storage
        .from('assets')
        .getPublicUrl(file.name)

      // Get image dimensions
      const dimensions = await getImageDimensions(publicUrl)
      if (!dimensions) {
        console.error(`Skipping ${file.name} - couldn't get dimensions`)
        continue
      }

      const urls = await processAndUploadImage(file, supabase)
      if (!urls) continue

      // Calculate staggered position
      const position = calculateStaggeredPosition(index)

      // Insert into database
      const { error: insertError } = await supabase
        .from('images')
        .insert({
          src: urls.thumbnailUrl,
          original_url: urls.originalUrl,
          thumbnail_url: urls.thumbnailUrl,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          width: dimensions.width,
          height: dimensions.height,
          default_position: position,
          current_position: position,
          description: '',
          created_at: new Date().toISOString(),
          thumbnail_width: urls.thumbnail_width,
          thumbnail_height: urls.thumbnail_height
        })

      if (insertError) {
        console.error(`Failed to insert ${file.name}:`, insertError)
      } else {
        console.log(`Successfully processed ${file.name}`)
      }
    }

    console.log('Finished updating images table')
  } catch (error) {
    console.error('Failed to update images table:', error)
  }
}

// Run the script
updateImagesTable()
