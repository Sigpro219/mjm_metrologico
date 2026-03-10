import './globals.css'
import type { Metadata } from 'next'
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
                <nav style={{
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    padding: '20px 40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <Logo width={180} height={180} />
                    <div style={{ display: 'flex', gap: '30px', fontWeight: 600 }}>
                        <a href="/">Inicio</a>
                        <a href="/servicios">Servicios</a>
                        <a href="/nosotros">Nosotros</a>
                        <a href="/contacto">Contacto</a>
                        <a href="/login" style={{ color: 'var(--mjm-orange)' }}>Admin</a>
                    </div>
                </nav>
                <main style={{ marginTop: '220px' }}>
                    {children}
                </main>
                <footer style={{
                    backgroundColor: 'var(--mjm-blue)',
                    color: 'white',
                    padding: '60px 20px',
                    textAlign: 'center'
                }}>
                    <Logo className="footer-logo" width={220} height={220} style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '20px', opacity: 0.8 }}>
                        © {new Date().getFullYear()} Asesorías Integrales MJM S.A.S. Todos los derechos reservados.
                    </p>
                </footer>
            </body>
        </html>
    )
}
