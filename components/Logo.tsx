import React from 'react';

export const Logo: React.FC<{
    className?: string,
    height?: number,
    showName?: boolean,
    nameColor?: string,
    style?: React.CSSProperties
}> = ({ className, height = 74, showName = true, nameColor = 'var(--mjm-blue)', style }) => {
    return (
        <div className={`logo-container ${className ?? ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', ...style }}>
            <img
                src="/logo1.png"
                alt="MJM Logo"
                style={{ height: `${height}px`, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
            {showName && (
                <span style={{
                    fontWeight: 400,
                    fontSize: '1.78rem',
                    lineHeight: 1.2,
                    color: nameColor,
                    letterSpacing: '-0.3px',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.5s'
                }}>
                    ASESORIAS INTEGRALES{' '}
                    <span style={{ color: 'var(--mjm-orange)' }}>MJM S.A.S</span>
                </span>
            )}
        </div>
    );
};
