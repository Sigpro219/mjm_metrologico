'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';

export function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        // Disparar una vez al montar para chequear el estado inicial
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            padding: scrolled ? '10px 40px' : '15px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: scrolled ? 'blur(12px)' : 'blur(5px)',
            zIndex: 1000,
            boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.08)' : '0 2px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid transparent'
        }}>
            <a href="/" style={{ 
                transition: 'transform 0.4s', 
                transform: scrolled ? 'scale(0.9)' : 'scale(1)', 
                transformOrigin: 'left center',
                display: 'block'
            }}>
                <Logo width={100} height={100} />
            </a>
            
            <div style={{ 
                display: 'flex', 
                gap: '35px', 
                fontWeight: 600,
                alignItems: 'center',
                color: 'var(--mjm-blue)'
            }}>
                <a href="/" style={{ transition: 'color 0.2s', padding: '5px 0' }} onMouseOver={e => e.currentTarget.style.color = 'var(--mjm-orange)'} onMouseOut={e => e.currentTarget.style.color = 'var(--mjm-blue)'}>Inicio</a>
                <a href="/servicios" style={{ transition: 'color 0.2s', padding: '5px 0' }} onMouseOver={e => e.currentTarget.style.color = 'var(--mjm-orange)'} onMouseOut={e => e.currentTarget.style.color = 'var(--mjm-blue)'}>Servicios</a>
                <a href="/nosotros" style={{ transition: 'color 0.2s', padding: '5px 0' }} onMouseOver={e => e.currentTarget.style.color = 'var(--mjm-orange)'} onMouseOut={e => e.currentTarget.style.color = 'var(--mjm-blue)'}>Nosotros</a>
                <a href="/contacto" style={{ transition: 'color 0.2s', padding: '5px 0' }} onMouseOver={e => e.currentTarget.style.color = 'var(--mjm-orange)'} onMouseOut={e => e.currentTarget.style.color = 'var(--mjm-blue)'}>Contacto</a>
                <a 
                    href={process.env.NEXT_PUBLIC_PORTAL_URL ? `${process.env.NEXT_PUBLIC_PORTAL_URL}/login?tenant=mjm` : 'http://localhost:3000/login?tenant=mjm'} 
                    style={{ 
                        color: 'white',
                        backgroundColor: 'var(--mjm-orange)',
                        padding: scrolled ? '10px 24px' : '12px 28px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        marginLeft: '10px',
                        boxShadow: scrolled ? '0 4px 15px rgba(245,130,32,0.3)' : '0 4px 10px rgba(245,130,32,0.2)',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,130,32,0.4)'
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = scrolled ? '0 4px 15px rgba(245,130,32,0.3)' : '0 4px 10px rgba(245,130,32,0.2)'
                    }}
                >
                    Portal Operativo
                </a>
            </div>
        </nav>
    );
}
