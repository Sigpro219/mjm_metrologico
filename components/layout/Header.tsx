"use client";

import { usePathname } from "next/navigation";

interface HeaderProps {
  title?: string;
  icon?: string;
}

export default function Header({ 
  title, 
  icon = "dashboard" 
}: HeaderProps) {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (title) return title;
    if (pathname?.startsWith("/dashboard/maintenance")) return "Plan de Mantenimiento";
    if (pathname?.startsWith("/dashboard/assets")) return "Gestión de Activos";
    if (pathname?.startsWith("/dashboard/config")) return "Configuración";
    if (pathname?.startsWith("/dashboard/cms")) return "Contenidos";
    return "Panel de Control";
  };

  const displayTitle = getTitle();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0 z-10 relative border-b border-slate-100">
      <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
        <span className="material-icons text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 p-1.5 rounded-lg text-lg hidden sm:block">{icon}</span>
        <span>{displayTitle}</span>
      </h1>
      <div className="flex items-center gap-6">
        {/* Placeholder Search Bar */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-[color:var(--color-primary)]/20 focus-within:border-[color:var(--color-primary)] transition-all">
           <span className="material-icons text-slate-400 text-[18px] mr-2">search</span>
           <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-48 lg:w-64" />
        </div>

        <button className="p-2 text-slate-400 hover:text-[color:var(--color-primary)] bg-slate-50 hover:bg-slate-100 rounded-full transition-all relative">
          <span className="material-icons text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
