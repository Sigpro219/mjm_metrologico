import { useState } from 'react';
import { X, Save, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { MaintenanceTicket } from '@/types/maintenance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '@/services/maintenance';

interface ExecuteTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: MaintenanceTicket | null;
}

export default function ExecuteTicketModal({ isOpen, onClose, ticket }: ExecuteTicketModalProps) {
    const [description, setDescription] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [spareParts, setSpareParts] = useState<{ name: string; quantity: number }[]>([]);

    // Spare part input state
    const [newPartName, setNewPartName] = useState('');
    const [newPartQty, setNewPartQty] = useState(1);

    const queryClient = useQueryClient();

    const addSparePart = () => {
        if (!newPartName.trim()) return;
        setSpareParts([...spareParts, { name: newPartName, quantity: newPartQty }]);
        setNewPartName('');
        setNewPartQty(1);
    };

    const removeSparePart = (index: number) => {
        setSpareParts(spareParts.filter((_, i) => i !== index));
    };

    const executeMutation = useMutation({
        mutationFn: async () => {
            if (!ticket) return;
            return maintenanceService.updateTicketStatus(ticket.id, 'completed', {
                work_description: description,
                spare_parts: spareParts,
                received_by: receivedBy
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
            onClose();
            setDescription('');
            setReceivedBy('');
            setSpareParts([]);
        }
    });

    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 bg-secondary/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">

                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Finalizar Mantenimiento</h2>
                        <div className="inline-block bg-[var(--primary)]/10 border border-[var(--primary)]/30 px-3 py-1.5 rounded-lg mb-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)] mix-blend-multiply">
                                ID: {ticket.machine?.code || 'MJM-001'}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">{ticket.machine?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-5">
                    {/* Ticket Info */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad Programada</span>
                        <p className="font-bold text-slate-800 mt-1">{ticket.title}</p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Fecha de ejecución:</span>
                            <input 
                                type="text" 
                                className="font-data text-xs bg-white px-2 py-1 border border-slate-200 rounded text-slate-700 w-28 text-center"
                                value={new Date().toISOString().split('T')[0]}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Work Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Descripción del Trabajo Realizado *
                        </label>
                        <textarea
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none h-24 text-sm"
                            placeholder="Detalla las acciones tomadas..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* Spare Parts Section */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Repuestos / Consumibles Utilizados
                        </label>

                        {/* List */}
                        <div className="space-y-2 mb-3">
                            {spareParts.map((part, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="text-sm text-slate-700"><span className="font-bold">{part.quantity}x</span> {part.name}</span>
                                    <button onClick={() => removeSparePart(idx)} className="text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {spareParts.length === 0 && (
                                <p className="text-xs text-slate-400 italic">No se han agregado repuestos.</p>
                            )}
                        </div>

                        {/* Add New Part Row */}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                value={newPartQty}
                                onChange={(e) => setNewPartQty(parseInt(e.target.value) || 1)}
                                className="w-16 p-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Cant."
                            />
                            <input
                                type="text"
                                value={newPartName}
                                onChange={(e) => setNewPartName(e.target.value)}
                                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Nombre del repuesto (Ej. Filtro Air-20)"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSparePart())}
                            />
                            <button
                                type="button"
                                onClick={addSparePart}
                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                title="Agregar a la lista"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Received By */}
                    <div className="mb-4">
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">
                            Ejecutó *
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none text-sm transition-all font-medium"
                            placeholder="Nombre del técnico responsable"
                            value={receivedBy}
                            onChange={(e) => setReceivedBy(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">
                            Cargar Soporte Documental
                        </label>
                        <input
                            type="file"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[var(--primary)] file:text-slate-800 hover:file:bg-[var(--primary)]/80"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => executeMutation.mutate()}
                        disabled={executeMutation.isPending || !description.trim() || !receivedBy.trim()}
                        className="btn-primary"
                    >
                        {executeMutation.isPending ? 'Guardando...' : 'FINALIZAR'}
                    </button>
                </div>
            </div>
        </div>
    );
}
