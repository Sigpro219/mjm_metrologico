'use client';

import { useEffect, useState } from 'react'
import { Shield, BookOpen, Settings, ArrowRight, CheckCircle2, MonitorSmartphone, CloudCog, ActivitySquare } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export default function Home() {
    const [teamImage, setTeamImage] = useState('/about/team-cimga.jpg')
    const [heroTitle, setHeroTitle] = useState('Expertos en Aseguramiento Metrológico')
    const [heroSubtitle, setHeroSubtitle] = useState('Consultoría, capacitación, verificación y calibración. Ahora, con control total de tus activos en la nube.')

    useEffect(() => {
        const fetchContent = async () => {
            const { data } = await supabase.from('site_settings').select('id, value')
            if (data) {
                const imgData = data.find(i => i.id === 'nosotros_url')
                const titleData = data.find(i => i.id === 'home_hero_title')
                const subtitleData = data.find(i => i.id === 'home_hero_subtitle')

                if (imgData?.value) setTeamImage(imgData.value)
                if (titleData?.value) setHeroTitle(titleData.value)
                if (subtitleData?.value) setHeroSubtitle(subtitleData.value)
            }
        }
        fetchContent()
    }, [])

    return (
        <div style={{ backgroundColor: '#fafafa' }}>
            {/* Hero - fiel al diseño del cliente */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(13,27,42,0.88) 0%, rgba(27,54,93,0.80) 100%), url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80") no-repeat center center/cover',
                color: 'white',
                padding: '120px 6% 80px 6%',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Badge ISO — esquina superior derecha */}
                <div style={{
                    position: 'absolute', top: '150px', right: '5%',
                    backgroundColor: 'white', borderRadius: '12px',
                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 20
                }}>
                    <img src="/about/certification.jpg" alt="ISO 9001" style={{ height: '36px', width: '36px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Certificación</div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--mjm-blue)', fontWeight: 800, lineHeight: 1 }}>ISO 9001</div>
                    </div>
                </div>

                {/* Logo circular grande — esquina inferior derecha (decorativo) */}
                <div style={{
                    position: 'absolute', bottom: '5%', right: '5%',
                    opacity: 0.85, zIndex: 5
                }}>
                    <img src="/logo1.png" alt="MJM Logo decorativo" style={{ height: '200px', width: 'auto' }} />
                </div>

                {/* Texto principal — izquierda */}
                <div style={{ maxWidth: '580px', zIndex: 10, position: 'relative' }}>
                    <h1 style={{ fontSize: '4.2rem', fontWeight: 800, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-1px' }}>
                        Expertos en{' '}
                        <span style={{ color: 'var(--mjm-orange)', display: 'block' }}>
                            Aseguramiento Metrológico
                        </span>
                    </h1>

                    <p style={{ fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.9, marginBottom: '42px', maxWidth: '460px' }}>
                        Consultoría, capacitación, verificación y calibración de instrumentos con los más altos estándares de calidad y confiabilidad.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <a href="/contacto" className="btn-primary" style={{
                            padding: '14px 30px', fontSize: '1rem', display: 'inline-flex',
                            alignItems: 'center', borderRadius: '8px',
                            boxShadow: '0 8px 20px rgba(245,130,32,0.4)'
                        }}>
                            Contáctanos <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </a>
                        <a href="/servicios" style={{
                            padding: '14px 30px', fontSize: '1rem', borderRadius: '8px',
                            border: '2px solid rgba(255,255,255,0.6)',
                            backgroundColor: 'transparent', color: 'white', fontWeight: 600,
                            transition: 'all 0.3s', display: 'inline-block'
                        }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Nuestros Servicios
                        </a>
                    </div>
                </div>
            </section>

            {/* Diferenciador SaaS - El Portal de Operaciones */}
            <section id="saas" style={{ padding: '120px 20px', backgroundColor: '#fff', position: 'relative' }}>
                <div className="section-container" style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 500px' }}>
                        <span style={{ color: 'var(--mjm-orange)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Innovación Exclusiva</span>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--mjm-blue)', margin: '20px 0 30px 0', lineHeight: 1.2 }}>
                            Del papel a la gestión en <span style={{ color: 'var(--mjm-orange)' }}>Tiempo Real</span>
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: '#475569', lineHeight: 1.7, marginBottom: '30px' }}>
                            Nos diferenciamos por ofrecerte acceso 24/7 a nuestro <strong>Portal de Control de Activos Metrológicos</strong>. Despídete de las planillas perdidas; ahora tus certificados de calibración, fechas de mantenimiento y el estado de cada instrumento están centralizados en nuestra plataforma SaaS.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                                <div style={{ backgroundColor: 'rgba(245,130,32,0.1)', padding: '12px', borderRadius: '12px' }}><CloudCog size={24} className="text-orange" /></div>
                                <div>
                                    <h4 style={{ fontWeight: 700, color: 'var(--mjm-blue)', marginBottom: '5px' }}>100% en la Nube</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>Accede desde tu celular o computadora a toda tu data metrológica.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                                <div style={{ backgroundColor: 'rgba(245,130,32,0.1)', padding: '12px', borderRadius: '12px' }}><ActivitySquare size={24} className="text-orange" /></div>
                                <div>
                                    <h4 style={{ fontWeight: 700, color: 'var(--mjm-blue)', marginBottom: '5px' }}>Trazabilidad</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>Historial completo de calibraciones y mantenimientos interactivo.</p>
                                </div>
                            </div>
                        </div>

                        <a href={process.env.NEXT_PUBLIC_PORTAL_URL ? `${process.env.NEXT_PUBLIC_PORTAL_URL}/login?tenant=mjm` : 'http://localhost:3000/login?tenant=mjm'} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--mjm-blue)', padding: '14px 30px' }}>
                            <MonitorSmartphone size={20} style={{ marginRight: '10px' }} /> Ingresar al Portal Cliente
                        </a>
                    </div>
                    
                    {/* Mockup visual del Portal SaaS */}
                    <div style={{ flex: '1 1 500px', position: 'relative' }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '24px', padding: '10px',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)',
                            transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)', transition: 'transform 0.5s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'}
                        >
                            <div style={{ backgroundColor: '#f1f5f9', height: '400px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                                {/* Decorative Dashboard Mockup elements */}
                                <div style={{ height: '50px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f87171' }}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#facc15' }}></div>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
                                    <div style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>MJM Portal SaaS</div>
                                </div>
                                <div style={{ padding: '30px', display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '25%', height: '300px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}></div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ height: '120px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', padding: '20px' }}>
                                             <div style={{ width: '60%', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                                            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}></div>
                                            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Overview Section con Glassmorphism */}
            <section style={{ padding: '100px 20px', backgroundColor: '#f8fafc' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--mjm-blue)', marginBottom: '20px' }}>
                        Nuestros Pilares Operativos
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
                        Combinamos el rigor técnico tradicional con la agilidad del ecosistema digital.
                    </p>
                </div>

                <div className="section-container" style={{ padding: '0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
                    {[
                        { icon: Shield, title: 'Aseguramiento Metrológico', desc: 'Asesoría y consultoría bajo normas internacionales para garantizar auditorías impecables.' },
                        { icon: Settings, title: 'Diagnóstico y Calibración', desc: 'Mantenimiento y verificación de instrumentos con máxima exactitud y trazabilidad demostrable.' },
                        { icon: BookOpen, title: 'Formación y Capacitación', desc: 'Transferencia de conocimiento técnico para empoderar a tu equipo de calidad.' }
                    ].map((feature, idx) => (
                        <div key={idx} style={{ 
                            padding: '40px', borderRadius: '24px', backgroundColor: 'white', 
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', borderTop: '4px solid var(--mjm-orange)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ width: '70px', height: '70px', backgroundColor: 'rgba(27, 54, 93, 0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                                <feature.icon className="text-orange" size={36} strokeWidth={1.5} />
                            </div>
                            <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', color: 'var(--mjm-blue)', fontWeight: 700 }}>{feature.title}</h3>
                            <p style={{ opacity: 0.8, lineHeight: 1.7, color: '#334155', fontSize: '1.05rem' }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Nuestro Alcance Section - Modernizada */}
            <section style={{ backgroundColor: 'var(--mjm-dark-blue)', color: 'white', padding: '120px 0', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,130,32,0.5), transparent)' }}></div>
                <div className="section-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap-reverse' }}>
                        <div style={{ flex: '1 1 450px', position: 'relative', height: '600px', borderRadius: '32px', overflow: 'hidden' }}>
                            <Image
                                src={teamImage}
                                alt="Equipo MJM"
                                fill
                                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13, 27, 42, 0.9) 0%, transparent 60%)' }}></div>
                        </div>

                        <div style={{ flex: '1 1 500px' }}>
                            <div style={{ color: 'var(--mjm-orange)', fontWeight: 600, letterSpacing: '1px', marginBottom: '15px' }}>EXPERIENCIA COMPROBADA</div>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '30px', lineHeight: 1.1 }}>
                                Nuestro Alcance <span style={{ color: 'var(--mjm-orange)' }}>Estratégico</span>
                            </h2>
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '40px', color: '#cbd5e1', fontWeight: 400 }}>
                                Integración fluida entre metodologías precisas e infraestructura digital corporativa, cumpliendo todos los requerimientos de la norma ISO 9001.
                            </p>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                {[
                                    "Consultoría para implementación de planes de aseguramiento.",
                                    "Entrenamiento de alto nivel en metrología.",
                                    "Trazabilidad garantizada desde nuestra Plataforma Web.",
                                    "Mantenimiento, ajuste y logística de calibración."
                                ].map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', fontSize: '1.15rem', fontWeight: 500 }}>
                                        <div style={{
                                            backgroundColor: 'rgba(245,130,32,0.2)',
                                            borderRadius: '50%', padding: '4px',
                                            display: 'flex', flexShrink: 0
                                        }}>
                                            <CheckCircle2 size={24} style={{ color: 'var(--mjm-orange)' }} />
                                        </div>
                                        <span style={{ paddingTop: '2px' }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
