"use client";

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '@/services/maintenance';
import type { MaintenanceTicket } from '@/types/maintenance';
import { User, Clock, CheckCircle, Play, Siren } from 'lucide-react';
import ExecuteTicketModal from './ExecuteTicketModal';

export default function MaintenanceKanban() {
    const queryClient = useQueryClient();
    const [executingTicket, setExecutingTicket] = useState<MaintenanceTicket | null>(null);
    const [activeTab, setActiveTab] = useState<string>('por_gestionar');
    const boardRef = useRef<HTMLDivElement>(null);

    // Dynamic layout parent scroll prevention & padding adjustment
    useEffect(() => {
        const mainEl = document.querySelector('main > div.overflow-auto') as HTMLElement;
        if (mainEl) {
            const originalOverflow = mainEl.style.overflow || '';
            const originalHeight = mainEl.style.height || '';
            const originalPadding = mainEl.style.padding || '';

            mainEl.style.overflow = 'hidden';
            mainEl.style.height = '100%';

            const handleResize = () => {
                if (window.innerWidth < 768) {
                    mainEl.style.padding = '12px';
                } else if (window.innerWidth < 1024) {
                    mainEl.style.padding = '24px';
                } else {
                    mainEl.style.padding = '32px';
                }
            };

            window.addEventListener('resize', handleResize);
            handleResize();

            return () => {
                mainEl.style.overflow = originalOverflow;
                mainEl.style.height = originalHeight;
                mainEl.style.padding = originalPadding;
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const handleBoardScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (window.innerWidth >= 1280) return;
        const scrollLeft = e.currentTarget.scrollLeft;
        const clientWidth = e.currentTarget.clientWidth;
        if (clientWidth === 0) return;
        const activeIndex = Math.round(scrollLeft / clientWidth);
        const colIds = ['por_gestionar', 'en_proceso', 'doing', 'vencidos'];
        if (colIds[activeIndex] && colIds[activeIndex] !== activeTab) {
            setActiveTab(colIds[activeIndex]);
        }
    };

    const handleTabClick = (colId: string) => {
        setActiveTab(colId);
        const el = document.getElementById(`kanban-col-${colId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    // Fetch all relevant tickets bounded by date to avoid massive Firebase quotas
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['maintenance-tickets', 'kanban', 'mjm'],
        queryFn: () => {
            const today = new Date();
            const past = new Date(today);
            past.setDate(today.getDate() - 60); // 60 days of overdue tickets
            const future = new Date(today);
            future.setDate(today.getDate() + 45); // up to 45 days in future

            const formatDate = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            return maintenanceService.getTickets('mjm', {
                startDate: formatDate(past),
                endDate: formatDate(future)
            });
        }
    });

    const getTodayStr = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const get30DaysFromNowStr = () => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getCurrentWeekRange = () => {
        const today = new Date();
        const currentDayOfWeek = today.getDay();

        const start = new Date(today);
        start.setDate(today.getDate() - currentDayOfWeek);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        
        const formatDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        return {
            startStr: formatDate(start),
            endStr: formatDate(end)
        };
    };

    const todayStr = getTodayStr();
    const upcomingRange = getCurrentWeekRange();
    const maxDateStr = get30DaysFromNowStr();

    // 1. Vencidos (scheduled/open and date < today)
    const overdueTickets = tickets?.filter(t => {
        const statusValid = t.status === 'open' || t.status === 'scheduled';
        return statusValid && t.scheduled_date && t.scheduled_date < todayStr;
    }) || [];

    // 2. Por gestionar (scheduled/open and date > weekEndStr and date <= maxDateStr)
    const upcomingTickets = tickets?.filter(t => {
        const statusValid = t.status === 'open' || t.status === 'scheduled';
        const dateStr = t.scheduled_date || todayStr;
        return statusValid && dateStr > upcomingRange.endStr && dateStr <= maxDateStr;
    }) || [];

    // 3. En proceso (scheduled/open and date >= todayStr and date <= weekEndStr)
    const inProcessTickets = tickets?.filter(t => {
        const statusValid = t.status === 'open' || t.status === 'scheduled';
        const dateStr = t.scheduled_date || todayStr;
        return statusValid && dateStr >= todayStr && dateStr <= upcomingRange.endStr;
    }) || [];

    // 4. Doing (status is in_progress)
    const doingTickets = tickets?.filter(t => t.status === 'in_progress') || [];

    const startTicketMutation = useMutation({
        mutationFn: ({ id, tech }: { id: string, tech: string }) => maintenanceService.startTicket(id, tech),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] })
    });

    const handleStartTicket = (ticket: MaintenanceTicket) => {
        const techName = prompt("Nombre del Técnico que inicia el trabajo:");
        if (techName && techName.trim()) {
            startTicketMutation.mutate({ id: ticket.id, tech: techName });
        }
    };

    const TicketCard = ({ ticket, columnId }: { ticket: MaintenanceTicket; columnId: string }) => {
        const borderClass = 
            columnId === 'vencidos' ? 'border-l-4 border-l-red-500 shadow-red-100' :
            columnId === 'doing' ? 'border-l-4 border-l-emerald-500 shadow-emerald-100' :
            columnId === 'en_proceso' ? 'border-l-4 border-l-orange-500 shadow-orange-100' :
            'border-l-4 border-l-amber-500 shadow-amber-100';

        return (
            <div className={`p-4 rounded-xl border border-slate-100 mb-3 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group ${borderClass} shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                    ticket.type === 'corrective' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                    {ticket.type === 'corrective' ? 'Avería' : 'Preventivo'}
                </span>
                {ticket.priority === 'critical' && <Siren className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            <h4 className="font-bold text-slate-800 text-sm mb-2 leading-tight group-hover:text-blue-600 transition-colors">{ticket.title}</h4>
            
            {/* Consolidated equipment ID, name, and scheduled date line */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 mb-2 font-medium">
              {ticket.machine?.code && (
                <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase font-mono shadow-sm shrink-0">
                   {ticket.machine.code}
                </span>
              )}
              {ticket.machine?.name && (
                <span className="font-bold text-slate-700 truncate max-w-[110px]" title={ticket.machine.name}>
                  {ticket.machine.name}
                </span>
              )}
              {ticket.scheduled_date && (
                <>
                  <span className="text-slate-300 font-bold">•</span>
                  <span className="font-semibold text-slate-600 flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {ticket.scheduled_date}
                  </span>
                </>
              )}
            </div>

            {/* Altura #2 (Oculto por defecto en desktop, visible al hacer hover) */}
            <div className="transition-all duration-300 ease-in-out xl:max-h-0 xl:opacity-0 xl:overflow-hidden xl:group-hover:max-h-72 xl:group-hover:opacity-100 xl:group-hover:mt-3">
                {ticket.status === 'in_progress' && (
                    <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/50 p-2 rounded-lg mb-3 border border-blue-100">
                        <User className="w-3 h-3 text-blue-500" />
                        <span className="font-bold">{ticket.assigned_to || 'Técnico'}</span>
                        <span className="text-blue-300 mx-1">•</span>
                        <Clock className="w-3 h-3 text-blue-500 animate-spin-slow" />
                        <span className="italic">En curso...</span>
                    </div>
                )}

                {ticket.reported_by && ticket.type === 'corrective' && (
                    <div className="text-[10px] text-slate-400 mb-3 flex items-center gap-1">
                        <span className="font-bold uppercase tracking-wider">Reporta:</span> 
                        <span className="font-medium text-slate-600 bg-slate-100 px-1.5 rounded">{ticket.reported_by}</span>
                    </div>
                )}

                <div className="flex justify-end pt-3 border-t border-slate-50">
                    {ticket.status !== 'in_progress' && ticket.status !== 'completed' && (
                        <button
                            onClick={() => handleStartTicket(ticket)}
                            className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors font-bold shadow-lg shadow-slate-200"
                        >
                            <Play className="w-3 h-3 fill-current" /> INICIAR
                        </button>
                    )}

                    {ticket.status === 'in_progress' && (
                        <button
                            onClick={() => setExecutingTicket(ticket)}
                            className="text-xs bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors font-bold shadow-lg shadow-green-200"
                        >
                            <CheckCircle className="w-3 h-3" /> FINALIZAR
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

    const columns = [
        {
            id: 'por_gestionar',
            label: 'Por Gestionar',
            tooltipInfo: 'Actividades programadas desde el próximo mes en adelante. Permanecen aquí hasta estar a menos de 30 días.',
            colorClass: 'text-amber-700',
            bgBarClass: 'bg-amber-500',
            dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
            bgClass: 'bg-amber-50/20 border-amber-200/80',
            headerBorderClass: 'border-amber-200',
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
            tickets: upcomingTickets,
            emptyText: 'Sin actividades',
            emptyColorClass: 'text-amber-400/40 border-amber-200 bg-white/50'
        },
        {
            id: 'en_proceso',
            label: 'Priorizar',
            tooltipInfo: 'Actividades que se deben ejecutar en los próximos 30 días. Su fecha de programación está muy cercana.',
            colorClass: 'text-orange-700',
            bgBarClass: 'bg-orange-500',
            dotClass: 'bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.3)]',
            bgClass: 'bg-orange-50/20 border-orange-200/80',
            headerBorderClass: 'border-orange-200',
            badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
            tickets: inProcessTickets,
            emptyText: 'Sin programaciones',
            emptyColorClass: 'text-orange-400/40 border-orange-200 bg-white/50'
        },
        {
            id: 'doing',
            label: 'En Proceso',
            tooltipInfo: 'Actividades iniciadas por un técnico que están actualmente en ejecución física.',
            colorClass: 'text-emerald-700',
            bgBarClass: 'bg-emerald-500',
            dotClass: 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]',
            bgClass: 'bg-emerald-50/20 border-emerald-200/80',
            headerBorderClass: 'border-emerald-200',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            tickets: doingTickets,
            emptyText: 'Ninguna en ejecución',
            emptyColorClass: 'text-emerald-400/40 border-emerald-200 bg-white/50'
        },
        {
            id: 'vencidos',
            label: 'Vencidos',
            tooltipInfo: 'Actividades cuya fecha programada ya pasó y no han sido finalizadas. Requieren atención inmediata.',
            colorClass: 'text-red-700',
            bgBarClass: 'bg-red-500',
            dotClass: 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]',
            bgClass: 'bg-red-50/20 border-red-200/80',
            headerBorderClass: 'border-red-200',
            badgeClass: 'bg-red-50 text-red-700 border-red-200',
            tickets: overdueTickets,
            emptyText: 'Sin retrasos',
            emptyColorClass: 'text-red-400/40 border-red-200 bg-white/50'
        }
    ];

    if (isLoading) return <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-wider">Cargando tablero...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* --- MOBILE TABS (visible only on mobile) --- */}
            <div className="flex xl:hidden bg-slate-100/80 border border-slate-200/60 rounded-2xl p-1.5 mb-4 justify-between items-center shrink-0 shadow-inner">
                {columns.map(col => {
                    const count = col.tickets.length;
                    const isActive = activeTab === col.id;
                    const mobileLabels: Record<string, string> = {
                        por_gestionar: 'Pendientes',
                        en_proceso: 'Priorizar',
                        doing: 'Proceso',
                        vencidos: 'Vencidos'
                    };
                    return (
                        <button
                            key={col.id}
                            onClick={() => handleTabClick(col.id)}
                            className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all relative ${
                                isActive 
                                    ? `bg-white ${col.colorClass} font-black shadow-md scale-102` 
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest text-center truncate w-full px-1">
                                {mobileLabels[col.id]}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-1 border ${
                                isActive 
                                    ? col.badgeClass 
                                    : 'bg-slate-200/60 text-slate-500 border-transparent'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* --- KANBAN BOARD --- */}
            <div 
                ref={boardRef}
                onScroll={handleBoardScroll}
                className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth bg-slate-50/30 rounded-3xl p-2"
            >
                <div className="flex gap-4 h-full">
                    {columns.map(col => (
                        <section 
                            key={col.id} 
                            id={`kanban-col-${col.id}`}
                            className={`flex-shrink-0 w-full xl:flex-1 xl:min-w-[250px] snap-center xl:snap-align-none flex flex-col h-full rounded-2xl border shadow-sm relative overflow-hidden transition-colors ${col.bgClass}`}
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${col.bgBarClass}`}></div>
                            <div className={`p-4 border-b ${col.headerBorderClass} bg-white rounded-t-2xl flex justify-between items-center sticky top-0 z-10`}>
                                <div className="flex items-center gap-2 relative group/tooltip">
                                    <h3 className={`font-black flex items-center gap-3 text-sm uppercase tracking-wider ${col.colorClass}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`}></div>
                                        {col.label}
                                    </h3>
                                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold cursor-help hover:bg-slate-800 hover:text-white transition-colors border border-slate-300">
                                        i
                                    </div>
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover/tooltip:block w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-50 text-center font-medium leading-relaxed before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-slate-800">
                                        {col.tooltipInfo}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-sm font-black border ${col.badgeClass}`}>
                                    {col.tickets.length}
                                </span>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 pr-1">
                                {col.tickets.length === 0 ? (
                                    <div className={`h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl m-2 ${col.emptyColorClass}`}>
                                        <span className="text-xs font-bold uppercase tracking-wider">{col.emptyText}</span>
                                    </div>
                                ) : (
                                    col.tickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} columnId={col.id} />)
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <ExecuteTicketModal
                isOpen={!!executingTicket}
                onClose={() => setExecutingTicket(null)}
                ticket={executingTicket}
            />
        </div>
    );
}
