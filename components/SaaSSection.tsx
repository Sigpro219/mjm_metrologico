'use client';

import { CloudCog, ActivitySquare, CheckCircle2, MonitorSmartphone, ArrowRight } from 'lucide-react'

export const SaaSSection = () => {
    return (
        <section id="saas" style={{ padding: '120px 20px', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative backgrounds */}
            <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,155,179,0.05) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
            
            <div className="section-container" style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 500px', zIndex: 10 }}>
                    <div style={{ color: 'var(--mjm-orange)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '2px', backgroundColor: 'var(--mjm-orange)' }}></div>
                        INNOVACIÓN EXCLUSIVA
                    </div>
                    <h2 style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--mjm-blue)', marginBottom: '30px', lineHeight: 1.15 }}>
                        Del papel a la gestión en <br/>
                        <span style={{ color: 'var(--mjm-orange)', position: 'relative' }}>
                            Tiempo Real
                            <svg style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%' }} height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 10C40 4 160 4 198 10" stroke="#f7931b" strokeWidth="4" strokeLinecap="round"/>
                            </svg>
                        </span>
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.8, marginBottom: '40px' }}>
                        Nos anticipamos al futuro de la metrología ofreciendo acceso integral 24/7 a nuestro <strong>Portal de Control de Activos</strong>. Centralice certificados, historiales y alertas de mantenimiento en una plataforma SaaS diseñada para la excelencia operativa.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '45px' }}>
                        {[
                            { icon: CloudCog, title: '100% Cloud', desc: 'Gestiona tus activos desde cualquier lugar y dispositivo.' },
                            { icon: ActivitySquare, title: 'Trazabilidad 360°', desc: 'Historial digital inalterable con cumplimiento normativo.' },
                            { icon: CheckCircle2, title: 'Alertas Inteligentes', desc: 'Notificaciones automáticas de próximos vencimientos.' },
                            { icon: MonitorSmartphone, title: 'Panel Intuitivo', desc: 'Visualización clara del estado de toda su planta.' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                                <div style={{ backgroundColor: 'rgba(247, 147, 27, 0.1)', padding: '10px', borderRadius: '10px', display: 'flex' }}>
                                    <item.icon size={20} style={{ color: 'var(--mjm-orange)' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700, color: 'var(--mjm-blue)', marginBottom: '4px', fontSize: '1rem' }}>{item.title}</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <a href="/login?tenant=mjm" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--mjm-blue)', padding: '16px 36px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 15px 30px rgba(47, 66, 62, 0.2)' }}>
                        Ingresar al Portal Cliente <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                    </a>
                </div>
                
                {/* Mockup visual del Portal SaaS */}
                <div style={{ flex: '1 1 500px', perspective: '1500px' }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '28px', padding: '12px',
                        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.18)', border: '1px solid rgba(0,0,0,0.04)',
                        transform: 'rotateY(-8deg) rotateX(4deg)', transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 50px 100px -20px rgba(0,0,0,0.22)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'rotateY(-8deg) rotateX(4deg)';
                        e.currentTarget.style.boxShadow = '0 40px 80px -20px rgba(0,0,0,0.18)';
                    }}
                    >
                        <div style={{ backgroundColor: '#f8fafc', height: '480px', borderRadius: '20px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                            {/* Header del Dashboard */}
                            <div style={{ height: '56px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                <div style={{ marginLeft: '15px', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>MJM PORTAL OPERATIVO</div>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9' }}></div>
                                    <div style={{ width: '40px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', alignSelf: 'center' }}></div>
                                </div>
                            </div>
                            
                            {/* Contenido del Dashboard */}
                            <div style={{ display: 'flex', height: 'calc(100% - 56px)' }}>
                                {/* Sidebar */}
                                <div style={{ width: '200px', borderRight: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: 'white' }}>
                                    {[60, 80, 70, 90, 65].map((w, i) => (
                                        <div key={i} style={{ width: `${w}%`, height: '12px', backgroundColor: i===0?'rgba(247, 147, 27, 0.1)':'#f1f5f9', borderRadius: '6px', border: i===0?'1px solid rgba(247, 147, 27, 0.2)':'none' }}></div>
                                    ))}
                                    <div style={{ marginTop: 'auto', width: '100%', height: '40px', backgroundColor: '#2f423e', borderRadius: '10px' }}></div>
                                </div>
                                
                                {/* Main Area */}
                                <div style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                        <div style={{ height: '80px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px' }}>
                                            <div style={{ width: '30%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '10px' }}></div>
                                            <div style={{ width: '70%', height: '16px', backgroundColor: 'var(--mjm-orange)', opacity: 0.15, borderRadius: '4px' }}></div>
                                        </div>
                                        <div style={{ height: '80px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px' }}>
                                            <div style={{ width: '30%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '10px' }}></div>
                                            <div style={{ width: '70%', height: '16px', backgroundColor: '#2f423e', opacity: 0.1, borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ height: '230px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ width: '100%', height: '20px', backgroundColor: '#f8fafc', borderRadius: '4px' }}></div>
                                        <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                                            <div style={{ flex: 2, height: '100%', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'flex-end', padding: '10px', gap: '8px' }}>
                                                {[40, 70, 50, 90, 30, 60, 80].map((h, i) => (
                                                    <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: i===3?'var(--mjm-orange)':'#cbd5e1', borderRadius: '4px' }}></div>
                                                ))}
                                            </div>
                                            <div style={{ flex: 1, height: '100%', border: '2px dashed #e2e8f0', borderRadius: '10px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
