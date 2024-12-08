'use client';
import { useState } from 'react';
import Toolbar from '@/components/Toolbar';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_TEXT_WIDTH = 100;

export default function Home() {
  const [textBlocks, setTextBlocks] = useState([]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Toolbar onAddTextBlock={/* Remove or replace this prop if necessary */} />
    </div>
  );
}
