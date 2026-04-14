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


  // Tickets Query (Only for Calendar View, Kanban manages its own query)
  const { data: tickets, error } = useQuery({
    queryKey: [
      "maintenance-tickets",
      "preventive",
      currentDate.getMonth(),
      currentDate.getFullYear(),
    ],
    queryFn: () =>
      maintenanceService.getTickets({
        type: "preventive",
        startDate: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1,
        ).toISOString(),
        endDate: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 2,
          0,
        ).toISOString(),
      }),
    enabled: viewMode === "calendar",
  });

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
    const dateStr = date.toISOString().split("T")[0];
    return tickets.filter((t) => t.scheduled_date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateNew = () => {
    setIsCreatingTicket(true);
  };

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
                    ? "Control de Cronograma"
                    : viewMode === "metrics"
                      ? "Métricas Operativas"
                      : "Plan Maestro"}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 font-technical">
                   {viewMode === "calendar"
                    ? "Seguimiento Preventivo Mensual"
                    : viewMode === "metrics"
                      ? "Indicadores Clave de Desempeño"
                      : "Gestión de Flujo de Trabajo"}
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
          <>
            <div className="grid grid-cols-7 border-x border-t border-slate-200 rounded-t-[20px] overflow-hidden bg-slate-50/50">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="h-12 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200 last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto bg-slate-200/20">
              {days.map((date, idx) => {
                const dayTickets = date ? getTicketsForDate(date) : [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = date && date < today;
                const isToday = date?.toDateString() === today.toDateString();

                const pendingCount = dayTickets.filter((t) => t.status !== "completed" && !isPast).length;
                const overdueCount = dayTickets.filter((t) => t.status !== "completed" && isPast).length;
                const completedCount = dayTickets.filter((t) => t.status === "completed").length;
                const hasTickets = dayTickets.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => date && handleDayClick(date)}
                    className={`border-r border-b border-slate-200/60 p-3 min-h-[110px] relative transition-all duration-300 group ${
                      date
                        ? "bg-white hover:bg-slate-50/80 cursor-pointer"
                        : "bg-slate-50/40"
                    }`}
                  >
                    {date && (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                              isToday
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110"
                                : "text-slate-400 group-hover:text-slate-900"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                        </div>

                        {hasTickets && (
                          <div className="space-y-1.5 mt-2">
                            {overdueCount > 0 && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">Retraso ({overdueCount})</span>
                              </div>
                            )}
                            {pendingCount > 0 && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <span className="w-1 h-1 rounded-full bg-orange-500" />
                                <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">Pendiente ({pendingCount})</span>
                              </div>
                            )}
                            {completedCount > 0 && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg opacity-60">
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
          </>
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
