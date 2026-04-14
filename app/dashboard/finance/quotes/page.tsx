"use client";

import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]); // Initial empty state

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.32))]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-500" />
            Gestión de Cotizaciones
          </h1>
          <p className="text-slate-500">Administra y crea nuevas cotizaciones para clientes</p>
        </div>
        <Link 
          href="/dashboard/finance/quotes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Cotización
        </Link>
      </div>

      {/* Empty State / List */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">No hay cotizaciones registradas</h3>
        <p className="text-slate-500 max-w-sm text-sm mb-6">
          Comienza creando una nueva propuesta comercial. Próximamente podrás generar PDFs e imprimir documentos.
        </p>
      </div>
    </div>
  );
}
