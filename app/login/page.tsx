'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/admin')
        }
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--mjm-gray)'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Logo />
                    <h2 style={{ marginTop: '20px', fontSize: '1.5rem', color: 'var(--mjm-blue)' }}>Módulo de Gobernanza</h2>
                </div>

                <form onSubmit={handleLogin}>
                    {error && <p style={{ color: 'red', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</p>}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Iniciando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
