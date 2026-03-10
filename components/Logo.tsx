import React from 'react';

export const Logo: React.FC<{
    className?: string,
    height?: number,
    showName?: boolean,
    style?: React.CSSProperties
}> = ({ className, height = 44, showName = true, style }) => {
    return (
        <div className={`logo-container ${className ?? ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', ...style }}>
            <img
                src="/logo1.png"
                alt="MJM Logo"
                style={{ height: `${height}px`, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
            {showName && (
                <span style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    lineHeight: 1.2,
                    color: 'var(--mjm-blue)',
                    letterSpacing: '-0.3px',
                    whiteSpace: 'nowrap'
                }}>
                    ASESORIAS INTEGRALES{' '}
                    <span style={{ color: 'var(--mjm-orange)' }}>MJM S.A.S</span>
                </span>
            )}
        </div>
    );
};
