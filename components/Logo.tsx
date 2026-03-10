import React from 'react';
import Image from 'next/image';

export const Logo: React.FC<{
    className?: string,
    width?: number,
    height?: number,
    style?: React.CSSProperties
}> = ({ className, width = 120, height = 120, style }) => {
    return (
        <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', ...style }}>
            <Image
                src="/logo1.png"
                alt="MJM Logo"
                width={width}
                height={height}
                style={{ objectFit: 'contain' }}
            />
        </div>
    );
};
