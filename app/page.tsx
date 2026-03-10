'use client';

import { useEffect, useState } from 'react'
import { Shield, BookOpen, Settings, Package, ArrowRight, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function Home() {
    const [teamImage, setTeamImage] = useState('/about/team-cimga.jpg')
    const [heroTitle, setHeroTitle] = useState('Expertos en Aseguramiento Metrológico')
    const [heroSubtitle, setHeroSubtitle] = useState('Consultoría, capacitación, verificación y calibración con los más altos estándares de calidad y trazabilidad internacional.')

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
        <div>
            {/* Hero Section */}
            <section style={{
                height: '85vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(27, 54, 93, 0.9) 0%, rgba(13, 27, 42, 0.9) 100%), url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80") no-repeat center center/cover',
                color: 'white',
                textAlign: 'center',
                padding: '0 20px'
            }}>
                <div style={{ maxWidth: '900px' }}>
                    <h1 style={{ fontSize: '4rem', marginBottom: '25px', fontWeight: 800, lineHeight: 1.1 }}>
                        <span dangerouslySetInnerHTML={{ __html: heroTitle.replace('Aseguramiento Metrológico', '<span class="text-orange">Aseguramiento Metrológico</span>') }} />
                    </h1>
                    <p style={{ fontSize: '1.3rem', marginBottom: '45px', opacity: 0.9, lineHeight: 1.6 }}>
                        {heroSubtitle}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <a href="/contacto" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                            Contáctanos <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                        </a>
                        <a href="/servicios" style={{
                            padding: '14px 28px',
                            borderRadius: '12px',
                            border: '2px solid white',
                            background: 'transparent',
                            color: 'white',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.3s'
                        }}>Explorar Servicios</a>
                    </div>
                </div>
            </section>

            {/* Quick Overview Section */}
            <section className="section-container" style={{ padding: '80px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--mjm-blue)', marginBottom: '20px' }}>
                        Nuestros Pilares de Excelencia
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
                        Basamos nuestras soluciones integrales en tres fundamentos técnicos para garantizar la calidad y precisión industrial.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                    <div style={{ padding: '40px', borderRadius: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', transition: 'transform 0.3s' }}>
                        <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--mjm-blue)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                            <Shield className="text-orange" size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: 'var(--mjm-blue)' }}>Confianza Técnica</h3>
                        <p style={{ opacity: 0.7, lineHeight: 1.6, color: '#334155' }}>
                            Garantizamos la precisión en sus procesos a través de un riguroso aseguramiento metrológico y normativo, avalado por estándares internacionales.
                        </p>
                    </div>

                    <div style={{ padding: '40px', borderRadius: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', transition: 'transform 0.3s' }}>
                        <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--mjm-blue)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                            <BookOpen className="text-orange" size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: 'var(--mjm-blue)' }}>Formación Experta</h3>
                        <p style={{ opacity: 0.7, lineHeight: 1.6, color: '#334155' }}>
                            Capacitamos a su personal con metodologías avanzadas, talleres prácticos y conocimiento técnico de vanguardia para el sector.
                        </p>
                    </div>

                    <div style={{ padding: '40px', borderRadius: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', transition: 'transform 0.3s' }}>
                        <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--mjm-blue)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                            <Settings className="text-orange" size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: 'var(--mjm-blue)' }}>Calibración Precisa</h3>
                        <p style={{ opacity: 0.7, lineHeight: 1.6, color: '#334155' }}>
                            Servicios de calibración de alta exactitud en magnitudes críticas para asegurar la excelencia en sus mediciones industriales.
                        </p>
                    </div>
                </div>
            </section>

            {/* Nuestro Alcance Section */}
            <section style={{ backgroundColor: 'var(--mjm-orange)', color: 'white', padding: '100px 0' }}>
                <div className="section-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 500px' }}>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '20px', display: 'inline-block', borderBottom: '4px solid white', paddingBottom: '10px' }}>
                                Nuestro Alcance
                            </h2>
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '40px', opacity: 0.95, fontWeight: 500 }}>
                                Ofrecemos soluciones integrales certificadas bajo la norma ISO 9001, garantizando la máxima calidad y precisión en cada proceso.
                            </p>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    "Asesoría, consultoría, implementación y evaluación de planes de aseguramiento metrológico",
                                    "Capacitación especializada en metrología",
                                    "Diagnóstico, mantenimiento y verificación de instrumentos",
                                    "Calibración y distribución de instrumentos de medición"
                                ].map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'start', gap: '15px', fontSize: '1.1rem', fontWeight: 600 }}>
                                        <div style={{
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            marginTop: '2px'
                                        }}>
                                            <CheckCircle2 size={18} style={{ color: 'var(--mjm-orange)' }} />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ flex: '1 1 400px', position: 'relative', height: '550px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                            <Image
                                src={teamImage}
                                alt="Equipo MJM"
                                fill
                                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
