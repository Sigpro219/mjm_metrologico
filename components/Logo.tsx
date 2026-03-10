import React from 'react';
import Image from 'next/image';

export const Logo: React.FC<{
    className?: string,
    height?: number,
    style?: React.CSSProperties
}> = ({ className, height = 44, style }) => {
    return (
        <div className={`logo-container ${className ?? ''}`} style={{ display: 'flex', alignItems: 'center', ...style }}>
            <img
                src="/logo1.png"
                alt="MJM Logo"
                style={{ height: `${height}px`, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
        </div>
    );
};
