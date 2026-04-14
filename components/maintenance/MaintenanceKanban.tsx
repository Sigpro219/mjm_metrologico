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

    // Fetch all relevant tickets (not just filtered by month like the calendar)
    // In a real app we might paginate or filter by "active" state
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['maintenance-tickets', 'kanban'],
        queryFn: async () => {
            // ... (rest of queryFn is fine as is, assume existing content)
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
            const end = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString();
            return maintenanceService.getTickets({ startDate: start, endDate: end });
        },
        refetchInterval: 10000
    });

    const pendingTickets = tickets?.filter(t =>
        (t.status === 'open' || (t.status === 'scheduled' && t.scheduled_date && t.scheduled_date <= new Date().toISOString().split('T')[0]))
    ) || [];

    const inProgressTickets = tickets?.filter(t => t.status === 'in_progress') || [];
    const completedTickets = tickets?.filter(t => t.status === 'completed').slice(0, 10) || []; // Show last 10

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

    if (isLoading) return <div className="p-10 text-center text-slate-500">Cargando tablero...</div>;

    return (
        <div className="flex h-full gap-4 overflow-x-auto p-1">
            {/* Column 1: To Do */}
            <div className="flex-1 min-w-[320px] flex flex-col bg-slate-50 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="p-4 border-b border-slate-200 bg-white rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-slate-800 flex items-center gap-3 text-sm uppercase tracking-widest">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30 ring-2 ring-red-100"></div>
                        Pendientes
                    </h3>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black border border-slate-200">
                        {pendingTickets.length}
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
                    {pendingTickets.length === 0 && (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-2 bg-slate-50">
                            <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
                            <span className="text-xs font-bold uppercase tracking-wider">Todo al día</span>
                        </div>
                    )}
                    {pendingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
                </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="flex-1 min-w-[320px] flex flex-col bg-blue-50/20 rounded-2xl border border-blue-100 shadow-xl shadow-blue-100/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <div className="p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-blue-900 flex items-center gap-3 text-sm uppercase tracking-widest">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/30 ring-2 ring-blue-100"></div>
                        En Progreso
                    </h3>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black border border-blue-100">
                        {inProgressTickets.length}
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-blue-50/10">
                    {inProgressTickets.length === 0 && (
                        <div className="h-40 flex flex-col items-center justify-center text-blue-300/50 border-2 border-dashed border-blue-100 rounded-xl m-2">
                            <Clock className="w-8 h-8 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">Sin actividad</span>
                        </div>
                    )}
                    {inProgressTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
                </div>
            </div>

            {/* Column 3: Done */}
            <div className="flex-1 min-w-[320px] flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200 opacity-90">
                <div className="p-4 border-b border-slate-200 bg-white/50 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-slate-500 flex items-center gap-3 text-sm uppercase tracking-widest">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30 ring-2 ring-green-100"></div>
                        Finalizados
                    </h3>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-black border border-slate-200">
                        {completedTickets.length}
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    {completedTickets.map(ticket => (
                        <div key={ticket.id} className="p-4 bg-white border border-slate-100 rounded-xl mb-3 opacity-60 hover:opacity-100 transition-all hover:shadow-md group">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400 line-through group-hover:no-underline group-hover:text-slate-700 transition-colors">{ticket.title}</span>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="text-[10px] text-slate-400 flex gap-2 font-medium uppercase tracking-wider">
                                <span>{ticket.machine?.name}</span>
                                <span>•</span>
                                <span>{ticket.assigned_to}</span>
                            </div>
                        </div>
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
