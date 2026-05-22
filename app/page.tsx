'use client';

import { useEffect, useState } from 'react'
import { 
    Shield, MonitorSmartphone, BookOpen, Settings, ActivitySquare, ArrowRight, 
    CheckCircle2, ChevronRight, Menu, X, Play, ShieldCheck, ClipboardCheck, 
    Database, Calendar, BarChart3, Activity, Clock, Thermometer, Ruler, 
    Search, Wrench, HeartPulse, Box, Briefcase, Users, BookText, 
    GraduationCap, UserCheck 
} from 'lucide-react';
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { SaaSSection } from '@/components/SaaSSection'
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants'

export default function Home() {
    const [teamImage, setTeamImage] = useState('/about/team-cimga.jpg')
    const [heroTitle, setHeroTitle] = useState('Expertos en Aseguramiento Metrológico')
    const [heroSubtitle, setHeroSubtitle] = useState('Consultoría, capacitación, verificación y calibración. Ahora, con control total de tus activos en la nube.')
    const [selectedService, setSelectedService] = useState<any>(null);

    const services = [
        { 
            id: 1, icon: Shield, title: 'Aseguramiento Metrológico', 
            image: '/services/aseguramiento.png',
            shortDesc: 'Gestión integral de sus procesos de medición para garantizar conformidad y calidad.',
            longDesc: 'Gestionamos integralmente sus procesos de medición para garantizar la conformidad y la calidad de sus productos y servicios.',
            benefits: ['Cumplimiento Normativo', 'Mitigación de Riesgos', 'Eficiencia en Auditorías'],
            details: {
                subtitle: 'Planes y Programas de Aseguramiento y Control',
                cards: [
                    { title: 'Clasificación de Equipos', desc: 'Identificación y clasificación detallada de todos los instrumentos de medición.' },
                    { title: 'Levantamiento de Información', desc: 'Recopilación exhaustiva de datos técnicos y metrológicos base.' },
                    { title: 'Cronogramas Integrados', desc: 'Planificación estratégica de rutinas para minimizar tiempos de inactividad.' },
                    { title: 'Indicadores de Gestión', desc: 'Visualización de datos y métricas clave para la toma de decisiones.' }
                ]
            }
        },
        { 
            id: 2, icon: MonitorSmartphone, title: 'Portal Operativo (SAAS)', 
            image: '/services/portal.png',
            shortDesc: 'Plataforma Cloud-First para la gestión integral de activos, cronogramas de mantenimiento y aseguramiento metrológico.',
            longDesc: 'Centralice toda la gestión de sus instrumentos en nuestra plataforma propietaria, garantizando trazabilidad total y cumplimiento normativo en tiempo real.',
            benefits: ['Gestión Cloud 24/7', 'Alertas Automáticas', 'Historial Inalterable'],
            details: {
                subtitle: 'Portal de Control de Activos',
                cards: [
                    { title: 'Trazabilidad Digital', desc: 'Acceso inmediato a certificados e historiales desde cualquier lugar.' },
                    { title: 'Alertas de Calibración', desc: 'Sistema inteligente de notificaciones para evitar vencimientos.' },
                    { title: 'Gestión de Inventario', desc: 'Control detallado de ubicación y estado de cada activo.' },
                    { title: 'Reportes en Vivo', desc: 'Indicadores de cumplimiento y desempeño metrológico al instante.' }
                ]
            }
        },
        { 
            id: 3, icon: BookOpen, title: 'Capacitación', 
            image: '/services/capacitacion.png',
            shortDesc: 'Programas especializados en metrología adaptados a las necesidades de su empresa.',
            longDesc: 'Fortalezca las competencias de su equipo con nuestros programas de formación especializados en metrología y calidad.',
            benefits: ['Programas a Medida', 'Certificación Técnica', 'Alineación ISO'],
            details: {
                subtitle: 'Capacitación y Mejora de Competencias',
                hasMainImage: true,
                items: [
                    { title: 'Metrología Básica y Avanzada', desc: 'Fundamentos teóricos y prácticos para el personal técnico.' },
                    { title: 'Interpretación de Certificados', desc: 'Análisis detallado de resultados y criterios de aceptación.' },
                    { title: 'Buenas Prácticas de Laboratorio', desc: 'Normativas y procedimientos para asegurar la calidad.' },
                    { title: 'Formación a la Medida', desc: 'Programas adaptados a las necesidades de su empresa.' }
                ]
            }
        },
        { 
            id: 4, icon: Settings, title: 'Calibración de Instrumentos', 
            image: '/services/calibracion.png',
            shortDesc: 'Servicios de calibración trazable y acreditada con laboratorios aliados.',
            longDesc: 'Servicios de calibración trazable y acreditada con laboratorios aliados para garantizar la precisión de sus mediciones.',
            benefits: ['Trazabilidad NIST/ONAC', 'Informe de Calibración', 'Precisión Garantizada'],
            details: {
                subtitle: 'Calibración de Instrumentos',
                certification: 'NTC-ISO/IEC 17025',
                cards: [
                    { title: 'Medidores de Vibración', desc: 'Verificación de sensores y equipos de monitoreo dinámico.' },
                    { title: 'Analizadores de Vibración', desc: 'Calibración de sistemas de análisis predictivo.' },
                    { title: 'Cámaras Termográficas', desc: 'Ajuste de precisión para medición de temperatura infrarroja.' },
                    { title: 'Alineadores Laser', desc: 'Certificación de alineación para maquinaria rotativa.' }
                ]
            }
        },
        { 
            id: 5, icon: ActivitySquare, title: 'Diagnóstico, Mantenimiento y Verificación', 
            image: '/services/mantenimiento.png',
            shortDesc: 'Evaluación técnica y mantenimiento preventivo de instrumentos de medición.',
            longDesc: 'Mantenga sus instrumentos en óptimas condiciones con nuestro servicio técnico especializado y preventivo.',
            benefits: ['Extensión de Vida Útil', 'Reducción de Fallas', 'Ajuste Certificado'],
            details: {
                subtitle: 'Diagnóstico, Mantenimiento y Verificación',
                cards: [
                    { title: 'Diagnóstico Técnico', desc: 'Evaluación exhaustiva del estado y funcionamiento de equipos.' },
                    { title: 'Reparación Especializada', desc: 'Servicio técnico calificado para la restauración de instrumentos.' },
                    { title: 'Verificación', desc: 'Comprobación de especificaciones segun aplicación industrial.' },
                    { title: 'Mant. Preventivo', desc: 'Programas diseñados para extender la vida útil de sus activos.' }
                ]
            }
        },
        { 
            id: 6, icon: Shield, title: 'Suministros e Instrumentos', 
            image: '/services/suministros.png',
            shortDesc: 'Instrumentos de medición de alta calidad y accesorios especializados.',
            longDesc: 'Proveemos instrumentos de medición de alta calidad y todos los accesorios necesarios para su operación técnica.',
            benefits: ['Marcas Líderes', 'Asesoría en Compra', 'Garantía Técnica'],
            details: {
                subtitle: 'Suministros Especializados',
                cards: [
                    { title: 'Instrum. de Medición', desc: 'Calibradores, Micrómetros, Termómetros, Manómetros.' },
                    { title: 'Almacenamiento', desc: 'Estuches de protección, Kits de limpieza, Soportes.' },
                    { title: 'Repuestos Originales', desc: 'Sensores, Baterías, Cables y componentes críticos.' },
                    { title: 'Asesoría Personalizada', desc: 'Selección de equipos, cotizaciones y soporte técnico.' }
                ]
            }
        }

    ];

    const brands = [
        { name: 'Fluke', logo: '/brands/fluke.png' },
        { name: 'SKF', logo: '/brands/skf.png' },
        { name: 'UNI-T', logo: '/brands/uni-t.jpg' },
        { name: 'CTC', logo: '/brands/ctc.jpg' },
        { name: 'DeltaTrak', logo: '/brands/deltatrak.jpg' },
        { name: 'EasyLaser', logo: '/brands/easylaser.png' },
        { name: 'Wilcoxon', logo: '/brands/wilcoxon.png' }
    ]

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data, error } = await supabase.from('site_settings').select('id, value')
                
                // Merge with defaults
                const settings = [...DEFAULT_SITE_SETTINGS];
                if (data) {
                    data.forEach(item => {
                        const index = settings.findIndex(s => s.id === item.id);
                        if (index !== -1) settings[index] = item;
                        else settings.push(item);
                    });
                }

                const imgData = settings.find(i => i.id === 'nosotros_url')
                const titleData = settings.find(i => i.id === 'home_hero_title')
                const subtitleData = settings.find(i => i.id === 'home_hero_subtitle')

                if (imgData?.value) setTeamImage(imgData.value)
                if (titleData?.value) setHeroTitle(titleData.value)
                if (subtitleData?.value) setHeroSubtitle(subtitleData.value)
            } catch (err) {
                console.error("Error fetching homepage content:", err);
            }
        }
        fetchContent()
    }, [])

    return (
        <div style={{ backgroundColor: '#fafafa' }}>
            {/* 1. Hero */}
            <section style={{
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(47,66,62,0.68) 0%, rgba(99,155,179,0.55) 100%), url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80") no-repeat center center/cover',
                color: 'white',
                padding: '120px 6% 80px 6%',
                position: 'relative',
                overflow: 'visible'
            }}>
                {/* Badge ISO */}
                <div style={{
                    position: 'absolute', top: '150px', right: '5%',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '14px',
                    padding: '14px 20px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    zIndex: 20
                }}>
                    <img src="/about/icontec-badge.png" alt="ICONTEC" style={{ height: '52px', width: 'auto' }} />
                    <div>
                        <div style={{ fontSize: '1rem', color: '#2f423e', fontWeight: 700, lineHeight: 1.2 }}>Certificación</div>
                        <div style={{ fontSize: '1.3rem', color: '#f7931b', fontWeight: 800, lineHeight: 1.1 }}>ISO 9001</div>
                    </div>
                </div>

                {/* Logo circular grande - Glass Effect */}
                <div style={{
                    position: 'absolute', bottom: '5%', right: '5%',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '8px',
                    padding: '12px 40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    opacity: 0.95, 
                    zIndex: 5
                }}>
                    <img src="/logo1.png" alt="MJM Logo decorativo" style={{ height: '260px', width: 'auto' }} />
                </div>

                {/* Texto principal */}
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

            {/* 2. Nuestro Alcance */}
            <section style={{ backgroundColor: 'var(--mjm-orange)', color: 'white', padding: '100px 0 80px 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, height: '1px', 
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)' 
                }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}></div>

                <div className="section-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '100px', flexWrap: 'wrap-reverse' }}>
                        <div style={{ flex: '1 1 480px', position: 'relative' }}>
                            <div style={{ position: 'relative', height: '520px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
                                <Image src={teamImage} alt="Equipo MJM" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 40%)' }}></div>
                                <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '12px' }}>
                                                <Shield size={24} color="var(--mjm-orange)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Compromiso MJM</div>
                                                <div style={{ opacity: 1, fontSize: '0.9rem' }}>Calidad certificada en cada proceso.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: '1 1 500px', zIndex: 10 }}>
                            <div style={{ 
                                backgroundColor: '#2f423e', color: 'white', display: 'inline-block', 
                                padding: '8px 20px', borderRadius: '50px', fontWeight: 800, 
                                letterSpacing: '2.5px', textTransform: 'uppercase', fontSize: '0.75rem', 
                                marginBottom: '25px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>TRAYECTORIA Y CONFIANZA</div>
                            
                            <h2 style={{ fontSize: '3.8rem', fontWeight: 800, marginBottom: '35px', lineHeight: 1.1, letterSpacing: '-1.5px', color: 'white' }}> 
                                Nuestro <br/> 
                                <span style={{ color: '#e0f2fe', textShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>Alcance</span> 
                            </h2>
                            
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '50px', color: 'white', fontWeight: 400, maxWidth: '540px', opacity: 0.9 }}> 
                                Con más de 12 años de experiencia, Asesorías Integrales MJM S.A.S. se ha consolidado como el aliado estratégico ideal para empresas que buscan la excelencia en sus sistemas de medición.
                            </p>
                            
                            <div style={{ display: 'grid', gap: '35px' }}>
                                {[
                                    { num: "01", title: "CONSULTORÍA ISO 9001", desc: "Asesoramos la implementación de sistemas de calidad metrológica bajo los más altos estándares internacionales." },
                                    { num: "02", title: "CRITERIO TÉCNICO", desc: "Nuestros expertos brindan soporte especializado para la toma de decisiones críticas en aseguramiento metrológico." }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                                        <div style={{ 
                                            backgroundColor: 'white', borderRadius: '12px', padding: '10px 14px', 
                                            display: 'flex', flexShrink: 0, marginTop: '4px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                            color: 'var(--mjm-blue)', fontWeight: 800, fontSize: '1.2rem'
                                        }}>
                                            {item.num}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px', color: 'white', letterSpacing: '1px' }}>{item.title}</div>
                                            <div style={{ color: 'white', opacity: 0.85, fontSize: '1rem', lineHeight: 1.5 }}>{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Portafolio Técnico (Servicios) */}
            <section style={{ padding: '120px 20px', backgroundColor: 'white', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div style={{ color: 'var(--mjm-orange)', fontWeight: 800, letterSpacing: '3px', fontSize: '0.8rem', marginBottom: '20px', textTransform: 'uppercase' }}>
                        Servicios de Ingeniería
                    </div>
                    <h2 style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--mjm-blue)', marginBottom: '25px', lineHeight: 1.05, letterSpacing: '-2px' }}>
                        Portafolio<br/>
                        Técnico
                    </h2>
                </div>

                <div className="section-container" style={{ padding: '0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0' }}>
                    {services.map((service, idx) => {
                        const Icon = service.icon;
                        return (
                            <div key={idx} style={{ 
                                backgroundColor: 'white', 
                                padding: '50px 40px',
                                border: '1px solid #f1f5f9',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}
                            onClick={() => setSelectedService(service)}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.08)';
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.zIndex = '10';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.zIndex = '1';
                            }}
                            >
                                <div style={{ marginBottom: '30px' }}>
                                    <Icon size={36} style={{ color: 'var(--mjm-orange)' }} strokeWidth={1.5} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--mjm-blue)', fontWeight: 800, lineHeight: 1.3, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>
                                    {service.title}
                                </h3>
                                <div style={{ width: '30px', height: '3px', backgroundColor: 'var(--mjm-orange)', marginBottom: '25px' }}></div>
                                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, flexGrow: 1, marginBottom: '40px' }}>
                                    {service.shortDesc}
                                </p>
                                <div style={{ 
                                    color: 'var(--mjm-orange)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    DETALLES TÉCNICOS <ArrowRight size={16} strokeWidth={2.5} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* 4. Innovación Digital (SaaS) */}
            <SaaSSection />

            {/* 5. Carrusel Horizontal de Marcas */}
            <section style={{ padding: '80px 0', backgroundColor: 'white', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ color: 'var(--mjm-orange)', fontWeight: 700, letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '10px' }}>MERCADEO ESTRATÉGICO</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--mjm-blue)' }}>Marcas Aliadas</h2>
                </div>
                
                <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                    <div className="scroll-container">
                        {[...brands, ...brands].map((brand, i) => (
                            <div key={i} className="brand-card">
                                <img src={brand.logo} alt={brand.name} style={{ maxHeight: '60px', width: 'auto', filter: 'grayscale(100%)', opacity: 0.6, transition: 'all 0.3s' }} 
                                    onMouseOver={e => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.opacity = '1'; }}
                                    onMouseOut={e => { e.currentTarget.style.filter = 'grayscale(100%)'; e.currentTarget.style.opacity = '0.6'; }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal de Detalle de Servicio */}
            {selectedService && (
                <div style={{ 
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(47, 66, 62, 0.4)', 
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
                }} onClick={() => setSelectedService(null)}>
                    <div style={{ 
                        backgroundColor: 'white', borderRadius: '32px', maxWidth: '900px', width: '100%', 
                        maxHeight: '94vh', overflowY: 'auto', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
                    }} onClick={e => e.stopPropagation()}>
                        
                        {/* Botón Cerrar */}
                        <button 
                            onClick={() => setSelectedService(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                        >
                            <span style={{ fontSize: '24px', lineHeight: 1, color: '#64748b' }}>&times;</span>
                        </button>

                        <div style={{ padding: '50px' }}>
                            {/* Header Modal */}
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--mjm-blue)', marginBottom: '10px' }}>{selectedService.details?.subtitle || selectedService.title}</h2>
                                <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>{selectedService.longDesc}</p>
                            </div>

                            {/* Contenido Dinámico según detalles */}
                            {selectedService.details?.cards && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                                    {selectedService.details.cards.map((card: any, i: number) => {
                                        const CardIcon = [ClipboardCheck, Database, Calendar, BarChart3, Activity, Clock, Thermometer, Ruler, Search, Wrench, ShieldCheck, HeartPulse, Box, Briefcase, Settings, Users][(selectedService.id - 1) * 4 + i] || CheckCircle2;
                                        return (
                                            <div key={i} style={{ padding: '25px', borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '20px' }}>
                                                <div style={{ color: 'var(--mjm-orange)', flexShrink: 0 }}><CardIcon size={32} strokeWidth={1.5} /></div>
                                                <div>
                                                    <h4 style={{ fontWeight: 800, color: 'var(--mjm-blue)', marginBottom: '5px' }}>{card.title}</h4>
                                                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>{card.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Layout Especial para Capacitación (Imagen + Lista) */}
                            {selectedService.details?.hasMainImage && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', marginBottom: '40px', alignItems: 'center' }}>
                                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', height: '100%', minHeight: '350px', position: 'relative' }}>
                                        <Image src={selectedService.image} alt="Formación" fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {selectedService.details.items.map((item: any, i: number) => {
                                            const ItemIcon = [BookText, GraduationCap, CheckCircle2, UserCheck][i] || CheckCircle2;
                                            return (
                                                <div key={i} style={{ display: 'flex', gap: '15px' }}>
                                                    <div style={{ color: 'var(--mjm-orange)' }}><ItemIcon size={24} /></div>
                                                    <div>
                                                        <h4 style={{ fontWeight: 800, color: 'var(--mjm-blue)', fontSize: '1.05rem', marginBottom: '2px' }}>{item.title}</h4>
                                                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Barra de Certificación ISO 17025 */}
                            {selectedService.details?.certification && (
                                <div style={{ 
                                    backgroundColor: 'var(--mjm-orange)', borderRadius: '16px', padding: '20px 30px', 
                                    color: 'white', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px',
                                    boxShadow: '0 10px 25px rgba(247, 147, 27, 0.3)'
                                }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}>
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Comprometidos con la Trazabilidad</div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Nuestros patrones y entregables cumplen con la norma {selectedService.details.certification}</div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Modal con Botones */}
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
                                <a href="/contacto" className="btn-primary" style={{ padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700 }}>
                                    Solicitar Información
                                </a>
                                {selectedService.isSaaS && (
                                    <a href="/login?tenant=mjm" style={{ 
                                        padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700, 
                                        backgroundColor: '#f1f5f9', border: 'none', color: 'var(--mjm-blue)', display: 'inline-flex', alignItems: 'center', gap: '10px'
                                    }}>
                                        Ir al Portal <ArrowRight size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
