'use client';

import { useEffect, useState } from 'react'
import { Shield, BookOpen, Settings, Package, ChevronDown, ChevronUp, ClipboardList, Database, CalendarDays, BarChart3, Wrench, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function ServiciosPage() {
    const [title, setTitle] = useState('Nuestros Servicios')
    const [subtitle, setSubtitle] = useState('Soluciones integrales de aseguramiento metrológico y calidad.')
    const [bannerImage, setBannerImage] = useState('')
    const [servicesData, setServicesData] = useState<any[]>([])
    const [expandedService, setExpandedService] = useState<number | null>(0)

    useEffect(() => {
        const fetchContent = async () => {
            const keys = [
                'servicios_title', 'servicios_subtitle', 'servicios_image',
                'servicio_1_title', 'servicio_1_desc', 'servicio_1_image', 'servicio_1_subservices',
                'servicio_2_title', 'servicio_2_desc', 'servicio_2_image', 'servicio_2_subservices',
                'servicio_3_title', 'servicio_3_desc', 'servicio_3_image', 'servicio_3_subservices',
                'servicio_4_title', 'servicio_4_desc', 'servicio_4_image', 'servicio_4_subservices',
                'servicio_5_title', 'servicio_5_desc', 'servicio_5_image', 'servicio_5_subservices'
            ]
            const { data } = await supabase.from('site_settings').select('id, value').in('id', keys)
            if (data) {
                const titleData = data.find(i => i.id === 'servicios_title')
                const subtitleData = data.find(i => i.id === 'servicios_subtitle')
                const bannerData = data.find(i => i.id === 'servicios_image')
                if (titleData?.value) setTitle(titleData.value)
                if (subtitleData?.value) setSubtitle(subtitleData.value)
                if (bannerData?.value) setBannerImage(bannerData.value)

                const dynamicServices = [1, 2, 3, 4, 5].map((num) => {
                    const dbSub = data.find(i => i.id === `servicio_${num}_subservices`);
                    let subServices = { title: '', desc: '', items: [] };
                    if (dbSub?.value) {
                        try {
                            subServices = JSON.parse(dbSub.value);
                        } catch (e) { }
                    }

                    return {
                        title: data.find(i => i.id === `servicio_${num}_title`)?.value || `Servicio ${num}`,
                        desc: data.find(i => i.id === `servicio_${num}_desc`)?.value || '',
                        image: data.find(i => i.id === `servicio_${num}_image`)?.value || '',
                        subServices
                    }
                })
                setServicesData(dynamicServices)
            }
        }
        fetchContent()
    }, [])
    return (
        <div className="pb-20">
            {/* Services Header */}
            <div style={{
                position: 'relative',
                backgroundColor: 'var(--mjm-blue)',
                color: 'white',
                padding: '120px 20px',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                {bannerImage && (
                    <Image src={bannerImage} alt="Banner Servicios" fill style={{ objectFit: 'cover', opacity: 0.3 }} priority />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>{title}</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '20px' }}>{subtitle}</p>
                </div>
            </div>

            {/* Services Section */}
            <section className="section-container">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    marginTop: '40px',
                    maxWidth: '1000px',
                    margin: '40px auto 0 auto'
                }}>
                    {servicesData.map((service, i) => {
                        const isExpanded = expandedService === i;
                        const subServices = service.subServices || { title: '', desc: '', items: [] };

                        const getIcon = (sIdx: number, iIdx: number) => {
                            if (sIdx === 0) {
                                if (iIdx === 0) return <ClipboardList size={32} className="text-orange" />;
                                if (iIdx === 1) return <Database size={32} className="text-orange" />;
                                if (iIdx === 2) return <CalendarDays size={32} className="text-orange" />;
                                if (iIdx === 3) return <BarChart3 size={32} className="text-orange" />;
                            }
                            if (sIdx === 1) {
                                if (iIdx === 0) return <BookOpen size={32} className="text-orange" />;
                                if (iIdx === 1) return <Wrench size={32} className="text-orange" />;
                                if (iIdx === 2) return <CheckCircle2 size={32} className="text-orange" />;
                            }
                            if (sIdx === 2) {
                                if (iIdx === 0) return <Settings size={32} className="text-orange" />;
                                if (iIdx === 1) return <Shield size={32} className="text-orange" />;
                                if (iIdx === 2) return <Wrench size={32} className="text-orange" />;
                            }
                            if (sIdx === 3) {
                                if (iIdx === 0) return <Package size={32} className="text-orange" />;
                                if (iIdx === 1) return <Shield size={32} className="text-orange" />;
                                if (iIdx === 2) return <Settings size={32} className="text-orange" />;
                            }
                            if (sIdx === 4) {
                                if (iIdx === 0) return <ClipboardList size={32} className="text-orange" />;
                                if (iIdx === 1) return <CheckCircle2 size={32} className="text-orange" />;
                                if (iIdx === 2) return <Database size={32} className="text-orange" />;
                            }
                            return <CheckCircle2 size={32} className="text-orange" />;
                        };

                        if (subServices.items) {
                            subServices.items = subServices.items.map((item: any, idx: number) => ({
                                ...item,
                                icon: getIcon(i, idx)
                            }));
                        }

                        return (
                            <div key={i} style={{
                                borderRadius: '12px',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                overflow: 'hidden',
                                border: '1px solid #eee'
                            }}>
                                {/* Accordion Header */}
                                <div
                                    onClick={() => setExpandedService(isExpanded ? null : i)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '20px 30px',
                                        cursor: 'pointer',
                                        backgroundColor: isExpanded ? '#f8fafc' : 'white',
                                        transition: 'background-color 0.3s'
                                    }}
                                >
                                    <h2 style={{ fontSize: '1.5rem', color: 'var(--mjm-blue)', margin: 0, fontWeight: 700 }}>
                                        {service.title}
                                    </h2>
                                    <div style={{ color: 'var(--mjm-orange)' }}>
                                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>

                                {/* Accordion Body */}
                                {isExpanded && (
                                    <div style={{ padding: '40px', backgroundColor: '#fdfdfd', borderTop: '1px solid #eee' }}>
                                        {/* Imagen dinámica desde el Panel Administrador */}
                                        {service.image && service.image !== '' && (
                                            <div style={{ position: 'relative', width: '100%', height: '350px', marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                                <Image src={service.image} alt={service.title} fill style={{ objectFit: 'cover' }} />
                                            </div>
                                        )}

                                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                            <h3 style={{ fontSize: '1.8rem', color: 'var(--mjm-blue)', marginBottom: '15px' }}>{subServices.title}</h3>
                                            <p style={{ opacity: 0.8, fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>{subServices.desc}</p>
                                        </div>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                            gap: '20px'
                                        }}>
                                            {subServices.items.map((item: any, idx: number) => (
                                                <div key={idx} style={{
                                                    backgroundColor: 'white',
                                                    padding: '30px 20px',
                                                    borderRadius: '16px',
                                                    border: '1px solid #f1f5f9',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                                    textAlign: 'center',
                                                    transition: 'transform 0.3s',
                                                }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <div style={{
                                                        width: '70px',
                                                        height: '70px',
                                                        borderRadius: item.image ? '16px' : '50%',
                                                        backgroundColor: item.image ? 'transparent' : '#fff4eb',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto 20px auto',
                                                        overflow: 'hidden',
                                                        position: 'relative'
                                                    }}>
                                                        {item.image ? (
                                                            <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} />
                                                        ) : (
                                                            item.icon
                                                        )}
                                                    </div>
                                                    <h4 style={{ color: 'var(--mjm-blue)', fontSize: '1.1rem', marginBottom: '15px', minHeight: '40px' }}>{item.title}</h4>
                                                    <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Dynamic Brands Carousel Section */}
            <section style={{
                backgroundColor: '#f8fafc',
                padding: '100px 0',
                overflow: 'hidden',
                borderTop: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--mjm-blue)', marginBottom: '15px' }}>
                        Marcas y Aliados Estratégicos
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Suministros de productos y servicios con los mejores estándares mundiales.</p>
                </div>

                <div style={{ position: 'relative', width: '100%' }}>
                    <div className="scroll-container">
                        {[
                            // Productos
                            '/brands/productos/CTC.jpg',
                            '/brands/productos/DeltaTrak-logo.jpg',
                            '/brands/productos/Fluke-Logo.png',
                            '/brands/productos/Logo-trumax.png',
                            '/brands/productos/Uni-T-logo.jpg',
                            '/brands/productos/Wilcoxon_Logo-FINAL_RGB-80.png',
                            '/brands/productos/hioki-logo-1024x275.png',
                            '/brands/productos/png-clipart-logo-l-s-starrett-company-brand-tool-graphics-hipercard-logo-text-logo.png',
                            // Servicios
                            '/brands/servicios/1693432797912-pmaaao.png',
                            '/brands/servicios/1763365987FAG (1).png',
                            '/brands/servicios/Adash_www.png',
                            '/brands/servicios/EASYLASER_600px.png',
                            '/brands/servicios/FLIR_logo.svg.png',
                            '/brands/servicios/Fluke_logo.svg.png',
                            '/brands/servicios/Megger_logo_without_slogan.svg.png',
                            '/brands/servicios/SKF-Logo.png',
                            '/brands/servicios/b0a75f_f62ecb4182b64bdbab646485b47f2f5a~mv2.png'
                        ].concat([
                            // Duplicate for infinite scroll
                            '/brands/productos/CTC.jpg',
                            '/brands/productos/DeltaTrak-logo.jpg',
                            '/brands/productos/Fluke-Logo.png',
                            '/brands/productos/Logo-trumax.png',
                            '/brands/productos/Uni-T-logo.jpg',
                            '/brands/productos/Wilcoxon_Logo-FINAL_RGB-80.png',
                            '/brands/productos/hioki-logo-1024x275.png',
                            '/brands/productos/png-clipart-logo-l-s-starrett-company-brand-tool-graphics-hipercard-logo-text-logo.png',
                            '/brands/servicios/1693432797912-pmaaao.png',
                            '/brands/servicios/1763365987FAG (1).png',
                            '/brands/servicios/Adash_www.png',
                            '/brands/servicios/EASYLASER_600px.png',
                            '/brands/servicios/FLIR_logo.svg.png',
                            '/brands/servicios/Fluke_logo.svg.png',
                            '/brands/servicios/Megger_logo_without_slogan.svg.png',
                            '/brands/servicios/SKF-Logo.png',
                            '/brands/servicios/b0a75f_f62ecb4182b64bdbab646485b47f2f5a~mv2.png'
                        ]).map((src, idx) => (
                            <div key={idx} className="brand-card">
                                <Image
                                    src={src}
                                    alt={`Marca aliada ${idx}`}
                                    width={160}
                                    height={80}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
