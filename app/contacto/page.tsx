'use client';

import { useEffect, useState } from 'react'
import { Mail, Phone, MessageSquare, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function ContactoPage() {
    const [contactInfo, setContactInfo] = useState({
        email_1: 'proyectos@asesoriasmjm.com',
        email_2: 'comercial.asesoriasmjm@gmail.com',
        phone_1: '+57 315 9253952',
        phone_2: '+57 313 7960800',
        address: 'Cl 2 #71d-84, Bogotá, Colombia'
    })

    useEffect(() => {
        const fetchContent = async () => {
            const { data } = await supabase.from('site_settings').select('id, value').like('id', 'contacto_%')
            if (data) {
                const info: any = { ...contactInfo }
                data.forEach(item => {
                    if (item.id === 'contacto_email_1') info.email_1 = item.value
                    if (item.id === 'contacto_email_2') info.email_2 = item.value
                    if (item.id === 'contacto_phone_1') info.phone_1 = item.value
                    if (item.id === 'contacto_phone_2') info.phone_2 = item.value
                    if (item.id === 'contacto_address') info.address = item.value
                })
                setContactInfo(info)
            }
        }
        fetchContent()
    }, [])
    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header / Banner */}
            <div style={{
                position: 'relative',
                backgroundColor: 'var(--mjm-blue)',
                color: 'white',
                padding: '140px 20px',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <Image
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"
                    alt="Banner Contacto"
                    fill
                    style={{ objectFit: 'cover', opacity: 0.25 }}
                    priority
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>Contáctanos</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '20px' }}>Estamos listos para atender sus requerimientos metrológicos.</p>
                </div>
            </div>

            <div className="section-container" style={{ marginTop: '-40px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '40px'
                }}>
                    {/* Contact Info Card */}
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: 'var(--mjm-blue)' }}>Información Directa</h3>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                            <Mail className="text-orange" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Email</p>
                                <p style={{ opacity: 0.8 }}>{contactInfo.email_1}</p>
                                <p style={{ opacity: 0.8 }}>{contactInfo.email_2}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                            <Phone className="text-orange" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Teléfonos</p>
                                <p style={{ opacity: 0.8 }}>{contactInfo.phone_1}</p>
                                <p style={{ opacity: 0.8 }}>{contactInfo.phone_2}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                            <MessageSquare className="text-orange" />
                            <div>
                                <p style={{ fontWeight: 600 }}>WhatsApp</p>
                                <p style={{ opacity: 0.8 }}>{contactInfo.phone_1}</p>
                                <p style={{ opacity: 0.8 }}>{contactInfo.phone_2}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <MapPin className="text-orange" />
                            <div>
                                <p style={{ fontWeight: 600 }}>Ubicación</p>
                                <p style={{ opacity: 0.8 }}>{contactInfo.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Map and Schedule */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div style={{
                            height: '300px',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                        }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.844342894584!2d-74.13781702416954!3d4.62186594247271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9ebba6441589%3A0xe5a3c9d784cfc804!2sCl.%202%20%2371d-84%2C%20Bogot%C3%A1!5e0!3m2!1sen!2sco!4v1709565000000!5m2!1sen!2sco"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>

                        <div style={{ backgroundColor: 'var(--mjm-orange)', padding: '30px', borderRadius: '24px', color: 'white' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                                <Clock size={20} />
                                <h4 style={{ fontWeight: 700 }}>Horario de Atención</h4>
                            </div>
                            <p style={{ fontSize: '1rem', marginBottom: '5px' }}>Lunes - Viernes: 8:00 AM - 5:00 PM</p>
                            <p style={{ fontSize: '1rem' }}>Sábados - Domingos: Cerrado</p>
                            <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid rgba(255,255,255,0.2)' }} />
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '5px' }}>Recepción y Entrega de Equipos</h4>
                            <p style={{ fontSize: '1rem' }}>Lunes - Viernes: 8:30 AM - 4:30 PM</p>
                        </div>
                    </div>

                    {/* QR Section */}
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--mjm-blue)' }}>Solicitud de Servicios</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '30px' }}>Escanee para acceder a nuestro formulario oficial</p>
                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLScgrsyFcCrP_Aq2j_CAjb5T8IkWJ3Is_RIRaYqPVcLkVRJmsA/viewform"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '30px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '24px',
                                display: 'inline-block',
                                border: '2px dashed #cbd5e1'
                            }}
                        >
                            <Image
                                src="/brands/qr-service.jpg"
                                alt="QR Code Solicitud de Servicios"
                                width={180}
                                height={180}
                            />
                        </a>
                        <p style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--mjm-orange)', fontWeight: 600 }}>Click en el QR para ir al formulario</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
