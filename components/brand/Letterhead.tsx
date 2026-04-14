import React from "react";
import { useState, useEffect } from 'react';
import { useTenant } from '@/components/providers/TenantProvider';
import { storageService } from '@/services/storage';
import { MapPin, Phone, Mail, Smartphone } from "lucide-react";

interface LetterheadProps {
  children: React.ReactNode;
  id?: string;
}

export function Letterhead({ children, id }: LetterheadProps) {
  const { brandName, tenantId } = useTenant();
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    const fetchLogo = async () => {
      const url = await storageService.getLogoUrl(tenantId);
      setLogoUrl(url);
    };
    fetchLogo();
  }, [tenantId]);

  return (
    <div 
      id={id} 
      className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[12mm] relative mx-auto shadow-2xl print:shadow-none print:m-0 flex flex-col overflow-hidden"
    >
      {/* Watermark Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Institutional Watermark - Center Y (Central Pattern) - Extremely subtle */}
          <div className="absolute left-[-20mm] top-1/2 -translate-y-1/2 w-[160mm] opacity-[0.02] pointer-events-none grayscale">
            <img 
               src="/watermark.png" 
               alt="Watermark Pattern" 
               className="w-full h-auto object-contain"
            />
          </div>

          {/* Institutional Watermark - Bottom Right (Pie de página pattern) - Subtle */}
          <div className="absolute right-[-25mm] bottom-[-10mm] w-[100mm] opacity-[0.1] pointer-events-none">
            <img 
               src="/footer_pattern.png" 
               alt="Footer Pattern" 
               className="w-full h-auto object-contain"
            />
          </div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 h-full">
        {/* Letterhead Header */}
        <div className="flex justify-between items-start border-b-2 border-slate/10 pb-6 mb-8">
          <div>
            {logoUrl ? (
              <img src={logoUrl} alt={`${brandName} Logo`} className="h-16 w-auto object-contain" />
            ) : (
              <div className="h-16 w-48 bg-slate/5 animate-pulse" />
            )}
          </div>

          {/* Company Info */}
          <div className="text-right text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-900">NIT: 901.147.649-1</p>
            <p>Régimen Común</p>
            <p>Bogotá D.C., Colombia</p>
          </div>
        </div>

        {/* Content Area - Where the specific document content goes */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer - Pushed to the very bottom */}
        <div className="mt-auto pt-6 border-t border-slate-200 text-[9px] text-slate-400 uppercase tracking-widest grid grid-cols-3 gap-4 shrink-0">
          {/* Column 1: Address */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-amber-500" />
            <span className="text-left font-medium">Carrera 50 # 2F-10 Oficina 1-01</span>
          </div>

          {/* Column 2: Phones */}
          <div className="flex flex-col gap-1 items-center">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-amber-500" />
              <span>601-5177551</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-3 h-3 text-amber-500" />
              <span>301326488</span>
            </div>
          </div>

          {/* Column 3: Emails */}
          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-amber-500" />
              <span className="lowercase">Jimena.gaitan@ingyemel.com.co</span>
            </div>
            <span className="lowercase">ingyemel@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
