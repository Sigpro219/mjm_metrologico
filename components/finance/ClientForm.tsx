"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Client } from "@/services/clients";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<Client, "id" | "created_at">) => Promise<void>;
  initialData?: Client | null;
  isSubmitting?: boolean;
}

export function ClientForm({ isOpen, onClose, onSubmit, initialData, isSubmitting = false }: ClientFormProps) {
  const [formData, setFormData] = useState<Omit<Client, "id" | "created_at">>({
    name: "",
    nit: "",
    address: "",
    phone: "",
    email: "",
    legal_representative: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        nit: initialData.nit || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        legal_representative: initialData.legal_representative || ""
      });
    } else {
      setFormData({
        name: "",
        nit: "",
        address: "",
        phone: "",
        email: "",
        legal_representative: ""
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">
            {initialData ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información Básica</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Ej: Inversiones SAS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  NIT / Identificación
                </label>
                <input
                  type="text"
                  value={formData.nit || ""}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Ej: 900.123.456-7"
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">
                   Representante Legal
                 </label>
                 <input
                   type="text"
                   value={formData.legal_representative || ""}
                   onChange={(e) => setFormData({ ...formData, legal_representative: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                   placeholder="Nombre del representante"
                 />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Dirección física"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Número de contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
