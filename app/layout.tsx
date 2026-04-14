import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { OrganizationService } from '@/services/organizations'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { TenantProvider } from '@/components/providers/TenantProvider'
import QueryProvider from '@/components/providers/QueryProvider'
import { HeaderWrapper, FooterWrapper } from './layout-client'

export const metadata: Metadata = {
    title: 'Asesorías Integrales MJM - Aseguramiento Metrológico',
    description: 'Conocimiento, experiencia y confiabilidad en Aseguramiento Metrológico.',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    
    // Default to MJM for this project
    let slug = "mjm";
    if (host.includes("ingyemel") || host.includes("frufresco")) {
        // Handle other tenants if needed
    }

    const orgData = await OrganizationService.getBySlug(slug);

    const primaryColor = orgData?.primary_color || "#f7931b"; // MJM orange
    const secondaryColor = orgData?.secondary_color || "#2f423e"; // MJM blue
    const accentColor = orgData?.accent_color || "#639bb3"; // MJM accent

    return (
        <html 
            lang="es" 
            className="scroll-smooth"
            suppressHydrationWarning
            style={{
                '--color-primary': primaryColor,
                '--color-secondary': secondaryColor,
                '--color-accent': accentColor,
            } as React.CSSProperties}
        >
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </head>
            <body className="antialiased font-display bg-concrete text-slate-800">
                <LanguageProvider>
                    <TenantProvider initialTenantId={slug} initialOrganization={orgData}>
                        <QueryProvider>
                            <HeaderWrapper />
                            <main style={{ marginTop: '0' }}>
                                {children}
                            </main>
                            <FooterWrapper />
                        </QueryProvider>
                    </TenantProvider>
                </LanguageProvider>
            </body>
        </html>
    )
}
