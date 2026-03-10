'use client';

import { useEffect, useState } from 'react'
import { Shield, BookOpen, Settings, ArrowRight, CheckCircle2, MonitorSmartphone, CloudCog, ActivitySquare } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

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
            {/* Modern Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95) 0%, rgba(27, 54, 93, 0.9) 100%), url("https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80") no-repeat center center/cover',
                color: 'white',
                textAlign: 'center',
                padding: '100px 20px 60px 20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%', left: '-10%', width: '500px', height: '500px',
                    background: 'radial-gradient(circle, rgba(245,130,32,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(60px)'
                }}></div>

                <div style={{ maxWidth: '1000px', zIndex: 10, animation: 'fadeInUp 1s ease-out' }}>
                    <div style={{
                        display: 'inline-block', padding: '8px 16px', backgroundColor: 'rgba(245,130,32,0.2)',
                        border: '1px solid rgba(245,130,32,0.5)', borderRadius: '30px', color: '#fca311',
                        fontWeight: 600, fontSize: '0.9rem', marginBottom: '30px', letterSpacing: '1px'
                    }}>
                        NUEVO: PORTAL SaaS DE METROLOGÍA
                    </div>

                    <h1 style={{ fontSize: '4.5rem', marginBottom: '25px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px' }}>
                        <span dangerouslySetInnerHTML={{ __html: heroTitle.replace('Aseguramiento Metrológico', '<span style="color: var(--mjm-orange); text-shadow: 0 4px 20px rgba(245,130,32,0.3);">Aseguramiento Metrológico</span>') }} />
                    </h1>
                    <p style={{ fontSize: '1.4rem', marginBottom: '50px', opacity: 0.9, lineHeight: 1.6, maxWidth: '800px', margin: '0 auto 50px auto' }}>
                        {heroSubtitle}
                    </p>
                    <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="#saas" className="btn-primary" style={{
                            padding: '16px 36px', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(245,130,32,0.4)',
                            display: 'inline-flex', alignItems: 'center'
                        }}>
                            Tu Metrología Digital <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                        </a>
                        <a href="/servicios" style={{
                            padding: '16px 36px', fontSize: '1.1rem', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)',
                            color: 'white', fontWeight: 600, backdropFilter: 'blur(10px)', transition: 'all 0.3s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
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
