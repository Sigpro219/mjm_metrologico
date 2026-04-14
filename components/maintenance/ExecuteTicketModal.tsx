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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-green-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <Save className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Finalizar Mantenimiento</h2>
                            <p className="text-sm text-slate-500">{ticket.machine?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-5">
                    {/* Ticket Info */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-400 uppercase">Actividad Programada</span>
                        <p className="font-medium text-slate-800">{ticket.title}</p>
                        {ticket.description && <p className="text-sm text-slate-500 mt-1">{ticket.description}</p>}
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
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Recibido Por (Operador/Supervisor) *
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                            placeholder="Nombre de quien valida el trabajo"
                            value={receivedBy}
                            onChange={(e) => setReceivedBy(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Esta acción cerrará el ticket y registrará el consumo de repuestos.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => executeMutation.mutate()}
                        disabled={executeMutation.isPending || !description.trim() || !receivedBy.trim()}
                        className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {executeMutation.isPending ? 'Guardando...' : 'Confirmar Ejecución'}
                    </button>
                </div>
            </div>
        </div>
    );
}
