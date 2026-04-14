import { useState, useEffect } from 'react';
import { X, AlertTriangle, Siren, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService } from '@/services/machines';
import { maintenanceService } from '@/services/maintenance';
import { useTenant } from '@/components/providers/TenantProvider';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMachineId?: string;
}

export default function ReportIssueModal({ isOpen, onClose, defaultMachineId }: ReportIssueModalProps) {
    const queryClient = useQueryClient();
    const { organization } = useTenant();

    // State
    const [machineId, setMachineId] = useState('');
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'high' | 'critical'>('high'); // Default high for issues
    const [description, setDescription] = useState('');
    const [reportedBy, setReportedBy] = useState('');

    // Fetch Machines
    const { data: machines } = useQuery({
        queryKey: ['machines'],
        queryFn: machineService.getMachines,
        enabled: isOpen
    });

    // Reset logic when modal opens
    useEffect(() => {
        if (!isOpen) return;

        setMachineId(prev => (defaultMachineId || '') !== prev ? (defaultMachineId || '') : prev);
        setTitle(prev => prev !== '' ? '' : prev);
        setPriority(prev => prev !== 'high' ? 'high' : prev);
        setDescription(prev => prev !== '' ? '' : prev);
        setReportedBy(prev => prev !== '' ? '' : prev);
    }, [isOpen, defaultMachineId]);

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!machineId || !title || !reportedBy) return;

            return maintenanceService.createTicket({
                title,
                description,
                machine_id: machineId,
                priority,
                type: 'corrective',
                status: 'open',
                reported_by: reportedBy,
                scheduled_date: new Date().toISOString().split('T')[0],
                organization_id: organization?.id || '00000000-0000-0000-0000-000000000001' // Dynamic from Tenant
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
            onClose();
            alert('🚨 Avería reportada correctamente. El equipo ha sido notificado.');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-8 border-red-500 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600 animate-pulse">
                            <Siren className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-700">Reportar Avería</h2>
                            <p className="text-sm text-red-500">
                                Incidencia correctiva urgente
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto">

                        {/* Machine Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                ¿Qué máquina falló? *
                            </label>
                            <select
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-700 bg-slate-50 text-lg"
                                value={machineId}
                                onChange={(e) => setMachineId(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar máquina...</option>
                                {machines?.map(machine => (
                                    <option key={machine.id} value={machine.id}>
                                        {machine.code} - {machine.name}
                                    </option>
                                ))}
                            </select>
                            {defaultMachineId && machineId !== defaultMachineId && (
                                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Reportando máquina diferente a la actual
                                </p>
                            )}
                        </div>

                        {/* Reporter Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                Reportado Por *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-medium"
                                    placeholder="Tu Nombre (Operador)"
                                    value={reportedBy}
                                    onChange={(e) => setReportedBy(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                Problema Principal *
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-medium"
                                placeholder="Ej. Motor no arranca, Fuga de aceite..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Nivel de Urgencia
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPriority('high')}
                                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${priority === 'high'
                                        ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                    Alta (Detiene Parcialmente)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPriority('critical')}
                                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${priority === 'critical'
                                        ? 'bg-red-100 border-red-500 text-red-700 shadow-sm ring-1 ring-red-500'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    <Siren className="w-5 h-5" />
                                    Crítica (Máquina Parada)
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Detalles Adicionales
                            </label>
                            <textarea
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-20 text-sm"
                                placeholder="Describe qué pasó antes de la falla..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || !reportedBy.trim()}
                            className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Siren className="w-4 h-4" />
                            {createMutation.isPending ? 'Reportando...' : 'REPORTAR AHORA'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
