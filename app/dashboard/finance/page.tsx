"use client";

import { DollarSign, Wallet, TrendingUp, CreditCard } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.32))]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-slate-500" />
            Operaciones Financieras
          </h1>
          <p className="text-slate-500">Gestión de costos, presupuestos y rentabilidad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Costos Mantenimiento */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700">Costos de Mantenimiento</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mes Actual</p>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">$0.00</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
             <span className="text-xs text-slate-500">Sin datos registrados</span>
          </div>
        </div>
        
        {/* Card: Presupuesto */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700">Presupuesto Ejecutado</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Anual 2024</p>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">0%</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Card: ROI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
             <div>
              <h3 className="font-bold text-slate-700">Retorno de Inversión</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Estimado</p>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">--</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
             <span className="text-xs text-slate-500">Requiere datos de producción</span>
          </div>
        </div>
      </div>
      
      {/* Empty State for Content */}
      <div className="flex-1 mt-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
           <DollarSign className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">Módulo Financiero Iniciado</h3>
        <p className="text-slate-500 max-w-md text-sm">
          Este módulo está listo para recibir integraciones con costos de repuestos, mano de obra y facturación externa.
        </p>
      </div>
    </div>
  );
}
