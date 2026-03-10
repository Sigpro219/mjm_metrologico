'use client';

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { X, ZoomIn } from 'lucide-react'

export default function NosotrosPage() {
    const [teamImage, setTeamImage] = useState('/about/team-cimga.jpg')
    const [openImage, setOpenImage] = useState<string | null>(null)

    useEffect(() => {
        const fetchImage = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('id', 'nosotros_url').single()
            if (data?.value) setTeamImage(data.value)
        }
        fetchImage()
    }, [])

    return (
        <div>
            {/* About Banner */}
            <div style={{
                height: '50vh',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <Image
                    src="/about/banner.jpg"
                    alt="MJM Banner"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center 15%', filter: 'brightness(0.7)' }}
                    priority
                />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', padding: '0 20px' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>Sobre Nosotros</h1>
                    <p style={{ fontSize: '1.2rem', marginTop: '20px', opacity: 0.9 }}>Conocimiento, experiencia y confiabilidad en Aseguramiento Metrológico.</p>
                </div>
            </div>

            {/* Content Section */}
            <section className="section-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap', marginBottom: '80px' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--mjm-blue)' }}>Nuestra Trayectoria</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '20px', opacity: 0.8 }}>
                            En Asesorías Integrales MJM, somos su aliado estratégico en calidad y precisión. Con años de experiencia, brindamos soluciones integrales que optimizan los procesos de medición de nuestros clientes, garantizando resultados técnicos de excelencia.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '12px' }}>
                                <h4 style={{ color: 'var(--mjm-orange)', marginBottom: '5px' }}>+10 Años</h4>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>De experiencia técnica</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '12px' }}>
                                <h4 style={{ color: 'var(--mjm-orange)', marginBottom: '5px' }}>ISO 9001</h4>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Calidad certificada</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: '1 1 400px', height: '450px', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <Image
                            src={teamImage}
                            alt="MJM Team at CIMGA"
                            fill
                            style={{ objectFit: 'cover', objectPosition: 'center top' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div
                            onClick={() => setOpenImage('/about/mission.png')}
                            style={{
                                position: 'relative', height: '300px', marginBottom: '30px', cursor: 'pointer',
                                overflow: 'hidden', borderRadius: '16px', border: '1px solid #f0f0f0'
                            }}
                            className="hover-zoom-container"
                        >
                            <Image
                                src="/about/mission.png"
                                alt="Misión Visión"
                                fill
                                style={{ objectFit: 'contain', transition: 'transform 0.4s ease' }}
                                className="zoom-image"
                            />
                            <div className="zoom-overlay" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.3s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                <ZoomIn size={48} />
                            </div>
                        </div>
                        <h3 style={{ textAlign: 'center', color: 'var(--mjm-blue)', fontSize: '1.8rem' }}>Nuestra Filosofía</h3>
                        <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '15px', lineHeight: 1.6 }}>
                            Comprometidos con la innovación continua y la formación de personal altamente calificado para el sector industrial.
                        </p>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <div
                            onClick={() => setOpenImage('/about/certification.jpg')}
                            style={{
                                position: 'relative', height: '300px', marginBottom: '30px', cursor: 'pointer',
                                overflow: 'hidden', borderRadius: '16px', border: '1px solid #f0f0f0'
                            }}
                            className="hover-zoom-container"
                        >
                            <Image
                                src="/about/certification.jpg"
                                alt="Certificación"
                                fill
                                style={{ objectFit: 'contain', transition: 'transform 0.4s ease' }}
                                className="zoom-image"
                            />
                            <div className="zoom-overlay" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.3s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                <ZoomIn size={48} />
                            </div>
                        </div>
                        <h3 style={{ textAlign: 'center', color: 'var(--mjm-blue)', fontSize: '1.8rem' }}>Calidad Certificada</h3>
                        <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '15px', lineHeight: 1.6 }}>
                            Garantizamos los más altos estándares en cada uno de nuestros procesos de calibración y consultoría.
                        </p>
                    </div>
                </div>

                {/* Modal de Imagen */}
                {openImage && (
                    <div
                        onClick={() => setOpenImage(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'zoom-out', padding: '40px'
                        }}
                    >
                        <button
                            onClick={() => setOpenImage(null)}
                            style={{
                                position: 'absolute', top: '20px', right: '30px',
                                background: 'transparent', border: 'none', color: 'white',
                                cursor: 'pointer', zIndex: 10000
                            }}
                        >
                            <X size={40} />
                        </button>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', height: '100%', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={openImage}
                                alt="Imagen ampliada"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
