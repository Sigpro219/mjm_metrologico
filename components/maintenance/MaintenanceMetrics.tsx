"use client";

import { useQuery } from "@tanstack/react-query";
import { maintenanceService } from "@/services/maintenance";
import {
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  PieChart,
  ClipboardCheck,
  AlertOctagon,
  LineChart,
} from "lucide-react";

export default function MaintenanceMetrics() {
  // Date Logic (Last 6 Months)
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["maintenance-tickets", "metrics"],
    queryFn: async () => maintenanceService.getTickets({ startDate: start, endDate: end }),
  });

  if (isLoading)
    return (
      <div className="p-10 text-center text-slate-500">
        Calculando indicadores...
      </div>
    );
  if (!tickets || tickets.length === 0)
    return (
      <div className="p-10 text-center text-slate-500">
        No hay suficientes datos para generar métricas.
      </div>
    );

  // --- Calculations ---

  // 1. Snapshot Counts (Last Month Logic or Total Fetched?)
  // Let's use total fetched for general stats, but trends for graphs.
  const completedTickets = tickets.filter((t) => t.status === "completed");
  const correctiveTickets = completedTickets.filter(
    (t) => t.type === "corrective",
  );
  const preventiveTickets = completedTickets.filter(
    (t) => t.type === "preventive",
  );

  // 2. Data Grouping by Month for Trends
  const monthlyStats: Record<
    string,
    { repairTime: number; failures: number; totalHours: number }
  > = {};
  const months: Array<{ key: string; label: string }> = [];

  // Initialize last 6 months
  // today is already defined above
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const daysInMonth = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
    ).getDate();
    monthlyStats[key] = {
      repairTime: 0,
      failures: 0,
      totalHours: daysInMonth * 24,
    };
    months.push({
      key,
      label: d.toLocaleDateString("es-ES", { month: "short" }),
    });
  }

  correctiveTickets.forEach((t) => {
    if (t.completed_at && t.started_at) {
      const date = new Date(t.completed_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyStats[key]) {
        const diffMinutes =
          (date.getTime() - new Date(t.started_at).getTime()) / (1000 * 60);
        if (diffMinutes > 0 && diffMinutes < 10000) {
          monthlyStats[key].repairTime += diffMinutes;
          monthlyStats[key].failures += 1;
        }
      }
    }
  });

  // Calculate Trends
  const trends = months.map((m) => {
    const stats = monthlyStats[m.key];
    const mttr =
      stats.failures > 0 ? Math.round(stats.repairTime / stats.failures) : 0;

    // MTBF = (Total Time - Repair Time) / Failures
    // If failures = 0, hypothetically infinite, but we cap at totalHours for viz or return totalHours
    const repairHours = stats.repairTime / 60;
    const upTime = stats.totalHours - repairHours;
    const mtbf =
      stats.failures > 0
        ? Math.round(upTime / stats.failures)
        : stats.totalHours;

    return { ...m, mttr, mtbf };
  });

  // Global Stats (Average of period)
  const validRepairCount = correctiveTickets.filter(
    (t) => t.started_at && t.completed_at,
  ).length;
  let totalRepairTimeMinutes = 0;
  correctiveTickets.forEach((t) => {
    if (t.started_at && t.completed_at)
      totalRepairTimeMinutes +=
        (new Date(t.completed_at).getTime() -
          new Date(t.started_at).getTime()) /
        (1000 * 60);
  });

  const mttr =
    validRepairCount > 0
      ? Math.round(totalRepairTimeMinutes / validRepairCount)
      : 0;

  const totalRepairHoursAll = totalRepairTimeMinutes / 60;
  
  // 6. OEE & TEEP Indicators
  // Availability (Real based on downtime)
  const totalDaysPeriod = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
  const totalHoursPeriod = totalDaysPeriod * 24;
  
  const mtbf =
    validRepairCount > 0
      ? Math.round(
          (totalHoursPeriod - totalRepairHoursAll) / validRepairCount,
        )
      : 0;

  const availabilityPct = totalHoursPeriod > 0 
    ? (1 - (totalRepairHoursAll / totalHoursPeriod)) * 100 
    : 0;

  // Placeholder for unavailable Production Data (Performance & Quality)
  const performancePct = 95.0; // Standard target
  const qualityPct = 99.5;     // Standard target
  
  const oeePct = (availabilityPct / 100) * (performancePct / 100) * (qualityPct / 100) * 100;
  // TEEP = OEE * Utilization (assuming 100% utilization 24/7 for now or 24/24)
  const teepPct = oeePct;

  // 5. Top Issues (Pareto by Machine)
  const machineFailures: Record<string, number> = {};
  correctiveTickets.forEach((t) => {
    const name = t.machine?.name || "Desconocida";
    machineFailures[name] = (machineFailures[name] || 0) + 1;
  });

  const sortedMachines = Object.entries(machineFailures)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5

  // Chart Scaling Helpers
  const maxMttr = Math.max(...trends.map((t) => t.mttr), 10);
  const maxMtbf = Math.max(...trends.map((t) => t.mtbf), 10);

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Same cards as before, just updated values */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                MTTR (Promedio)
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {mttr}{" "}
                <span className="text-sm text-slate-400 font-normal">min</span>
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                MTBF (Confiabilidad)
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {mtbf > 0 ? mtbf : "--"}{" "}
                <span className="text-sm text-slate-400 font-normal">hrs</span>
              </h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Disponibilidad
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {availabilityPct.toFixed(2)}%
              </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Fallas Totales
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {correctiveTickets.length}
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* OEE / TEEP Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">OEE (Efectividad Global)</p>
                 <h3 className="text-3xl font-black mt-2 text-amber-400">{oeePct.toFixed(1)}%</h3>
               </div>
               <PieChart className="w-8 h-8 text-white/20" />
             </div>
           <div className="flex gap-2 text-xs text-slate-400 mt-2">
             <span>D: {availabilityPct.toFixed(1)}%</span> • 
             <span>R: {performancePct}%</span> • 
             <span>C: {qualityPct}%</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">TEEP (Productividad Total)</p>
               <h3 className="text-3xl font-bold mt-2 text-indigo-600">{teepPct.toFixed(1)}%</h3>
             </div>
             <ClipboardCheck className="w-8 h-8 text-indigo-200" />
           </div>
           <p className="text-xs text-slate-400">basado en 24/7</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tiempo Muerto (Downtime)</p>
               <h3 className="text-3xl font-bold mt-2 text-red-500">{Math.round(totalRepairHoursAll)} hrs</h3>
             </div>
             <AlertOctagon className="w-8 h-8 text-red-200" />
           </div>
           <p className="text-xs text-slate-400">Total en el periodo</p>
        </div>
      </div>

      {/* NEW: MTTR & MTBF Trends Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-slate-500" />
          Tendencia Histórica: MTTR vs MTBF
        </h4>
        <div className="h-64 w-full relative">
          {/* SVG Chart */}
          <svg
            viewBox="0 0 1000 300"
            className="w-full h-full overflow-visible"
          >
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="50"
                y1={300 - i * 75}
                x2="1000"
                y2={300 - i * 75}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            {/* MTTR Line (Blue) */}
            <path
              d={`M ${trends.map((t, i) => `${50 + i * (950 / (trends.length - 1))}, ${300 - (t.mttr / maxMttr) * 200}`).join(" L ")}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            {trends.map((t, i) => (
              <g key={`mttr-${i}`}>
                <circle
                  cx={50 + i * (950 / (trends.length - 1))}
                  cy={300 - (t.mttr / maxMttr) * 200}
                  r="4"
                  fill="#3b82f6"
                />
                <text
                  x={50 + i * (950 / (trends.length - 1))}
                  y={300 - (t.mttr / maxMttr) * 200 - 10}
                  textAnchor="middle"
                  className="text-xs fill-blue-600 font-bold"
                >
                  {t.mttr}m
                </text>
              </g>
            ))}

            {/* MTBF Line (Purple) - Scaled Independently visually for demo, or using secondary axis logic */}
            <path
              d={`M ${trends.map((t, i) => `${50 + i * (950 / (trends.length - 1))}, ${300 - (t.mtbf / maxMtbf) * 200}`).join(" L ")}`}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
            {trends.map((t, i) => (
              <g key={`mtbf-${i}`}>
                <circle
                  cx={50 + i * (950 / (trends.length - 1))}
                  cy={300 - (t.mtbf / maxMtbf) * 200}
                  r="4"
                  fill="#8b5cf6"
                />
                <text
                  x={50 + i * (950 / (trends.length - 1))}
                  y={300 - (t.mtbf / maxMtbf) * 200 - 25}
                  textAnchor="middle"
                  className="text-xs fill-purple-600 font-bold"
                >
                  {t.mtbf}h
                </text>
              </g>
            ))}

            {/* X Axis Labels */}
            {trends.map((t, i) => (
              <text
                key={i}
                x={50 + i * (950 / (trends.length - 1))}
                y="320"
                textAnchor="middle"
                className="text-xs fill-slate-500 font-medium"
              >
                {t.label}
              </text>
            ))}
          </svg>

          <div className="absolute top-0 right-0 p-2 bg-white/80 rounded-lg border border-slate-100 text-xs flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>MTTR (Minutos)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>MTBF (Horas)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower row: Pareto & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
        {/* Top Failing Machines */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-500" />
            Máquinas con Más Fallas (Pareto)
          </h4>
          <div className="flex-1 space-y-4">
            {sortedMachines.map(([name, count], idx) => (
              <div key={name} className="relative">
                <div className="flex justify-between text-sm mb-1 font-medium text-slate-700">
                  <span>
                    {idx + 1}. {name}
                  </span>
                  <span>{count} fallas</span>
                </div>
                <div className="w-full bg-slate-100 h-8 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-slate-800 rounded-lg transition-all duration-500 flex items-center px-3 text-white text-xs font-bold"
                    style={{
                      width: `${(count / sortedMachines[0][1]) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Mix */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="font-bold text-slate-800 mb-6">
            Distribución del Trabajo
          </h4>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="w-48 h-48 rounded-full border-[20px] border-blue-100 flex items-center justify-center relative">
              <div className="w-24 h-24 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">
                  {completedTickets.length}
                </span>
                <span className="text-xs text-slate-500 uppercase">Total</span>
              </div>
            </div>
            <div className="flex gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {preventiveTickets.length}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase">
                  Preventivos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {correctiveTickets.length}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase">
                  Correctivos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
