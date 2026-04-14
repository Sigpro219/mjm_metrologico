import { X, Wrench, CheckCircle, Clock, Plus } from 'lucide-react';
import type { MaintenanceTicket } from '@/types/maintenance';

interface DayDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    tickets: MaintenanceTicket[];
    onExecute: (ticket: MaintenanceTicket) => void;
    onCreateNew: () => void;
}

export default function DayDetailsModal({ isOpen, onClose, date, tickets, onExecute, onCreateNew }: DayDetailsModalProps) {
    if (!isOpen || !date) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Actividades del Día
                        </h2>
                        <p className="text-sm text-slate-500 capitalize">
                            {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {tickets.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 flex flex-col items-center">
                            <Clock className="w-12 h-12 mb-3 text-slate-200" />
                            <p>No hay actividades programadas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="group relative p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-gradient-to-br ${
                                                ticket.type === 'corrective' ? 'from-red-50 to-red-100 text-red-600' : 'from-blue-50 to-blue-100 text-blue-600'
                                            }`}>
                                                <Wrench className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {ticket.machine?.code && (
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 uppercase font-mono shadow-sm">
                                                            {ticket.machine.code}
                                                        </span>
                                                    )}
                                                    <h3 className="font-bold text-slate-800 text-sm">{ticket.machine?.name || 'Máquina desconocida'}</h3>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">{ticket.title}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                            ticket.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-100' :
                                            ticket.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {ticket.priority}
                                        </span>
                                    </div>

                                    {ticket.status !== 'completed' ? (
                                        <button
                                            onClick={() => onExecute(ticket)}
                                            className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-lg shadow-slate-200 hover:shadow-slate-300 active:scale-[0.98]"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Ejecutar Mantenimiento
                                        </button>
                                    ) : (
                                        <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-xl border border-green-100">
                                            <CheckCircle className="w-4 h-4 fill-green-100" />
                                            <span className="text-xs font-bold">Completado • {new Date(ticket.completed_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onCreateNew}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Actividad
                    </button>
                </div>
            </div>
        </div>
    );
}
