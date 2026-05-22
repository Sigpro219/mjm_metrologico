"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { maintenanceService } from "@/services/maintenance";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Columns,
  BarChart3,
  Box,
  Clock,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import DayDetailsModal from "@/components/maintenance/DayDetailsModal";
import ExecuteTicketModal from "@/components/maintenance/ExecuteTicketModal";
import CreateTicketModal from "@/components/maintenance/CreateTicketModal";

import MaintenanceKanban from "@/components/maintenance/MaintenanceKanban";
import MaintenanceMetrics from "@/components/maintenance/MaintenanceMetrics";
import type { MaintenanceTicket } from "@/types/maintenance";

export default function MaintenancePage() {
  const [viewMode, setViewMode] = useState<"calendar" | "board" | "metrics">(
    "board",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [executingTicket, setExecutingTicket] =
    useState<MaintenanceTicket | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);


  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonthDateRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    return {
      startStr: formatDate(firstDay),
      endStr: formatDate(lastDay)
    };
  };

  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();
  const { startStr: monthStartStr, endStr: monthEndStr } = getMonthDateRange(currentDate);

  // 1. Monthly Tickets (Calendar view)
  const { data: tickets, error: ticketsError } = useQuery({
    queryKey: ["maintenance-tickets", "monthly", monthStartStr, monthEndStr],
    queryFn: () =>
      maintenanceService.getTickets({
        type: "preventive",
        startDate: monthStartStr,
        endDate: monthEndStr,
      }),
    enabled: viewMode === "calendar",
  });

  // 2. Upcoming 5 Events (Query limited from today onwards)
  const { data: upcomingEventsRaw, error: upcomingError } = useQuery({
    queryKey: ["maintenance-tickets", "upcoming-raw", todayStr],
    queryFn: () =>
      maintenanceService.getTickets({
        startDate: todayStr,
        limitCount: 20,
      }),
    enabled: viewMode === "calendar",
  });

  // 3. Overdue Alerts (Scheduled and Open tickets with dates in the past)
  const { data: overdueScheduled, error: overdueScheduledError } = useQuery({
    queryKey: ["maintenance-tickets", "overdue-scheduled", yesterdayStr],
    queryFn: () =>
      maintenanceService.getTickets({
        status: "scheduled",
        endDate: yesterdayStr,
      }),
    enabled: viewMode === "calendar",
  });

  const { data: overdueOpen, error: overdueOpenError } = useQuery({
    queryKey: ["maintenance-tickets", "overdue-open", yesterdayStr],
    queryFn: () =>
      maintenanceService.getTickets({
        status: "open",
        endDate: yesterdayStr,
      }),
    enabled: viewMode === "calendar",
  });

  // 4. End of Cycle Alerts (5-year routines)
  const { data: endOfCycleRaw, error: endOfCycleError } = useQuery({
    queryKey: ["maintenance-tickets", "end-of-cycle"],
    queryFn: () =>
      maintenanceService.getTickets({
        isLastOf5Years: true,
      }),
    enabled: viewMode === "calendar",
  });

  const error = ticketsError || upcomingError || overdueScheduledError || overdueOpenError || endOfCycleError;

  if (error) {
    console.error("❌ Maintenance Error:", error);
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Error al cargar los tickets. Por favor intente de nuevo.
      </div>
    );
  }

  // Calendar Helper Functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++)
      days.push(new Date(year, month, i));
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );

  const getTicketsForDate = (date: Date) => {
    if (!tickets) return [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return tickets.filter((t) => t.scheduled_date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateNew = () => {
    setIsCreatingTicket(true);
  };

  // Upcoming 5 events (scheduled or open tickets from today onwards)
  const upcomingEvents = (upcomingEventsRaw || [])
    .filter((t) => (t.status === "scheduled" || t.status === "open") && t.scheduled_date && t.scheduled_date >= todayStr)
    .sort((a, b) => (a.scheduled_date || "").localeCompare(b.scheduled_date || ""))
    .slice(0, 5);

  // Overdue events (Retrasos - scheduled or open tickets from past dates)
  const overdueAlerts = [
    ...(overdueScheduled || []),
    ...(overdueOpen || [])
  ].sort((a, b) => (a.scheduled_date || "").localeCompare(b.scheduled_date || ""));

  // End of cycle alerts (scheduled or open tickets flagged as last of 5 years)
  const endOfCycleAlerts = (endOfCycleRaw || [])
    .filter((t) => t.is_last_of_5_years && (t.status === "scheduled" || t.status === "open"))
    .sort((a, b) => (a.scheduled_date || "").localeCompare(b.scheduled_date || ""));

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.32))]">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              {viewMode === "calendar" ? (
                <div className="bg-orange-500/10 p-2.5 rounded-2xl"><CalendarIcon className="w-7 h-7 text-orange-600" /></div>
              ) : viewMode === "metrics" ? (
                <div className="bg-blue-500/10 p-2.5 rounded-2xl"><BarChart3 className="w-7 h-7 text-blue-600" /></div>
              ) : (
                <div className="bg-emerald-500/10 p-2.5 rounded-2xl"><Columns className="w-7 h-7 text-emerald-600" /></div>
              )}

              <div className="flex flex-col">
                <span>
                  {viewMode === "calendar"
                    ? "Control Metrológico"
                    : viewMode === "metrics"
                      ? "Métricas Operativas"
                      : "Plan Maestro"}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 font-technical">
                   {viewMode === "calendar"
                    ? "Seguimiento Metrológico Mensual"
                    : viewMode === "metrics"
                      ? "Indicadores de Calidad"
                      : "Gestión de Mantenimiento de Instrumentos"}
                </span>
              </div>
            </h1>
          </div>

          <div className="flex bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-[20px] border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-5 py-2 rounded-[14px] text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                viewMode === "calendar"
                  ? "bg-white text-slate-900 shadow-md scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Calendario
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-5 py-2 rounded-[14px] text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                viewMode === "board"
                  ? "bg-white text-slate-900 shadow-md scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Columns className="w-4 h-4" /> Tablero
            </button>
            <button
              onClick={() => setViewMode("metrics")}
              className={`px-5 py-2 rounded-[14px] text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                viewMode === "metrics"
                  ? "bg-white text-slate-900 shadow-md scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> KPIs
            </button>
          </div>
        </div>

        {viewMode === "calendar" && (
          <div className="flex items-center bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden p-1">
            <button
              onClick={prevMonth}
              className="w-10 h-10 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-6 flex items-center justify-center">
              <span className="font-black text-slate-900 text-[10px] uppercase tracking-[0.25em] select-none whitespace-nowrap">
                {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase()}
              </span>
            </div>
            <button
              onClick={nextMonth}
              className="w-10 h-10 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
        {viewMode === "calendar" ? (
          <div className="flex flex-1 overflow-hidden h-full">
            {/* Columna Izquierda: Calendario (70%) */}
            <div className="w-[70%] border-r border-slate-200 flex flex-col h-full overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50 shrink-0">
                {weekDays.map((d) => (
                  <div
                    key={d}
                    className="h-12 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200 last:border-r-0"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto bg-slate-200/5">
                {days.map((date, idx) => {
                  const dayTickets = date ? getTicketsForDate(date) : [];
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isPast = date && date < today;
                  const isToday = date?.toDateString() === today.toDateString();

                  const pendingCount = dayTickets.filter((t) => t.status !== "completed" && t.status !== "cancelled" && !isPast).length;
                  const overdueCount = dayTickets.filter((t) => t.status !== "completed" && t.status !== "cancelled" && isPast).length;
                  const completedCount = dayTickets.filter((t) => t.status === "completed").length;
                  const hasTickets = dayTickets.length > 0;

                  return (
                    <div
                      key={idx}
                      onClick={() => date && handleDayClick(date)}
                      className={`border-r border-b border-slate-200/60 p-2 min-h-[95px] relative transition-all duration-300 group ${
                        date
                          ? "bg-white hover:bg-slate-50/80 cursor-pointer"
                          : "bg-slate-50/40"
                      }`}
                    >
                      {date && (
                        <>
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-xl transition-all ${
                                isToday
                                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110"
                                  : "text-slate-400 group-hover:text-slate-900"
                              }`}
                            >
                              {date.getDate()}
                            </span>
                          </div>

                          {hasTickets && (
                            <div className="space-y-1 mt-1">
                              {overdueCount > 0 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md">
                                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">Retraso ({overdueCount})</span>
                                </div>
                              )}
                              {pendingCount > 0 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md">
                                  <span className="w-1 h-1 rounded-full bg-orange-500" />
                                  <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">Pendiente ({pendingCount})</span>
                                </div>
                              )}
                              {completedCount > 0 && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md opacity-60">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Éxito ({completedCount})</span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Sidebar (30%) */}
            <div className="w-[30%] bg-slate-50/50 p-6 flex flex-col h-full overflow-y-auto space-y-6">
              {/* Próximos 5 Eventos */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Próximos 5 Eventos
                </h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200/60">
                    No hay eventos próximos programados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {event.scheduled_date}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                              event.priority === "critical"
                                ? "bg-red-50 text-red-600"
                                : event.priority === "high"
                                  ? "bg-orange-50 text-orange-600"
                                  : event.priority === "medium"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-slate-50 text-slate-600"
                            }`}
                          >
                            {event.priority === "medium" ? "Media" : event.priority === "low" ? "Baja" : event.priority === "high" ? "Alta" : "Crítica"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {event.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {event.machine?.name || "Instrumento"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alertas Críticas */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-red-500" /> Alertas Críticas
                </h3>

                <div className="space-y-3">
                  {/* Retrasos */}
                  {overdueAlerts.length > 0 && (
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-200/80 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          Actividades Vencidas ({overdueAlerts.length})
                        </span>
                      </div>
                      <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
                        {overdueAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="bg-white p-2 rounded-lg border border-red-100 flex flex-col gap-0.5 shadow-sm"
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-red-600">
                                {alert.scheduled_date}
                              </span>
                              <span className="text-slate-400 font-semibold">
                                {alert.machine?.code}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                              {alert.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fin de ciclo */}
                  {endOfCycleAlerts.length > 0 && (
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Info className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          Fin de Ciclo Próximo ({endOfCycleAlerts.length})
                        </span>
                      </div>
                      <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
                        {endOfCycleAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="bg-white p-2 rounded-lg border border-amber-100 flex flex-col gap-0.5 shadow-sm"
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-amber-600">
                                {alert.scheduled_date}
                              </span>
                              <span className="text-slate-400 font-semibold">
                                {alert.machine?.code}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                              {alert.title}
                            </span>
                            <span className="text-[9px] text-slate-400 italic">
                              Última rutina de 5 años. Requiere reprogramar.
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {overdueAlerts.length === 0 && endOfCycleAlerts.length === 0 && (
                    <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">
                          Operaciones al día
                        </span>
                        <span className="text-[10px] text-emerald-600/80">
                          No se detectaron actividades vencidas ni alertas
                          críticas.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === "board" ? (
          <MaintenanceKanban />
        ) : (
          <MaintenanceMetrics />
        )}
      </div>

      {/* Modals */}
      <DayDetailsModal
        isOpen={!!selectedDate && !isCreatingTicket}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        tickets={selectedDate ? getTicketsForDate(selectedDate) : []}
        onExecute={(ticket) => setExecutingTicket(ticket)}
        onCreateNew={handleCreateNew}
      />

      <CreateTicketModal
        isOpen={isCreatingTicket}
        onClose={() => setIsCreatingTicket(false)}
        date={selectedDate}
      />

      <ExecuteTicketModal
        isOpen={!!executingTicket}
        onClose={() => setExecutingTicket(null)}
        ticket={executingTicket}
      />


    </div>
  );
}
