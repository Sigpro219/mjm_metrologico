"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { machineService } from "@/services/machines";
import { useState, useEffect } from "react";
import {
  Printer,
  Wrench,
  Activity,
  ArrowLeft,
  User,
  Package,
  Settings2,
  History,
  FileText,
  Calendar,
  AlertTriangle,
  Zap,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/components/providers/TenantProvider";
import { storageService } from "@/services/storage";

export default function AssetDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { tenantId, brandName } = useTenant();
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchLogo = async () => {
      const url = await storageService.getLogoUrl(tenantId);
      setLogoUrl(url);
    };
    fetchLogo();
  }, [tenantId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["asset-detail", id],
    queryFn: () => machineService.getMachineDetail(id as string),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="w-12 h-12 border-4 border-amber border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">Cargando Hoja de Vida ISO...</p>
    </div>
  );

  if (error || !data) return (
    <div className="p-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
      <AlertTriangle className="mx-auto w-12 h-12 mb-4" />
      <h3 className="text-lg font-bold">Error al cargar el equipo</h3>
      <p className="text-sm opacity-70">No pudimos encontrar el activo solicitado o el servidor tardó demasiado.</p>
      <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest">Regresar</button>
    </div>
  );

  const { asset, history } = data;
  const isOperational = asset.metadata?.status === "Operativo" || !asset.metadata?.status;

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="group flex items-center text-slate-400 hover:text-slate-800 font-bold transition-all text-[11px] uppercase tracking-[0.2em]"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-amber group-hover:text-amber transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver al Inventario
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[11px] hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider"
          >
            <Printer className="w-4 h-4 text-blue-500" /> Exportar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* Main Header / ISO Banner */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative print:border-none print:shadow-none">
        {/* Dynamic Background Pattern */}
        <div className={`absolute top-0 left-0 w-full h-40 transition-colors duration-1000 ${isOperational ? 'bg-slate-900' : 'bg-red-900'}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          {/* Logo Branding (ISO Style) - Further refined vertical alignment */}
          <div className="absolute top-4 right-10 flex items-center gap-6">
             <div className="text-right hidden md:block">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0">Hoja de Vida de Equipo</p>
                <p className="text-[10px] font-bold text-amber/90 tracking-widest uppercase mt-[-2px]">Sistema de Gestión</p>
             </div>
             <div className="bg-white p-2.5 rounded-xl shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500">
                {logoUrl ? (
                  <img src={logoUrl} alt={`${brandName} Logo`} className="h-9 w-auto object-contain" />
                ) : (
                  <div className="h-9 w-24 bg-slate-100 animate-pulse rounded" />
                )}
             </div>
          </div>
        </div>

        <div className="px-10 pb-10 pt-20 relative z-10 flex flex-col md:flex-row items-end gap-8">
           {/* Equipment Portrait */}
           <div className="w-64 h-64 bg-white rounded-4xl shadow-2xl p-2 shrink-0 border-4 border-white overflow-hidden group relative">
              {asset.metadata?.image_url ? (
                <img 
                  src={asset.metadata.image_url} 
                  alt={asset.name} 
                  className={`w-full h-full object-cover rounded-3xl transition-all duration-700 ${!isOperational ? 'grayscale' : 'group-hover:scale-110'}`} 
                />
              ) : (
                <div className="w-full h-full bg-slate-50 rounded-3xl flex items-center justify-center">
                  <Settings2 className="w-20 h-20 text-slate-200" />
                </div>
              )}
              {/* Status Badge Over Image */}
              <div className={`absolute bottom-6 left-6 right-6 backdrop-blur-md py-2 px-4 rounded-xl border border-white/30 flex items-center justify-center gap-2 shadow-xl ${isOperational ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                 <div className={`w-2 h-2 rounded-full bg-white ${isOperational ? 'animate-pulse' : ''}`} />
                 <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{isOperational ? 'OPERATIVO' : 'EN PARADA'}</span>
              </div>
           </div>

           {/* Core Info */}
           <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[11px] font-black text-amber bg-amber/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-amber/20 shadow-sm font-mono">
                  {asset.code}
                </span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{asset.name}</h1>
              
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Detail Column (4/12) */}
        <div className="lg:col-span-4 space-y-6">
           {/* Ficha Técnica Card */}
           <section className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/30 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <Wrench className="w-5 h-5 text-amber" /> Ficha Técnica
              </h3>
              <div className="space-y-4">
                <DetailItem label="Marca" value={asset.metadata?.brand} />
                <DetailItem label="Modelo" value={asset.metadata?.model} />
                <DetailItem label="Nº Serie" value={asset.metadata?.serial} />
                <DetailItem label="Año Fab." value={asset.metadata?.mfg_year} />
                <DetailItem label="Fuente" value={asset.metadata?.power_source} />
                <DetailItem label="Capacidad" value={asset.metadata?.capacity} />
                <DetailItem label="Instalación" value={asset.metadata?.install_date ? new Date(asset.metadata.install_date).toLocaleDateString() : '---'} />
              </div>

              {/* Location path integration */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-amber" /> Ubicación en Estructura
                 </p>
                 <div className="space-y-2">
                    {asset.location_path?.map((loc: { name: string, type: string }, idx: number) => (
                      <div key={idx} className="flex items-center justify-between group/loc transition-all">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          {loc.type === 'client' ? 'Cliente' : 
                           loc.type === 'city' ? 'Ciudad' : 
                           loc.type === 'cell' ? 'Sede' : 
                           loc.type === 'process' ? 'Zona' : 'Nivel'}
                        </span>
                        <span className="text-xs font-bold text-slate-700 group-hover/loc:text-amber transition-colors">
                          {loc.name}
                        </span>
                      </div>
                    ))}
                 </div>
              </div>
           </section>
        </div>

        {/* History Column (8/12) */}
        <div className="lg:col-span-8 space-y-6">
           <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/30 border border-slate-100">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500" /> Historial de Vida del Equipo
                </h3>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-400">
                      <Zap className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{history.length} Eventos</span>
                   </div>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                      <History className="w-10 h-10 text-slate-200" />
                   </div>
                   <p className="text-slate-400 text-sm font-medium italic">No se registran intervenciones históricas para este equipo.</p>
                </div>
              ) : (
                <div className="relative space-y-6 pl-8">
                  {/* Timeline Rail */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-100" />
                  
                  {history.map((ticket: any, idx: number) => (
                    <motion.div 
                      key={ticket.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[27px] top-6 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 ${
                        ticket.type === 'corrective' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      
                      <div className="group">
                        <button 
                          onClick={() => toggleTicket(ticket.id)}
                          className="w-full text-left bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:border-amber/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 pr-4">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">{ticket.ticket_number || 'TKT-0000'}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${ticket.type === 'corrective' ? 'text-red-500' : 'text-blue-500'}`}>{ticket.type}</span>
                               </div>
                               <h4 className="text-lg font-black text-slate-800 tracking-tight mt-1">{ticket.title}</h4>
                               <p className="text-sm text-slate-500 line-clamp-1 leading-relaxed">{ticket.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                               <p className="text-xs font-black text-slate-900 mb-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                               <div className="flex items-center gap-1.5 justify-end">
                                  <span className={`w-1.5 h-1.5 rounded-full bg-green-500`} />
                                  <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{ticket.status}</span>
                               </div>
                            </div>
                          </div>

                          <AnimatePresence>
                             {expandedTickets[ticket.id] && (
                               <motion.div 
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="overflow-hidden mt-6 pt-6 border-t border-slate-100"
                               >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                              <User className="w-4 h-4 text-blue-500" />
                                           </div>
                                           <div>
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ejecutado por</p>
                                              <p className="text-xs font-bold text-slate-700">{ticket.assigned_to || 'Técnico Externo'}</p>
                                           </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                                           <FileText className="w-5 h-5 text-slate-300 shrink-0" />
                                           <div>
                                              <p className="text-[10px] font-black text-slate-900 uppercase mb-1">Notas de Ejecución</p>
                                              <p className="text-xs text-slate-500 leading-relaxed font-medium">{ticket.execution_details?.notes || 'Sin observaciones detalladas.'}</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-xl bg-amber/10 flex items-center justify-center">
                                              <Calendar className="w-4 h-4 text-amber" />
                                           </div>
                                           <div>
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha de Cierre</p>
                                              <p className="text-xs font-bold text-slate-700">{ticket.completed_at ? new Date(ticket.completed_at).toLocaleDateString() : 'Pendiente'}</p>
                                           </div>
                                        </div>
                                        <div className="p-4 bg-slate-800 rounded-2xl text-white">
                                           <div className="flex items-center gap-2 mb-2">
                                              <Package className="w-4 h-4 text-amber" />
                                              <span className="text-[10px] font-black uppercase tracking-widest">Repuestos Utilizados</span>
                                           </div>
                                           <p className="text-xs font-medium opacity-70">
                                              {ticket.execution_details?.spare_parts ? JSON.stringify(ticket.execution_details.spare_parts) : 'Ninguno registrado.'}
                                           </p>
                                        </div>
                                     </div>
                                  </div>
                               </motion.div>
                             )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
           </section>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0 !important;
          }
          header, nav, aside, .print\\:hidden { 
            display: none !important; 
          }
          html, body { 
            visibility: visible !important;
            background: white !important;
            color: #1e293b !important;
            margin: 0 !important;
            padding: 12mm !important;
            width: 100% !important;
            height: auto !important;
            font-size: 10pt !important;
            line-height: 1.5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          main, div[class*="overflow-auto"], div[class*="h-screen"] {
            overflow: visible !important;
            height: auto !important;
            display: block !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          div[class*="rounded-[2.5rem]"] {
            border: 1px solid #e2e8f0 !important;
            border-radius: 1.5rem !important;
            margin-bottom: 2rem !important;
            padding: 1.5rem !important;
            background: #f8fafc !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            box-shadow: none !important;
          }
          div[class*="h-40"] {
            display: none !important;
          }
          div[class*="pt-20"] {
            padding: 0 !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 2rem !important;
            width: 100% !important;
          }
          div[class*="w-64 h-64"] {
            width: 120px !important;
            height: 120px !important;
            border: 4px solid white !important;
            border-radius: 1rem !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
            padding: 0 !important;
            margin-right: 1.5rem !important;
            flex-shrink: 0 !important;
          }
          h1 {
            font-size: 2rem !important;
            font-weight: 900 !important;
            margin: 0 !important;
            color: #0f172a !important;
            letter-spacing: -0.04em !important;
          }
          div[class*="backdrop-blur-md"] {
            background: #22c55e !important;
            border: none !important;
            color: white !important;
            padding: 4px 12px !important;
            border-radius: 9999px !important;
            font-size: 8px !important;
            margin-top: 8px !important;
            display: inline-flex !important;
            position: static !important;
          }
          span.text-white { color: white !important; font-weight: 800 !important; }
          .grid {
            display: grid !important;
            grid-template-columns: 1fr 2fr !important;
            gap: 2rem !important;
          }
          section {
            padding: 1.5rem !important;
            border: 1px solid #f1f5f9 !important;
            border-radius: 1.5rem !important;
            background: white !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
          h3 {
             font-size: 10pt !important;
             font-weight: 900 !important;
             color: #0f172a !important;
             border-bottom: 2px solid #f1f5f9 !important;
             margin-bottom: 1rem !important;
             padding-bottom: 0.5rem !important;
          }
          div[class*="py-0.5"] {
            padding: 4px 0 !important;
            border-bottom: 1px solid #f8fafc !important;
          }
          span[class*="text-[10px]"] { font-size: 8pt !important; color: #64748b !important; }
          span[class*="text-xs"] { font-size: 9pt !important; color: #0f172a !important; font-weight: 700 !important; }
          div.group button {
            padding: 1rem !important;
            background: #f8fafc !important;
            border: 1px solid #f1f5f9 !important;
            border-radius: 1rem !important;
            margin-bottom: 0.75rem !important;
          }
          h4.text-lg { font-size: 11pt !important; font-weight: 800 !important; }
          p.text-sm { font-size: 9pt !important; color: #475569 !important; }
        }
      `}</style>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value?: string }) {
  return (
    <div className="flex justify-between items-center py-0.5 border-b border-slate-50 last:border-0 group/item">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-800 tracking-tight group-hover/item:text-amber transition-colors">{value || '---'}</span>
    </div>
  );
}
