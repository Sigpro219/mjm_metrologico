import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService } from '@/services/machines';
import { maintenanceService } from '@/services/maintenance';
import { useTenant } from '@/components/providers/TenantProvider';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
}

export default function CreateTicketModal({ isOpen, onClose, date }: CreateTicketModalProps) {
    const queryClient = useQueryClient();
    const { organization } = useTenant();

    // Form State
    const [title, setTitle] = useState('');
    const [machineId, setMachineId] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

    // Recurrencia
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly');

    // Fetch Machines
    const { data: machines } = useQuery({
        queryKey: ['machines'],
        queryFn: machineService.getMachines,
        enabled: isOpen // Only fetch when open
    });

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setMachineId('');
            setDescription('');
            setPriority('medium');
            setIsRecurring(false);
            setFrequency('monthly');
        }
    }, [isOpen]);

    const getOccurrenceCount = (freq: 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual') => {
        switch (freq) {
            case 'weekly': return 260;
            case 'monthly': return 60;
            case 'quarterly': return 20;
            case 'semiannual': return 10;
            case 'annual': return 5;
            default: return 1;
        }
    };

    const calculateDates = (startDate: Date, freq: string, isRecur: boolean) => {
        const dates = [];
        const current = new Date(startDate);
        const count = isRecur ? getOccurrenceCount(freq as any) : 1;

        for (let i = 0; i < count; i++) {
            dates.push(new Date(current));

            // Incrementar fecha según frecuencia
            switch (freq) {
                case 'weekly': current.setDate(current.getDate() + 7); break;
                case 'monthly': current.setMonth(current.getMonth() + 1); break;
                case 'quarterly': current.setMonth(current.getMonth() + 3); break;
                case 'semiannual': current.setMonth(current.getMonth() + 6); break;
                case 'annual': current.setFullYear(current.getFullYear() + 1); break;
            }
        }
        return dates;
    };

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!date || !machineId) return;

            const targetDates = calculateDates(date, frequency, isRecurring);

            // Map dates to ticket objects
            const ticketsToCreate = targetDates.map((d, index) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const isLast = isRecurring && index === targetDates.length - 1;

                return {
                    title,
                    description,
                    machine_id: machineId,
                    priority,
                    type: 'preventive' as const,
                    status: 'scheduled' as const,
                    scheduled_date: dateStr,
                    organization_id: organization?.id || '00000000-0000-0000-0000-000000000001', // Dynamic from Tenant
                    is_last_of_5_years: isLast ? true : undefined
                };
            });

            if (ticketsToCreate.length === 1) {
                return maintenanceService.createTicket(ticketsToCreate[0]);
            } else {
                return maintenanceService.createTickets(ticketsToCreate);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
            onClose();
        }
    });

    if (!isOpen || !date) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Programar Preventivo</h2>
                            <p className="text-sm text-slate-500 capitalize">
                                Inicio: {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                        {/* Machine Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Máquina *
                            </label>
                            <select
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 bg-white"
                                value={machineId}
                                onChange={(e) => setMachineId(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar máquina...</option>
                                {machines?.map(machine => (
                                    <option key={machine.id} value={machine.id}>
                                        {machine.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Título de la Actividad *
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Ej. Lubricación de Rodamientos"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Recurrence Options */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    id="recurring"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="recurring" className="text-sm font-semibold text-slate-700 flex items-center gap-2 cursor-pointer select-none">
                                    <Repeat className="w-4 h-4 text-slate-500" />
                                    Repetir Actividad
                                </label>
                            </div>

                            {isRecurring && (
                                <div className="space-y-3 mt-3 animate-in slide-in-from-top-2 duration-200">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Frecuencia</label>
                                        <select
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                            value={frequency}
                                            onChange={(e) => setFrequency(e.target.value as any)}
                                        >
                                            <option value="weekly">Semanal (260 actividades)</option>
                                            <option value="monthly">Mensual (60 actividades)</option>
                                            <option value="quarterly">Trimestral (20 actividades)</option>
                                            <option value="semiannual">Semestral (10 actividades)</option>
                                            <option value="annual">Anual (5 actividades)</option>
                                        </select>
                                    </div>
                                    <div className="text-xs text-blue-600 bg-blue-50/70 p-3 rounded-lg border border-blue-100 flex flex-col gap-1 animate-in fade-in duration-300">
                                        <span>Se programarán automáticamente <strong>{getOccurrenceCount(frequency)}</strong> actividades durante los próximos 5 años.</span>
                                        <span className="text-slate-500 text-[10px]">Primera fecha: {date.toLocaleDateString('es-ES')}. La última actividad alertará del fin del ciclo.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Prioridad
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`py-2 px-1 rounded-lg text-sm font-medium capitalize border transition-all ${priority === p
                                                ? p === 'critical' ? 'bg-red-100 border-red-500 text-red-700'
                                                    : p === 'high' ? 'bg-orange-100 border-orange-500 text-orange-700'
                                                        : p === 'medium' ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                            : 'bg-slate-100 border-slate-500 text-slate-700'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        {p === 'medium' ? 'Media' : p === 'low' ? 'Baja' : p === 'high' ? 'Alta' : 'Crítica'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Descripción (Opcional)
                            </label>
                            <textarea
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24 text-sm"
                                placeholder="Instrucciones adicionales..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Guardando...' : `Programar ${isRecurring ? `(${getOccurrenceCount(frequency)})` : ''}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
