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
        <div className="bg-slate-50/30">
            {/* 1. Hero */}
            <section 
                className="relative min-h-[90vh] flex items-center text-white px-[6%] pt-[140px] pb-[100px] overflow-visible"
                style={{
                    background: 'linear-gradient(135deg, rgba(47,66,62,0.72) 0%, rgba(99,155,179,0.58) 100%), url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80") no-repeat center center/cover',
                }}
            >
                {/* Badge ISO */}
                <div className="absolute top-[140px] right-[5%] glass-premium rounded-2xl py-3.5 px-5 flex items-center gap-3.5 shadow-lg border border-white/60 z-20 hidden md:flex transition-premium hover:scale-[1.02] text-slate-800">
                    <img src="/about/icontec-badge.png" alt="ICONTEC" className="h-[52px] w-auto" />
                    <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Certificación</div>
                        <div className="text-lg text-[var(--mjm-orange)] font-extrabold leading-none">ISO 9001</div>
                    </div>
                </div>

                {/* Logo circular grande - Glass Effect */}
                <div className="absolute bottom-[5%] right-[5%] glass-premium-dark rounded-2xl py-3 px-10 flex items-center justify-center shadow-2xl z-5 opacity-90 hidden lg:flex transition-premium hover:scale-[1.01] hover:opacity-100">
                    <img src="/logo1.png" alt="MJM Logo decorativo" className="h-[240px] w-auto" />
                </div>

                {/* Texto principal */}
                <div className="max-w-[620px] z-10 relative">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                        Expertos en{' '}
                        <span className="text-[var(--mjm-orange)] block font-extrabold tracking-tighter">
                            Aseguramiento Metrológico
                        </span>
                    </h1>

                    <p className="text-base md:text-lg leading-relaxed text-white/90 mb-10 max-w-lg font-light">
                        Consultoría, capacitación, verificación y calibración de instrumentos con los más altos estándares de calidad y confiabilidad.
                    </p>

                    <div className="flex gap-4 flex-wrap">
                        <a href="/contacto" className="btn-primary shadow-lg shadow-[rgba(245,130,32,0.25)]">
                            Contáctanos <ArrowRight size={18} className="ml-2" />
                        </a>
                        <a href="/servicios" className="px-7 py-3.5 text-base font-semibold border-2 border-white/60 bg-transparent text-white rounded-xl transition-premium hover:bg-white/10 hover:border-white">
                            Nuestros Servicios
                        </a>
                    </div>
                </div>
            </section>

            {/* 2. Nuestro Alcance */}
            <section className="relative overflow-hidden bg-[var(--mjm-orange)] text-white py-24 md:py-32">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(255,255,255,0.12)_0%,_transparent_70%)] rounded-full blur-[80px] pointer-events-none"></div>

                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
                        <div className="lg:col-span-5 relative">
                            <div className="relative h-[480px] md:h-[540px] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-white/10">
                                <Image src={teamImage} alt="Equipo MJM" fill className="object-cover object-top" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="glass-premium rounded-2xl p-6 border border-white/20 shadow-lg text-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[var(--mjm-orange)]/10 p-3 rounded-xl">
                                                <Shield size={24} className="text-[var(--mjm-orange)]" />
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-lg text-[var(--mjm-blue)]">Compromiso MJM</div>
                                                <div className="text-slate-500 text-sm font-medium">Calidad certificada en cada proceso.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col justify-center">
                            <div className="bg-white/15 text-white backdrop-blur-md inline-block self-start px-4 py-1.5 rounded-full font-bold tracking-widest uppercase text-[0.75rem] mb-6 border border-white/10">
                                TRAYECTORIA Y CONFIANZA
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight text-white"> 
                                Nuestro <br/> 
                                <span className="text-amber-100 font-black">Alcance</span> 
                            </h2>
                            
                            <p className="text-lg leading-relaxed mb-10 text-white/90 font-light max-w-2xl"> 
                                Con más de 12 años de experiencia, Asesorías Integrales MJM S.A.S. se ha consolidado como el aliado estratégico ideal para empresas que buscan la excelencia en sus sistemas de medición.
                            </p>
                            
                            <div className="grid gap-8">
                                {[
                                    { num: "01", title: "CONSULTORÍA ISO 9001", desc: "Asesoramos la implementación de sistemas de calidad metrológica bajo los más altos estándares internacionales." },
                                    { num: "02", title: "CRITERIO TÉCNICO", desc: "Nuestros expertos brindan soporte especializado para la toma de decisiones críticas en aseguramiento metrológico." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 items-start">
                                        <div className="bg-white/90 rounded-xl px-3.5 py-2.5 flex items-center justify-center shrink-0 shadow-md text-[var(--mjm-blue)] font-black text-lg">
                                            {item.num}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg mb-1.5 text-white tracking-wide uppercase">{item.title}</div>
                                            <div className="text-white/80 leading-relaxed font-light">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Portafolio Técnico (Servicios) */}
            <section className="py-24 md:py-32 bg-slate-50/50 relative">
                <div className="text-center mb-16 md:mb-24">
                    <div className="text-[var(--mjm-orange)] font-extrabold tracking-widest text-xs uppercase mb-4">
                        Servicios de Ingeniería
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--mjm-blue)] mb-6 leading-tight tracking-tight">
                        Portafolio <span className="font-light">Técnico</span>
                    </h2>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                    {services.map((service, idx) => {
                        const Icon = service.icon;
                        return (
                            <div key={idx} className="group relative bg-white p-10 md:p-12 border-r border-b border-slate-100 flex flex-col items-center text-center cursor-pointer transition-premium hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 hover:z-10"
                            onClick={() => setSelectedService(service)}
                            >
                                <div className="mb-8 p-4 rounded-2xl bg-slate-50 transition-premium group-hover:bg-[var(--mjm-orange)]/10">
                                    <Icon size={32} className="text-[var(--mjm-orange)] transition-premium" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-base font-extrabold text-[var(--mjm-blue)] tracking-wider uppercase mb-4 group-hover:text-[var(--mjm-orange)] transition-premium">
                                    {service.title}
                                </h3>
                                <div className="w-8 h-[2px] bg-slate-200 group-hover:bg-[var(--mjm-orange)] transition-premium mb-6"></div>
                                <p className="text-slate-500 font-light leading-relaxed mb-8 text-sm flex-grow">
                                    {service.shortDesc}
                                </p>
                                <div className="text-[var(--mjm-orange)] font-bold text-xs tracking-wider uppercase flex items-center gap-2 mt-auto group-hover:translate-x-1 transition-premium">
                                    DETALLES TÉCNICOS <ArrowRight size={14} strokeWidth={2.5} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* 4. Innovación Digital (SaaS) */}
            <SaaSSection />

            {/* 5. Carrusel Horizontal de Marcas */}
            <section className="py-20 bg-white border-t border-slate-50 overflow-hidden">
                <div className="text-center mb-12">
                    <div className="text-[var(--mjm-orange)] font-bold tracking-widest text-xs uppercase mb-3">MERCADEO ESTRATÉGICO</div>
                    <h2 className="text-3xl font-extrabold text-[var(--mjm-blue)] tracking-tight">Marcas Aliadas</h2>
                </div>
                
                <div className="relative w-full overflow-hidden">
                    <div className="scroll-container py-4">
                        {[...brands, ...brands].map((brand, i) => (
                            <div key={i} className="brand-card transition-premium">
                                <img src={brand.logo} alt={brand.name} className="max-h-[50px] w-auto filter grayscale opacity-45 transition-premium hover:grayscale-0 hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal de Detalle de Servicio */}
            {selectedService && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[1000] p-4 transition-premium" onClick={() => setSelectedService(null)}>
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative shadow-2xl border border-slate-100 transition-premium" onClick={e => e.stopPropagation()}>
                        
                        {/* Botón Cerrar */}
                        <button 
                            onClick={() => setSelectedService(null)}
                            className="absolute top-6 right-6 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full w-10 h-10 flex items-center justify-center transition-premium z-10"
                        >
                            <span className="text-2xl leading-none">&times;</span>
                        </button>

                        <div className="p-8 md:p-12">
                            {/* Header Modal */}
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-extrabold text-[var(--mjm-blue)] mb-4">{selectedService.details?.subtitle || selectedService.title}</h2>
                                <p className="text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">{selectedService.longDesc}</p>
                            </div>

                            {/* Contenido Dinámico según detalles */}
                            {selectedService.details?.cards && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                    {selectedService.details.cards.map((card: any, i: number) => {
                                        const CardIcon = [ClipboardCheck, Database, Calendar, BarChart3, Activity, Clock, Thermometer, Ruler, Search, Wrench, ShieldCheck, HeartPulse, Box, Briefcase, Settings, Users][(selectedService.id - 1) * 4 + i] || CheckCircle2;
                                        return (
                                            <div key={i} className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 flex gap-5 transition-premium hover:bg-slate-50 hover:border-slate-200">
                                                <div className="text-[var(--mjm-orange)] shrink-0"><CardIcon size={28} strokeWidth={1.5} /></div>
                                                <div>
                                                    <h4 className="font-bold text-[var(--mjm-blue)] mb-2 text-base">{card.title}</h4>
                                                    <p className="text-slate-500 font-light text-sm leading-relaxed">{card.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Layout Especial para Capacitación (Imagen + Lista) */}
                            {selectedService.details?.hasMainImage && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 items-center">
                                    <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 h-64 md:h-80 relative">
                                        <Image src={selectedService.image} alt="Formación" fill className="object-cover" />
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        {selectedService.details.items.map((item: any, i: number) => {
                                            const ItemIcon = [BookText, GraduationCap, CheckCircle2, UserCheck][i] || CheckCircle2;
                                            return (
                                                <div key={i} className="flex gap-4">
                                                    <div className="text-[var(--mjm-orange)] mt-0.5"><ItemIcon size={20} /></div>
                                                    <div>
                                                        <h4 className="font-bold text-[var(--mjm-blue)] text-base mb-1">{item.title}</h4>
                                                        <p className="text-slate-500 font-light text-sm leading-relaxed">{item.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Barra de Certificación ISO 17025 */}
                            {selectedService.details?.certification && (
                                <div className="bg-[var(--mjm-orange)] rounded-2xl p-6 text-white flex items-center gap-5 mb-10 shadow-lg shadow-[rgba(247,147,27,0.15)]">
                                    <div className="bg-white/20 p-3 rounded-full shrink-0">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg mb-1">Comprometidos con la Trazabilidad</div>
                                        <div className="text-white/90 font-light text-sm">Nuestros patrones y entregables cumplen con la norma {selectedService.details.certification}</div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Modal con Botones */}
                            <div className="flex gap-4 justify-center border-t border-slate-100 pt-8 flex-wrap">
                                <a href="/contacto" className="btn-primary py-3 px-8 rounded-xl font-bold">
                                    Solicitar Información
                                </a>
                                {selectedService.isSaaS && (
                                    <a href="/login?tenant=mjm" className="py-3.5 px-8 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-[var(--mjm-blue)] transition-premium inline-flex items-center gap-2">
                                        Ir al Portal <ArrowRight size={18} />
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
