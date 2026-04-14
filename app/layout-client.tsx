'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function HeaderWrapper() {
    const pathname = usePathname();
    const isOperational = pathname.startsWith('/dashboard') || pathname.startsWith('/login');
    
    if (isOperational) return null;
    return <Header />;
}

export function FooterWrapper() {
    const pathname = usePathname();
    const isOperational = pathname.startsWith('/dashboard') || pathname.startsWith('/login');
    
    if (isOperational) return null;
    return <Footer />;
}
