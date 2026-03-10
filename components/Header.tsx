'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';

export function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // En la parte superior → transparente, texto blanco
    // Al scrollear → vidrio blanco, texto azul corporativo
    const linkColor = scrolled ? 'var(--mjm-blue)' : 'rgba(255,255,255,0.92)';
    const linkHoverColor = 'var(--mjm-orange)';
    const linkHoverRestore = scrolled ? 'var(--mjm-blue)' : 'rgba(255,255,255,0.92)';

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            padding: scrolled ? '6px 40px' : '18px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
            zIndex: 1000,
            boxShadow: scrolled ? '0 2px 20px rgba(0, 0, 0, 0.08)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.4)' : 'none',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            <a href="/" style={{ transition: 'all 0.4s', display: 'block' }}>
                <Logo height={scrolled ? 60 : 74} nameColor={scrolled ? 'var(--mjm-blue)' : 'white'} />
            </a>

            <div style={{
                display: 'flex',
                gap: '35px',
                fontWeight: 600,
                alignItems: 'center',
                color: linkColor
            }}>
                {['/', '/servicios', '/nosotros', '/contacto'].map((href, i) => {
                    const labels = ['Inicio', 'Servicios', 'Nosotros', 'Contacto'];
                    return (
                        <a
                            key={href}
                            href={href}
                            style={{ transition: 'color 0.2s', padding: '5px 0', color: linkColor }}
                            onMouseOver={e => e.currentTarget.style.color = linkHoverColor}
                            onMouseOut={e => e.currentTarget.style.color = linkHoverRestore}
                        >
                            {labels[i]}
                        </a>
                    );
                })}

                <a
                    href={process.env.NEXT_PUBLIC_PORTAL_URL ? `${process.env.NEXT_PUBLIC_PORTAL_URL}/login?tenant=mjm` : 'http://localhost:3000/login?tenant=mjm'}
                    style={{
                        color: 'white',
                        backgroundColor: 'var(--mjm-orange)',
                        padding: scrolled ? '10px 24px' : '11px 26px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        marginLeft: '10px',
                        boxShadow: '0 4px 15px rgba(245,130,32,0.35)',
                        transition: 'all 0.3s',
                        display: 'inline-block'
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(245,130,32,0.5)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(245,130,32,0.35)';
                    }}
                >
                    Portal Operativo
                </a>
            </div>
        </nav>
    );
}
