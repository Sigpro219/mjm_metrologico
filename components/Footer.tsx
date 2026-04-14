'use client';

import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Mail, Phone, MapPin, MessageCircle, Clock, QrCode, X } from 'lucide-react';

export function Footer() {
    const [showMap, setShowMap] = useState(false);
    const [showQR, setShowQR] = useState(false);

    return (
        <>
            {/* Modal Ubicación */}
            {showMap && (
                <div
                    onClick={() => setShowMap(false)}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
                            width: '90%', maxWidth: '640px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
                        }}
                    >
                        <div style={{
                            padding: '18px 24px', display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', backgroundColor: '#2f423e'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                                <MapPin size={20} color="#f7931b" />
                                <span style={{ fontWeight: 700 }}>Cl 2 #71d-84, Bogotá, Colombia</span>
                            </div>
                            <button
                                onClick={() => setShowMap(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.9!2d-74.075!3d4.605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a!2sAsesor%C3%ADas%20Integrales%20MJM%20SAS!5e0!3m2!1ses!2sco!4v1"
                            width="100%" height="340" style={{ border: 0, display: 'block' }}
                            allowFullScreen loading="lazy"
                        />
                        <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <a
                                href="https://maps.google.com/?q=Calle+2+%2371d-84+Bogotá"
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                    padding: '10px 22px', backgroundColor: '#f7931b', color: 'white',
                                    borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none'
                                }}
                            >
                                Abrir en Google Maps →
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal QR */}
            {showQR && (
                <div
                    onClick={() => setShowQR(false)}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
                            padding: '32px', textAlign: 'center', maxWidth: '340px', width: '90%',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
                        }}
                    >
                        <button
                            onClick={() => setShowQR(false)}
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'none', border: 'none', cursor: 'pointer'
                            }}
                        >
                            <X size={22} color="#666" />
                        </button>
                        <h3 style={{ color: '#2f423e', fontWeight: 800, marginBottom: '6px', fontSize: '1.2rem' }}>
                            Solicitud de Servicios
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
                            Escanea el código con tu cámara
                        </p>
                        <img
                            src="/brands/qr-service.jpg"
                            alt="QR Solicitud de Servicios MJM"
                            style={{ width: '220px', height: '220px', borderRadius: '12px', objectFit: 'contain' }}
                        />
                        <p style={{ color: '#f7931b', fontWeight: 700, marginTop: '16px', fontSize: '0.9rem' }}>
                            Asesorías Integrales MJM S.A.S
                        </p>
                    </div>
                </div>
            )}

            {/* Footer principal */}
            <footer style={{ backgroundColor: '#2f423e', color: 'white', padding: '70px 5% 0' }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '48px', paddingBottom: '50px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>

                    {/* Columna 1: Logo + descripción */}
                    <div>
                        <Logo height={60} nameColor="white" style={{ marginBottom: '18px' }} />
                        <p style={{ opacity: 0.65, lineHeight: 1.7, fontSize: '0.9rem', maxWidth: '260px' }}>
                            Expertos en aseguramiento metrológico con certificación ISO 9001:2015. Bogotá, Colombia.
                        </p>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <img src="/about/icontec-badge.png" alt="ICONTEC" style={{ height: '40px', width: 'auto', opacity: 0.85 }} />
                        </div>
                    </div>

                    {/* Columna 2: Contacto */}
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px', color: '#f7931b', letterSpacing: '0.5px' }}>
                            CONTACTO
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { icon: <Mail size={16} color="#f7931b" />, text: 'proyectos@asesoriasmjm.com' },
                                { icon: <Mail size={16} color="#f7931b" />, text: 'comercial.asesoriasmjm@gmail.com' },
                                { icon: <Phone size={16} color="#f7931b" />, text: '+57 315 9253952' },
                                { icon: <Phone size={16} color="#f7931b" />, text: '+57 313 7960800' },
                                { icon: <MessageCircle size={16} color="#f7931b" />, text: 'WhatsApp disponible' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8, fontSize: '0.88rem' }}>
                                    {item.icon}
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Columna 3: Horario + acciones */}
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '20px', color: '#f7931b', letterSpacing: '0.5px' }}>
                            HORARIO
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.8, fontSize: '0.88rem', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Lunes – Viernes</span><span style={{ color: '#f7931b' }}>8:00 AM – 5:00 PM</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Sábados</span><span>Cerrado</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Domingos</span><span>Cerrado</span>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => setShowMap(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white', borderRadius: '10px', padding: '11px 18px',
                                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                                    transition: 'all 0.2s', textAlign: 'left', width: '100%'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                            >
                                <MapPin size={18} color="#f7931b" />
                                Ver nuestra ubicación
                            </button>
                            <button
                                onClick={() => setShowQR(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    backgroundColor: '#f7931b', border: 'none',
                                    color: 'white', borderRadius: '10px', padding: '11px 18px',
                                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                                    transition: 'all 0.2s', textAlign: 'left', width: '100%'
                                }}
                                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseOut={e => e.currentTarget.style.opacity = '1'}
                            >
                                <QrCode size={18} />
                                Solicitar un servicio
                            </button>
                        </div>
                    </div>
                </div>

                {/* Barra inferior */}
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    padding: '20px 0', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: '10px',
                    opacity: 0.5, fontSize: '0.82rem'
                }}>
                    <span>© {new Date().getFullYear()} Asesorías Integrales MJM S.A.S. Todos los derechos reservados.</span>
                    <span>Diseñado con ❤️ para la excelencia metrológica</span>
                </div>
            </footer>
        </>
    );
}
