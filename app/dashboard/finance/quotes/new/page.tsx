"use client";

import { useState, useEffect } from "react";
import { useTenant } from "@/components/providers/TenantProvider";
import { Plus, Trash, FileText, Printer, Save, ArrowLeft } from "lucide-react";
import { QuoteTemplate } from "@/components/finance/QuoteTemplate";
import { ClientService, Client } from "@/services/clients";
import Link from "next/link";

export default function NewQuotePage() {
  const { brandName } = useTenant();
  const [data, setData] = useState({
    clientId: "", // Track if client is already saved/selected
    clientName: "",
    clientNit: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    clientLegalRep: "",
    date: new Date().toISOString(), // Initialize with current date to avoid cascading renders
    validityDays: 15, // Default
    items: [
      { id: "1", description: "Servicio de Mantenimiento Preventivo", quantity: 1, unit: "UND", unitPrice: 0 }
    ]
  });

  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Removed useEffect for date setting to fix lint error and improve performance

  const addItem = () => {
    setData({
      ...data,
      items: [
        ...data.items,
        { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, unit: "UND", unitPrice: 0 }
      ]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    setData({ ...data, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, items: newItems });
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const clientName = data.clientName ? `_${data.clientName.replace(/\s+/g, '_')}` : '';
    const dateStr = new Date().toISOString().split('T')[0];
    
    document.title = `Cotizacion_${brandName}${clientName}_${dateStr}`;
    window.print();
    document.title = originalTitle;
  };

  const handleCreateClient = async () => {
     if (!data.clientName || !data.clientNit) {
       alert("Nombre y NIT son obligatorios para crear el cliente.");
       return;
     }

     try {
        const newClient = await ClientService.create({
          name: data.clientName,
          nit: data.clientNit,
          address: data.clientAddress || null,
          phone: data.clientPhone || null,
          email: data.clientEmail || null,
          legal_representative: data.clientLegalRep || null,
          status: 'prospect'
        });
        
        setData({ ...data, clientId: newClient.id });
        alert("Cliente creado exitosamente en base de datos.");
     } catch (error) {
       console.error("Error creating client:", error);
       alert("Error al crear el cliente. Verifique si el NIT ya existe.");
     }
  };

  const handleSave = async () => {
    if (!data.clientName || !data.clientNit) {
      alert("Por favor ingrese el Nombre y NIT del cliente para guardar.");
      return;
    }

    try {
      let clientId = data.clientId;

      // If no clientId but we have data, try to search/create (fallback)
      if (!clientId) {
          const existing = await ClientService.search(data.clientNit);
          if (existing.length > 0) {
              clientId = existing[0].id;
          } else {
             // Implicit creation if they didn't click the specific button
             // Or we could force them to click it. For now, let's keep the implicit convenience.
             const newClient = await ClientService.create({
                name: data.clientName,
                nit: data.clientNit,
                address: data.clientAddress || null,
                phone: data.clientPhone || null,
                email: data.clientEmail || null,
                legal_representative: data.clientLegalRep || null,
                status: 'prospect'
             });
             clientId = newClient.id;
             setData({ ...data, clientId }); // Update state
          }
      }
      
      // Here would go the logic to save the Quote itself linking to clientId
      console.log("Proceeding to save quote for client:", clientId);
      alert("Cotización guardada (Simulado). Cliente asociado: " + clientId);

    } catch (error) {
      console.error("Error saving:", error);
      alert("Error al guardar la información.");
    }
  };

  return (
    <div className="flex flex-col h-screen print:h-auto overflow-hidden print:overflow-visible">
      
      {/* Header - Screen Only */}
      <div className="bg-slate-900 border-b border-white/10 p-4 shrink-0 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance/quotes" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Nueva Cotización - {brandName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handlePrint}
             className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors"
           >
             <Printer className="w-4 h-4" />
             Imprimir / PDF
           </button>
           <button 
             onClick={handleSave}
             className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition-colors"
           >
             <Save className="w-4 h-4" />
             Guardar
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden bg-slate-50 print:bg-white print:block">
        
        {/* Left Panel: Form - Hidden on Print */}
        <div className="w-1/3 min-w-[320px] bg-white border-r border-slate-200 overflow-y-auto p-6 flex flex-col gap-6 print:hidden">
           <div>
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Información del Cliente</h2>
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Nombre / Razón Social</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     value={data.clientName}
                     onChange={(e) => {
                       const value = e.target.value;
                       setData({...data, clientName: value, clientId: "" /* Reset ID on manual change */});
                       if (value.length > 2) {
                         ClientService.search(value).then(setSearchResults);
                         setShowResults(true);
                       } else {
                         setSearchResults([]);
                         setShowResults(false);
                       }
                     }}
                     onFocus={() => {
                        if (data.clientName.length > 2) setShowResults(true);
                     }}
                     onBlur={() => setTimeout(() => setShowResults(false), 200)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                     placeholder="Ej: Hotel Itabü"
                   />
                   {showResults && searchResults.length > 0 && (
                     <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                       {searchResults.map(client => (
                         <button
                           key={client.id}
                           className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm flex flex-col border-b border-slate-100 last:border-0"
                           onClick={() => {
                             setData({
                               ...data,
                               clientId: client.id,
                               clientName: client.name,
                               clientNit: client.nit || "",
                               clientAddress: client.address || "",
                               clientPhone: client.phone || "",
                               clientEmail: client.email || "",
                               clientLegalRep: client.legal_representative || "",
                             });
                             setShowResults(false);
                           }}
                         >
                           <span className="font-bold text-slate-800">{client.name}</span>
                           <span className="text-xs text-slate-500">NIT: {client.nit}</span>
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">NIT / Cédula</label>
                 <input 
                   type="text" 
                   value={data.clientNit}
                   onChange={(e) => setData({...data, clientNit: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                   placeholder="Ej: 900.123.456-7"
                 />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Dirección</label>
                  <input 
                    type="text" 
                    value={data.clientAddress}
                    onChange={(e) => setData({...data, clientAddress: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                   placeholder="Ej: Calle 123 # 45-67"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      value={data.clientPhone}
                      onChange={(e) => setData({...data, clientPhone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      placeholder="Ej: 300 123 4567"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={data.clientEmail}
                      onChange={(e) => setData({...data, clientEmail: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      placeholder="Ej: correo@ejemplo.com"
                    />
                 </div>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Representante Legal</label>
                  <input 
                    type="text" 
                    value={data.clientLegalRep}
                    onChange={(e) => setData({...data, clientLegalRep: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Ej: Juan Pérez"
                  />
               </div>

               {/* Explicit Create Client Button */}
               {!data.clientId && data.clientName && data.clientNit && (
                 <button
                   onClick={handleCreateClient}
                   className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm border border-slate-200 flex items-center justify-center gap-2 transition-colors"
                 >
                   <Plus className="w-4 h-4" />
                   Crear nuevo cliente
                 </button>
               )}
               
             </div>
           </div>

           <div className="flex-1">
             <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
               <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ítems</h2>
               <button onClick={addItem} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                 <Plus className="w-3 h-3" /> Agregar
               </button>
             </div>
             
             <div className="space-y-4">
               {data.items.map((item, idx) => (
                 <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative group">
                   <button 
                     onClick={() => removeItem(idx)}
                     className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash className="w-4 h-4" />
                   </button>
                   
                   <div className="space-y-3">
                     <textarea 
                       value={item.description}
                       onChange={(e) => updateItem(idx, 'description', e.target.value)}
                       className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs resize-none focus:outline-none focus:border-amber-500"
                       rows={2}
                       placeholder="Descripción del servicio o producto..."
                     />
                     <div className="grid grid-cols-3 gap-2">
                       <div>
                         <label className="text-[10px] text-slate-400">Cant.</label>
                         <input 
                           type="number" 
                           value={item.quantity}
                           onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                           className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-right"
                         />
                       </div>
                       <div>
                          <label className="text-[10px] text-slate-400">Unidad</label>
                          <input 
                            type="text" 
                            value={item.unit}
                            onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-slate-400">V. Unitario</label>
                          <input 
                            type="number" 
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-right"
                          />
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div className="mt-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">Validez (Días)</label>
              <input 
                type="number" 
                value={data.validityDays}
                onChange={(e) => setData({...data, validityDays: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
           </div>
        </div>

                <>{/* Right Panel: Preview */}</>
        <div className="flex-1 bg-gray-100 overflow-y-auto p-8 print:p-0 print:overflow-visible flex justify-center">
          <div className="transform scale-[0.7] origin-top md:scale-[0.8] xl:scale-100 transition-transform print:transform-none print:w-full">
            <QuoteTemplate data={data} />
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          /* Basic reset for print */
          html, body {
            background: white !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Hide UI elements from the dashboard */
          .print\\:hidden, header, nav, aside {
            display: none !important;
          }

          /* Ensure the template is visible */
          #quote-template {
            visibility: visible !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Reset all transforms and parents to allow natural flow */
          main, div[class*="flex-1"], div[class*="transform"] {
            display: block !important;
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            transform: none !important;
            width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
