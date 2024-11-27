import DisplayFilters from './DisplayFilters';
import Link from 'next/link';

interface ToolbarProps {
    onCleanupLayout: () => void;
    onAddTextBlock: () => void;
    showImages: boolean;
    showText: boolean;
    onToggleImages: (show: boolean) => void;
    onToggleText: (show: boolean) => void;
  }
  
  export default function Toolbar({
    onCleanupLayout,
    onAddTextBlock,
    showImages,
    showText,
    onToggleImages,
    onToggleText
  }: ToolbarProps) {
    const buttonStyle = {
      padding: '4px 8px',
      backgroundColor: '#f0f0f0',
      color: '#333',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      marginRight: '10px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      transition: 'background-color 0.3s',
    };
  
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px',
        height: '40px',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <button 
          onClick={onCleanupLayout}
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
        >
          Clean Up
        </button>
        <button 
          onClick={onAddTextBlock}
          style={buttonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
        >
          Add Text
        </button>
        <DisplayFilters
          showImages={showImages}
          showText={showText}
          onToggleImages={onToggleImages}
          onToggleText={onToggleText}
        />
        <Link 
          href="/list"
          style={{
            ...buttonStyle,
            textDecoration: 'none',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
        >
          Index
        </Link>
      </div>
    );
  }