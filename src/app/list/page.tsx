'use client';
import { useState, useEffect } from 'react';
import { ImageItem, TextBlock, VideoItem } from '@/types';
import { contentService } from '@/services/content';
import Link from 'next/link';

interface ListItem {
  id: string;
  type: 'image' | 'video' | 'text';
  title: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  createdAt?: string;
}

export default function ListPage() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [images, texts, videos] = await Promise.all([
          contentService.fetchImages(),
          contentService.fetchTextBlocks(),
          contentService.fetchVideos()
        ]);

        const formattedItems: ListItem[] = [
          ...formatImages(images),
          ...formatVideos(videos),
          ...formatTexts(texts)
        ].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        setItems(formattedItems);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Content Library</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          Back to Canvas
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              {item.thumbnail && (
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {item.type}
                  </span>
                  <h2 className="text-lg font-medium truncate">{item.title}</h2>
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.content && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {item.content}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  Created: {new Date(item.createdAt!).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper functions (can be moved to a separate file if desired)
function formatImages(images: ImageItem[]): ListItem[] {
  return images.map(img => ({
    id: img.id,
    type: 'image',
    title: img.alt || 'Untitled Image',
    description: img.description,
    thumbnail: img.thumbnail_url,
    createdAt: new Date().toISOString(), // Consider adding created_at to your types
  }));
}

function formatVideos(videos: VideoItem[]): ListItem[] {
  return videos.map(video => ({
    id: video.id,
    type: 'video',
    title: 'Video',
    description: video.description,
    thumbnail: video.src,
    createdAt: new Date().toISOString(),
  }));
}

function formatTexts(texts: TextBlock[]): ListItem[] {
  return texts.map(text => ({
    id: text.id,
    type: 'text',
    title: text.content.slice(0, 50) + (text.content.length > 50 ? '...' : ''),
    content: text.content,
    createdAt: new Date().toISOString(),
  }));
}