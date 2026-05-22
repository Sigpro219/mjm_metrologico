"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '@/services/maintenance';
import type { MaintenanceTicket } from '@/types/maintenance';
import { User, Clock, CheckCircle, Play, Siren } from 'lucide-react';
import ExecuteTicketModal from './ExecuteTicketModal';

export default function MaintenanceKanban() {
    const queryClient = useQueryClient();
    const [executingTicket, setExecutingTicket] = useState<MaintenanceTicket | null>(null);

    // Fetch all relevant tickets
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['maintenance-tickets', 'kanban'],
        queryFn: () => maintenanceService.getTickets(),
        refetchInterval: 10000
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

    const TicketCard = ({ ticket }: { ticket: MaintenanceTicket }) => (
        <div className={`p-4 rounded-xl border mb-3 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group ${
            ticket.priority === 'critical' ? 'border-l-4 border-l-red-500 shadow-red-100' :
            ticket.priority === 'high' ? 'border-l-4 border-l-orange-500 shadow-orange-100' : 
            'border-slate-100 shadow-sm shadow-slate-200/50'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                    ticket.type === 'corrective' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                    {ticket.type === 'corrective' ? 'Avería' : 'Preventivo'}
                </span>
                {ticket.priority === 'critical' && <Siren className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            <h4 className="font-bold text-slate-800 text-sm mb-2 leading-tight group-hover:text-blue-600 transition-colors">{ticket.title}</h4>
            
            <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
              {ticket.machine?.code && (
                <span className="text-[10px] font-black text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 uppercase font-mono shadow-sm">
                   {ticket.machine.code}
                </span>
              )}
              <p className="text-xs font-bold text-slate-600 truncate">{ticket.machine?.name}</p>
            </div>

            {ticket.scheduled_date && ticket.status !== 'completed' && (
                <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold uppercase tracking-wider text-slate-400">Planificado:</span> 
                    <span className="font-semibold text-slate-600">{ticket.scheduled_date}</span>
                </div>
            )}

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
    );

    if (isLoading) return <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-wider">Cargando tablero...</div>;

    return (
        <div className="flex h-full gap-4 overflow-x-auto p-1 bg-slate-50/50">
            {/* Column 1: Por gestionar */}
            <div className="flex-1 min-w-[300px] flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-400"></div>
                <div className="p-4 border-b border-slate-200 bg-white rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-slate-600 flex items-center gap-3 text-xs uppercase tracking-wider">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                        Por Gestionar (30 Días)
                    </h3>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black border border-slate-200">
                        {upcomingTickets.length}
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {upcomingTickets.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-2 bg-slate-50">
                            <span className="text-xs font-bold uppercase tracking-wider">Sin actividades</span>
                        </div>
                    ) : (
                        upcomingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                    )}
                </div>
            </div>

            {/* Column 2: En proceso */}
            <div className="flex-1 min-w-[300px] flex flex-col bg-blue-50/20 rounded-2xl border border-blue-100/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <div className="p-4 border-b border-blue-100 bg-white rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-blue-700 flex items-center gap-3 text-xs uppercase tracking-wider">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
                        En Proceso (Esta Semana)
                    </h3>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black border border-blue-100">
                        {inProcessTickets.length}
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {inProcessTickets.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-blue-300/40 border-2 border-dashed border-blue-100 rounded-xl m-2 bg-white/50">
                            <span className="text-xs font-bold uppercase tracking-wider">Sin programaciones</span>
                        </div>
                    ) : (
                        inProcessTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                    )}
                </div>
            </div>

            {/* Column 3: Doing */}
            <div className="flex-1 min-w-[300px] flex flex-col bg-amber-50/20 rounded-2xl border border-amber-100/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                <div className="p-4 border-b border-amber-100 bg-white rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-amber-700 flex items-center gap-3 text-xs uppercase tracking-wider">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
                        Doing (En Ejecución)
                    </h3>
                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-black border border-amber-100">
                        {doingTickets.length}
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {doingTickets.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-amber-400/40 border-2 border-dashed border-amber-100 rounded-xl m-2 bg-white/50">
                            <span className="text-xs font-bold uppercase tracking-wider">Ninguna en ejecución</span>
                        </div>
                    ) : (
                        doingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                    )}
                </div>
            </div>

            {/* Column 4: Vencidos */}
            <div className="flex-1 min-w-[300px] flex flex-col bg-red-50/10 rounded-2xl border border-red-200/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <div className="p-4 border-b border-red-100/60 bg-white rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-red-600 flex items-center gap-3 text-xs uppercase tracking-wider">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        Vencidos
                    </h3>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-black border border-red-100">
                        {overdueTickets.length}
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {overdueTickets.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-2 bg-slate-50">
                            <span className="text-xs font-bold uppercase tracking-wider">Sin retrasos</span>
                        </div>
                    ) : (
                        overdueTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                    )}
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
