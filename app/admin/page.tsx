'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, LogOut, BarChart3, Upload, Save, Image as ImageIcon, Home, Briefcase, Phone } from 'lucide-react'
import Image from 'next/image'

export default function AdminDashboard() {
    const [session, setSession] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [contentTab, setContentTab] = useState('inicio')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Content State
    const [content, setContent] = useState<Record<string, string>>({
        home_hero_title: '',
        home_hero_subtitle: '',
        nosotros_url: '',
        servicios_title: '',
        servicios_subtitle: '',
        servicio_1_title: '',
        servicio_1_desc: '',
        servicio_1_image: '',
        servicio_2_title: '',
        servicio_2_desc: '',
        servicio_2_image: '',
        servicio_3_title: '',
        servicio_3_desc: '',
        servicio_3_image: '',
        servicio_4_title: '',
        servicio_4_desc: '',
        servicio_4_image: '',
        servicio_5_title: '',
        servicio_5_desc: '',
        servicio_5_image: '',
        contacto_email_1: '',
        contacto_phone_1: '',
        contacto_phone_2: '',
        contacto_address: '',
        servicios_image: '',
        servicio_1_subservices: '',
        servicio_2_subservices: '',
        servicio_3_subservices: '',
        servicio_4_subservices: '',
        servicio_5_subservices: ''
    })

    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login')
            } else {
                setSession(session)
                fetchAllContent()
            }
        })
    }, [router])

    const fetchAllContent = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('site_settings').select('*')
            if (error) throw error
            if (data) {
                const newContent = { ...content }
                data.forEach(item => {
                    if (item.id in newContent) {
                        newContent[item.id] = item.value
                    }
                })

                // Mapear textos estáticos al panel si están vacíos en BD
                const defaultTitles = ["Aseguramiento Metrológico", "Capacitación", "Calibración", "Suministros", "Diagnóstico"];
                const defaultDescs = [
                    "Garantizamos la trazabilidad y confiabilidad de sus mediciones según estándares internacionales.",
                    "Formación especializada en metrología y uso de instrumentación técnica.",
                    "Verificación y calibración precisa de instrumentos en diversas magnitudes.",
                    "Equipos y suministros técnicos de alta calidad para sus procesos productivos.",
                    "Diagnóstico, mantenimiento y verificación técnica integral de estado funcional."
                ];
                const defaultSubServices = [
                    {
                        title: "Planes y Programas de Aseguramiento y Control",
                        desc: "Gestionamos integralmente sus procesos de medición para garantizar la conformidad y la calidad de sus productos y servicios",
                        items: [
                            { title: "Clasificación de Equipos", desc: "Identificación y clasificación detallada de todos los instrumentos de medición para un control efectivo" },
                            { title: "Levantamiento de Información", desc: "Recopilación exhaustiva de datos técnicos y metrológicos para establecer la línea base del aseguramiento" },
                            { title: "Cronogramas Integrados", desc: "Planificación estratégica de rutinas para minimizar tiempos de inactividad" },
                            { title: "Indicadores de Gestión", desc: "Visualización de datos y métricas clave para la toma de decisiones basada en evidencia" }
                        ]
                    },
                    {
                        title: "Eventos y Capacitaciones",
                        desc: "Generamos espacios para nuestros clientes y aliados, con el fin de promover la cultura metrológica, fortalecer conceptos y apoyar la aclaración de inquietudes.",
                        items: [
                            { title: "Conceptos Básicos", desc: "Formación en conceptos fundamentales de metrología aplicable a su industria." },
                            { title: "Uso de Instrumentos", desc: "Capacitación práctica en el uso y manipulación adecuada de instrumentos de medición." },
                            { title: "Interpretación", desc: "Guía experta para la correcta lectura e interpretación de certificados de calibración." }
                        ]
                    },
                    {
                        title: "Servicios de Calibración, Verificación y Mantenimiento",
                        desc: "Fortalecemos la confianza metrológica en la toma de mediciones a través de servicios de calidad, responsabilidad y compromiso.",
                        items: [
                            { title: "Calibración Trazable", desc: "Servicios de calibración con patrones directamente trazables a estándares nacionales o internacionales." },
                            { title: "Laboratorios Acreditados", desc: "Operaciones locales y convenios con aliados bajo el cumplimiento de lineamientos ISO/IEC 17025." },
                            { title: "Verificación y Ajuste", desc: "Comprobación del estado en el que se encuentra su instrumento respecto al error máximo permitido." }
                        ]
                    },
                    {
                        title: "Suministros e Instrumentación",
                        desc: "Suministramos productos orientados a optimizar la medición y análisis de variables operacionales.",
                        items: [
                            { title: "Equipos y Repuestos", desc: "Amplio catálogo en instrumentos de medición industrial y repuestos garantizados." },
                            { title: "Accesorios y Estuches", desc: "Suministro de elementos para la conservación y transporte seguro de los equipos." },
                            { title: "Complementos Óptimos", desc: "Todo lo necesario para asegurar el óptimo funcionamiento continuo de la instrumentación." }
                        ]
                    },
                    {
                        title: "Diagnóstico Integral y Verificación",
                        desc: "Estamos comprometidos con la generación de valor para nuestros clientes a través de diagnósticos rigurosos.",
                        items: [
                            { title: "Diagnóstico Técnico", desc: "Evaluación minuciosa e integral del estado funcional y metrológico de la base instalada." },
                            { title: "Mantenimiento Preventivo", desc: "Intervenciones proactivas para prolongar la vida útil de los equipos de medición." },
                            { title: "Reporte de Desempeño", desc: "Entrega de informes consolidados de verificación técnica para toma de decisiones." }
                        ]
                    }
                ];

                for (let i = 1; i <= 5; i++) {
                    if (!newContent[`servicio_${i}_title`]) newContent[`servicio_${i}_title`] = defaultTitles[i - 1];
                    if (!newContent[`servicio_${i}_desc`]) newContent[`servicio_${i}_desc`] = defaultDescs[i - 1];
                    if (!newContent[`servicio_${i}_subservices`]) newContent[`servicio_${i}_subservices`] = JSON.stringify(defaultSubServices[i - 1]);
                }
                if (!newContent.servicios_title) newContent.servicios_title = 'Nuestros Servicios';
                if (!newContent.servicios_subtitle) newContent.servicios_subtitle = 'Soluciones integrales de aseguramiento metrológico y calidad.';

                setContent(newContent)
            }
        } catch (error) {
            console.error('Error fetching content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleTextChange = (id: string, value: string) => {
        setContent(prev => ({ ...prev, [id]: value }))
    }

    const handleSubServiceChange = (num: number, field: string, value: string, itemIdx?: number) => {
        const key = `servicio_${num}_subservices`;
        const currentData = content[key];
        if (!currentData) return;

        try {
            const parsed = JSON.parse(currentData);
            if (itemIdx !== undefined) {
                parsed.items[itemIdx][field] = value;
            } else {
                parsed[field] = value;
            }
            setContent(prev => ({ ...prev, [key]: JSON.stringify(parsed) }));
        } catch (e) {
            console.error("Error parsing subservices JSON", e);
        }
    }

    const saveTextContent = async (idsToSave: string[]) => {
        setSaving(true)
        try {
            const updates = idsToSave.map(id => ({
                id,
                // @ts-ignore
                value: content[id]
            }))

            const { error } = await supabase.from('site_settings').upsert(updates)

            if (error) throw error
            alert('¡Contenido guardado exitosamente!')
        } catch (error: any) {
            alert('Error guardando el contenido: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, settingId: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('website-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('website-images')
                .getPublicUrl(filePath)

            setContent(prev => ({ ...prev, [settingId]: publicUrl }))

            const { error: dbError } = await supabase.from('site_settings').upsert({
                id: settingId,
                value: publicUrl
            })

            if (dbError) throw dbError

            alert('Imagen actualizada exitosamente')
        } catch (error: any) {
            alert('Error subiendo la imagen: ' + error.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!session || loading) return <div style={{ padding: '50px', textAlign: 'center', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando administrador...</div>

    return (
        <div style={{ display: 'flex', height: '100vh', paddingTop: '100px' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                backgroundColor: 'var(--mjm-blue)',
                color: 'white',
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 100px)'
            }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '40px', color: 'var(--mjm-orange)' }}>ADMIN DASHBOARD</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', borderRadius: '8px', fontSize: '1rem', textAlign: 'left', cursor: 'pointer' }}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'content' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', borderRadius: '8px', fontSize: '1rem', textAlign: 'left', cursor: 'pointer' }}>
                        <FileText size={20} /> Editar Contenido
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'transparent', border: 'none', color: 'white', borderRadius: '8px', fontSize: '1rem', textAlign: 'left', opacity: 0.5, cursor: 'not-allowed' }}>
                        <BarChart3 size={20} /> Estadísticas
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'transparent', border: 'none', color: 'white', borderRadius: '8px', fontSize: '1rem', textAlign: 'left', opacity: 0.5, cursor: 'not-allowed' }}>
                        <Settings size={20} /> Configuración
                    </button>
                </nav>
                <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'transparent', border: 'none', color: '#ff4444', borderRadius: '8px', fontSize: '1rem', marginTop: 'auto', cursor: 'pointer' }}>
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px', backgroundColor: '#f9f9f9', overflowY: 'auto' }}>
                {activeTab === 'dashboard' ? (
                    <>
                        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Bienvenido, Administrador</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginBottom: '15px' }}>Resumen de Sistema</h3>
                                <p style={{ opacity: 0.8, lineHeight: 1.6 }}>El Módulo de Gobernanza está activo. Ahora puedes modificar textos e imágenes de todas las secciones principales públicas usando el panel de "Editar Contenido".</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ maxWidth: '900px' }}>
                            <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Editar Contenido de la Web</h1>

                            {/* Content Navigation */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                                <button onClick={() => setContentTab('inicio')} className={contentTab === 'inicio' ? 'btn-primary' : ''} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: contentTab === 'inicio' ? 'var(--mjm-blue)' : 'transparent', color: contentTab === 'inicio' ? 'white' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Home size={18} /> Inicio</button>
                                <button onClick={() => setContentTab('nosotros')} className={contentTab === 'nosotros' ? 'btn-primary' : ''} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: contentTab === 'nosotros' ? 'var(--mjm-blue)' : 'transparent', color: contentTab === 'nosotros' ? 'white' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><ImageIcon size={18} /> Nosotros</button>
                                <button onClick={() => setContentTab('servicios')} className={contentTab === 'servicios' ? 'btn-primary' : ''} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: contentTab === 'servicios' ? 'var(--mjm-blue)' : 'transparent', color: contentTab === 'servicios' ? 'white' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} /> Servicios</button>
                                <button onClick={() => setContentTab('contacto')} className={contentTab === 'contacto' ? 'btn-primary' : ''} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: contentTab === 'contacto' ? 'var(--mjm-blue)' : 'transparent', color: contentTab === 'contacto' ? 'white' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={18} /> Contacto</button>
                            </div>

                            {/* INICIO TAB */}
                            {contentTab === 'inicio' && (
                                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ marginBottom: '20px', color: 'var(--mjm-blue)' }}>Textos de la Página Principal</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Título Principal (Hero)</label>
                                            <input
                                                type="text"
                                                value={content.home_hero_title}
                                                onChange={(e) => handleTextChange('home_hero_title', e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Subtítulo Principal</label>
                                            <textarea
                                                value={content.home_hero_subtitle}
                                                onChange={(e) => handleTextChange('home_hero_subtitle', e.target.value)}
                                                rows={3}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'vertical' }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => saveTextContent(['home_hero_title', 'home_hero_subtitle'])}
                                            disabled={saving}
                                            className="btn-primary"
                                            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios de Inicio'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* NOSOTROS TAB */}
                            {contentTab === 'nosotros' && (
                                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ marginBottom: '20px', color: 'var(--mjm-blue)' }}>Imagen del Equipo</h3>
                                    <p style={{ opacity: 0.7, marginBottom: '20px', lineHeight: 1.6 }}>Esta imagen representa la empresa en la página de Nosotros y en la vista rápida de la página principal.</p>

                                    <div style={{ marginBottom: '30px' }}>
                                        <div style={{ position: 'relative', height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f0f0', border: '1px solid #e2e8f0' }}>
                                            {content.nosotros_url ? (
                                                <Image src={content.nosotros_url} alt="Current team image" fill style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>Sin imagen guardada</div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'nosotros_url')}
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            id="image-upload"
                                            disabled={uploading}
                                        />
                                        <label htmlFor="image-upload" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                                            padding: '14px 28px', backgroundColor: 'var(--mjm-orange)', color: 'white',
                                            borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer',
                                            fontWeight: 600, opacity: uploading ? 0.7 : 1, transition: 'all 0.3s'
                                        }}>
                                            <Upload size={20} />
                                            {uploading ? 'Subiendo nueva imagen a Supabase...' : 'Subir Nueva Imagen'}
                                        </label>
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Se guarda automáticamente.</span>
                                    </div>
                                </div>
                            )}

                            {/* SERVICIOS TAB */}
                            {contentTab === 'servicios' && (
                                <>
                                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ marginBottom: '20px', color: 'var(--mjm-blue)' }}>Encabezado de Servicios</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Título de la Página</label>
                                                <input
                                                    type="text"
                                                    value={content.servicios_title}
                                                    onChange={(e) => handleTextChange('servicios_title', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Descripción o Subtítulo</label>
                                                <textarea
                                                    value={content.servicios_subtitle}
                                                    onChange={(e) => handleTextChange('servicios_subtitle', e.target.value)}
                                                    rows={2}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'vertical' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Imagen / Foto del Banner Principal</label>
                                                <div style={{ position: 'relative', height: '150px', width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f0f0', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                                                    {content.servicios_image ? (
                                                        <Image src={content.servicios_image} alt="Banner Servicios" fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: '0.9rem' }}>Sin imagen guardada</div>
                                                    )}
                                                </div>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'servicios_image')}
                                                    style={{ display: 'none' }}
                                                    id="servicios-banner-upload"
                                                    disabled={uploading}
                                                />
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <label htmlFor="servicios-banner-upload" style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                                                        padding: '10px 20px', backgroundColor: 'var(--mjm-orange)', color: 'white',
                                                        borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer',
                                                        fontWeight: 600, transition: 'all 0.3s', fontSize: '0.9rem'
                                                    }}>
                                                        <Upload size={16} />
                                                        {uploading ? 'Subiendo...' : 'Actualizar Imagen del Banner'}
                                                    </label>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => saveTextContent(['servicios_title', 'servicios_subtitle'])}
                                                disabled={saving}
                                                className="btn-primary"
                                                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                                <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Encabezado'}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginTop: '30px' }}>
                                        <h3 style={{ marginBottom: '20px', color: 'var(--mjm-blue)' }}>Tarjetas de Servicios</h3>
                                        <p style={{ opacity: 0.7, marginBottom: '20px' }}>A continuación puedes configurar cada uno de los 5 servicios principales mostrados en tarjetas.</p>

                                        {[1, 2, 3, 4, 5].map((num) => {
                                            const titleKey = `servicio_${num}_title` as keyof typeof content;
                                            const descKey = `servicio_${num}_desc` as keyof typeof content;
                                            const imageKey = `servicio_${num}_image` as keyof typeof content;

                                            return (
                                                <div key={num} style={{ borderBottom: num < 5 ? '1px solid #e2e8f0' : 'none', paddingBottom: '30px', marginBottom: '30px' }}>
                                                    <h4 style={{ color: 'var(--mjm-orange)', marginBottom: '15px' }}>Servicio #{num}</h4>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                        <div>
                                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Título del Servicio</label>
                                                            <input
                                                                type="text"
                                                                value={content[titleKey]}
                                                                onChange={(e) => handleTextChange(titleKey, e.target.value)}
                                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', marginBottom: '15px' }}
                                                            />

                                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Descripción Breve</label>
                                                            <textarea
                                                                value={content[descKey]}
                                                                onChange={(e) => handleTextChange(descKey, e.target.value)}
                                                                rows={3}
                                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'vertical', marginBottom: '15px' }}
                                                            />

                                                            <button
                                                                onClick={() => saveTextContent([titleKey, descKey])}
                                                                disabled={saving}
                                                                className="btn-primary"
                                                                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <Save size={18} /> Guardar Textos S. {num}
                                                            </button>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Imagen / Banner del Servicio</label>
                                                            <div style={{ position: 'relative', height: '150px', width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f0f0', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                                                                {content[imageKey] ? (
                                                                    <Image src={content[imageKey]} alt={`Servicio ${num}`} fill style={{ objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: '0.9rem' }}>Sin imagen (use la opción de abajo)</div>
                                                                )}
                                                            </div>

                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        handleImageUpload(e, imageKey);
                                                                    }
                                                                }}
                                                                style={{ display: 'none' }}
                                                                id={`image-upload-srv-${num}`}
                                                                disabled={uploading}
                                                            />
                                                            <label htmlFor={`image-upload-srv-${num}`} style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                                                padding: '10px 20px', backgroundColor: 'var(--mjm-blue)', color: 'white',
                                                                borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer',
                                                                fontWeight: 600, opacity: uploading ? 0.7 : 1, transition: 'all 0.3s', fontSize: '0.9rem'
                                                            }}>
                                                                <Upload size={16} />
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* SUB-SERVICES UI CON JSON */}
                                                    {(() => {
                                                        const subKey = `servicio_${num}_subservices`;
                                                        const subDataString = content[subKey];
                                                        if (!subDataString) return null;

                                                        let subData;
                                                        try {
                                                            subData = JSON.parse(subDataString);
                                                        } catch (e) {
                                                            return <div style={{ color: 'red', marginTop: '10px' }}>Error cargando detalles del acordeón.</div>;
                                                        }

                                                        return (
                                                            <div style={{ marginTop: '30px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                                <h5 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--mjm-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <FileText size={20} /> Opciones del Acordeón (Detalles del Servicio)
                                                                </h5>

                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                                                    <div>
                                                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Título Principal del Acordeón</label>
                                                                        <input
                                                                            type="text"
                                                                            value={subData.title || ''}
                                                                            onChange={(e) => handleSubServiceChange(num, 'title', e.target.value)}
                                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Descripción General del Acordeón</label>
                                                                        <textarea
                                                                            value={subData.desc || ''}
                                                                            onChange={(e) => handleSubServiceChange(num, 'desc', e.target.value)}
                                                                            rows={2}
                                                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <h6 style={{ marginBottom: '15px', color: '#555', fontSize: '1.05rem', fontWeight: 600 }}>Cajas Blancas Internas (Sub-Ítems)</h6>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                                    {subData.items && subData.items.map((item: any, idx: number) => (
                                                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.5fr) 2fr 1fr', gap: '15px', padding: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', alignItems: 'start' }}>
                                                                            <div>
                                                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--mjm-orange)' }}>Título. Ítem {idx + 1}</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.title || ''}
                                                                                    onChange={(e) => handleSubServiceChange(num, 'title', e.target.value, idx)}
                                                                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--mjm-orange)' }}>Descripción. Ítem {idx + 1}</label>
                                                                                <textarea
                                                                                    value={item.desc || ''}
                                                                                    onChange={(e) => handleSubServiceChange(num, 'desc', e.target.value, idx)}
                                                                                    rows={3}
                                                                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                                                                                />
                                                                            </div>
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                <label style={{ display: 'block', marginBottom: '2px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--mjm-orange)' }}>Icono / Foto {idx + 1}</label>
                                                                                {item.image && (
                                                                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                                                                                        <Image src={item.image} alt="preview" fill style={{ objectFit: 'cover' }} />
                                                                                    </div>
                                                                                )}
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    id={`upload-icon-${num}-${idx}`}
                                                                                    style={{ display: 'none' }}
                                                                                    onChange={async (e) => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (!file) return;
                                                                                        const fileExt = file.name.split('.').pop();
                                                                                        const fileName = `icon-${Math.random()}.${fileExt}`;
                                                                                        const { error: uploadError } = await supabase.storage.from('website-images').upload(fileName, file);
                                                                                        if (!uploadError) {
                                                                                            const { data: { publicUrl } } = supabase.storage.from('website-images').getPublicUrl(fileName);
                                                                                            handleSubServiceChange(num, 'image', publicUrl, idx);
                                                                                        } else {
                                                                                            alert("Error subiendo la imagen del icono: " + uploadError.message);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <label htmlFor={`upload-icon-${num}-${idx}`} style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#333', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, textAlign: 'center', maxWidth: '120px' }}>
                                                                                    Subir archivo
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <button
                                                                    onClick={() => saveTextContent([subKey])}
                                                                    disabled={saving}
                                                                    className="btn-primary"
                                                                    style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', padding: '12px 24px', backgroundColor: '#10b981' }}>
                                                                    <Save size={18} /> Guardar Detalles y Sub-Ítems (Acordeón {num})
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}

                            {/* CONTACTO TAB */}
                            {contentTab === 'contacto' && (
                                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ marginBottom: '20px', color: 'var(--mjm-blue)' }}>Información de Contacto</h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Correo Principal</label>
                                            <input
                                                type="text"
                                                value={content.contacto_email_1}
                                                onChange={(e) => handleTextChange('contacto_email_1', e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Correo Secundario</label>
                                            <input
                                                type="text"
                                                value={content.contacto_email_2}
                                                onChange={(e) => handleTextChange('contacto_email_2', e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Teléfono / Celular 1</label>
                                            <input
                                                type="text"
                                                value={content.contacto_phone_1}
                                                onChange={(e) => handleTextChange('contacto_phone_1', e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Teléfono / Celular 2</label>
                                            <input
                                                type="text"
                                                value={content.contacto_phone_2}
                                                onChange={(e) => handleTextChange('contacto_phone_2', e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#444' }}>Dirección Física</label>
                                            <input
                                                type="text"
                                                value={content.contacto_address}
                                                onChange={(e) => handleTextChange('contacto_address', e.target.value)}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => saveTextContent(['contacto_email_1', 'contacto_email_2', 'contacto_phone_1', 'contacto_phone_2', 'contacto_address'])}
                                        disabled={saving}
                                        className="btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px' }}>
                                        <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Información de Contacto'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
