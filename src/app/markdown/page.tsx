'use client';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import Link from 'next/link';

export default function MarkdownPage() {
  const [value, setValue] = useState<string | undefined>("# Hello, World!\n\nStart editing here...");

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Markdown Editor</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          Back to Canvas
        </Link>
      </div>

      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={setValue}
          height={500}
          preview="live"
        />
      </div>
    </div>
  );
} 