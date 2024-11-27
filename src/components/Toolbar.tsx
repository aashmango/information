import React, { useState, useEffect } from 'react';
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
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullyExpanded, setIsFullyExpanded] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isExpanded) {
            timer = setTimeout(() => setIsFullyExpanded(true), 250); // Set to fully expanded after 0.5s
        } else {
            setIsFullyExpanded(false);
        }
        return () => clearTimeout(timer);
    }, [isExpanded]);

    const buttonStyle = {
        padding: '4px 8px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        opacity: isFullyExpanded ? 1 : 0, // Opacity changes based on isFullyExpanded
        transition: 'opacity 0.8s ease', // Transition over 0.5 seconds
    };

    const activeButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#000',
        color: '#fff',
    };

    const dividerStyle = {
        height: '24px',
        width: '1px',
        backgroundColor: '#e0e0e0',
        margin: '0 10px',
    };

    const groupStyle = {
        display: 'flex',
        gap: '4px', // 4px spacing between items in the group
    };

    const toolbarStyle = {
        position: 'fixed' as 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: isExpanded ? '8px' : '0',
        height: '40px',
        minWidth: '40px',
        maxWidth: isExpanded ? '400px' : '40px',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px', // Consistent border radius
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'max-width 0.5s ease, padding 0.5s ease',
        cursor: 'pointer',
        overflow: 'hidden',
    };

    const handleMouseEnter = () => {
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        setIsExpanded(false);
    };

    return (
        <div
            style={toolbarStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isExpanded ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
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
                    <div style={dividerStyle}></div>
                    <div style={groupStyle}>
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
                    </div>
                    <div style={dividerStyle}></div>
                    <div style={groupStyle}>
                        <button
                            onClick={() => onToggleImages(!showImages)}
                            style={showImages ? activeButtonStyle : buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showImages ? '#000' : '#e0e0e0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showImages ? '#000' : '#f0f0f0'}
                        >
                            Images
                        </button>
                        <button
                            onClick={() => onToggleText(!showText)}
                            style={showText ? activeButtonStyle : buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showText ? '#000' : '#e0e0e0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showText ? '#000' : '#f0f0f0'}
                        >
                            Text
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ fontSize: '16px', color: '#333' }}>⌘</div>
            )}
        </div>
    );
}