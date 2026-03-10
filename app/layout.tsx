import './globals.css'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'

export const metadata: Metadata = {
    title: 'Asesorías Integrales MJM - Aseguramiento Metrológico',
    description: 'Conocimiento, experiencia y confiabilidad en Aseguramiento Metrológico.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body>
                <Header />
                <main style={{ marginTop: '0' }}>
                    {children}
                </main>
                <footer style={{
                    backgroundColor: 'var(--mjm-blue)',
                    color: 'white',
                    padding: '60px 20px',
                    textAlign: 'center'
                }}>
                    <Logo className="footer-logo" height={80} style={{ margin: '0 auto', justifyContent: 'center' }} />
                    <p style={{ marginTop: '20px', opacity: 0.8 }}>
                        © {new Date().getFullYear()} Asesorías Integrales MJM S.A.S. Todos los derechos reservados.
                    </p>
                </footer>
            </body>
        </html>
    )
}
