"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTenant } from '@/components/providers/TenantProvider';
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const { brandName, tenantId, logoUrl } = useTenant();
  const pathname = usePathname();
  const [isAssetsOpen, setIsAssetsOpen] = useState(true);
  const [isFinanceOpen, setIsFinanceOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === path;
    return pathname?.startsWith(path) 
      ? "bg-[color:var(--color-primary)] text-white font-medium shadow-sm shadow-[color:var(--color-primary)]/20" 
      : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent";
  };

  const menuBtnClasses = "w-[calc(100%-1.5rem)] mx-3 flex items-center justify-between px-3 py-2.5 text-[13px] font-medium transition-all rounded-lg mb-0.5 hover:bg-white/5";
  const navItemClasses = "w-[calc(100%-1.5rem)] mx-3 flex items-center px-3 py-2.5 text-[13px] font-medium transition-all rounded-lg mb-0.5";
  const subItemClasses = "w-[calc(100%-1.5rem)] mx-3 flex items-center pl-10 pr-3 py-2 text-[13px] font-medium transition-all rounded-lg mb-0.5";

  return (
    <aside className="w-[230px] text-white flex flex-col z-20 h-screen shrink-0 border-r border-[#1e293b]" style={{ backgroundColor: 'var(--color-secondary, #0B1437)' }}>
      {/* Logo Area */}
      <div className="py-6 flex flex-col items-center border-b border-white/5 shrink-0 bg-white/5 gap-3">
        <div className="flex flex-col items-center gap-3 w-full justify-center px-4 text-center">
          {logoUrl ? (
            <div className="bg-white/10 p-3 rounded-2xl w-full flex justify-center shadow-inner">
              <Image
                src={logoUrl}
                alt={brandName}
                width={180}
                height={60}
                className="h-14 w-auto object-contain drop-shadow-md opacity-100"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 text-white font-bold text-xl tracking-wide w-full mb-1">
              <span className="material-icons text-[color:var(--color-primary)] bg-white/10 p-3 rounded-xl text-[32px] shadow-sm">inventory_2</span>
            </div>
          )}
          <span className="text-white font-black text-sm tracking-wider uppercase opacity-100 truncate max-w-[200px] drop-shadow-sm">{brandName}</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        
        {/* Module: Gestión Metrológica */}
        <div className="mb-2">
          <button
            onClick={() => setIsAssetsOpen(!isAssetsOpen)}
            className={`${menuBtnClasses} ${isAssetsOpen ? 'text-white' : 'text-slate-300'}`}
          >
            <div className="flex items-center gap-3">
              <span className="material-icons text-[18px] opacity-80">{isAssetsOpen ? 'analytics' : 'insights'}</span>
              Gestión Metrológica
            </div>
            <span className="material-icons text-[16px] transition-transform duration-300 opacity-60" style={{ transform: isAssetsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_more
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isAssetsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-1"
              >
                <Link href="/dashboard/maintenance" className={`${subItemClasses} ${isActive("/dashboard/maintenance")}`}>
                   <span className="material-icons text-[18px] mr-3 opacity-80">upcoming</span>
                   Plan de Mantenimiento
                </Link>
                <Link href="/dashboard/assets" className={`${subItemClasses} ${isActive("/dashboard/assets")}`}>
                   <span className="material-icons text-[18px] mr-3 opacity-80">precision_manufacturing</span>
                   Inventario de Activos
                </Link>
                <Link href="/dashboard/cms" className={`${subItemClasses} ${isActive("/dashboard/cms")}`}>
                   <span className="material-icons text-[18px] mr-3 opacity-80">verified</span>
                   Control de Calidad
                </Link>
                <button 
                  onClick={() => alert("Módulo de Certificados en desarrollo")}
                  className={`${subItemClasses} text-white/30 hover:text-white/50 border-transparent text-left`}
                >
                  <span className="material-icons text-[18px] mr-3 opacity-80">workspace_premium</span>
                  Certificados
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Module: Operaciones Financieras (Hiden for MJM) */}
        {tenantId !== 'mjm' && (
          <div className="mb-2">
            <button
              onClick={() => setIsFinanceOpen(!isFinanceOpen)}
              className={`${menuBtnClasses} ${isFinanceOpen ? 'text-white' : 'text-slate-300'}`}
            >
              <div className="flex items-center gap-3">
                <span className="material-icons text-[18px] opacity-80">{isFinanceOpen ? 'account_balance' : 'account_balance_wallet'}</span>
                Finanzas
              </div>
              <span className="material-icons text-[16px] transition-transform duration-300 opacity-60" style={{ transform: isFinanceOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isFinanceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-1"
                >
                  <Link href="/dashboard/finance" className={`${subItemClasses} ${pathname === "/dashboard/finance" ? "bg-[color:var(--color-primary)] text-white shadow-sm shadow-[color:var(--color-primary)]/20" : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"}`}>
                    <span className="material-icons text-[18px] mr-3 opacity-80">dashboard</span>
                    Resumen
                  </Link>
                  <Link href="/dashboard/finance/quotes" className={`${subItemClasses} ${isActive("/dashboard/finance/quotes")}`}>
                    <span className="material-icons text-[18px] mr-3 opacity-80">request_quote</span>
                    Cotizaciones
                  </Link>
                  <Link href="/dashboard/finance/clients" className={`${subItemClasses} ${isActive("/dashboard/finance/clients")}`}>
                    <span className="material-icons text-[18px] mr-3 opacity-80">groups</span>
                    Clientes
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Module: Configuración */}
        <div className="mt-2">
          <Link
            href="/dashboard/config"
            className={`${navItemClasses} ${isActive("/dashboard/config")}`}
          >
            <span className="material-icons text-[18px] mr-3 opacity-80">settings</span>
            Configuración
          </Link>
        </div>

      </nav>

      {/* User Footer (Simple Logout) */}
      <div className="p-4 mt-auto shrink-0 border-t border-white/5 bg-black/10">
        <Link
          href="/"
          className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-white/10 text-[13px] font-medium"
          title="Cerrar Sesión"
        >
          <span className="material-icons text-[18px] opacity-80 rotate-180">logout</span>
          Cerrar Sesión
        </Link>
      </div>
    </aside>
  );
}

