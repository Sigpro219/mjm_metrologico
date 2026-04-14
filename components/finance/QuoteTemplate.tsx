import { Letterhead } from "@/components/brand/Letterhead";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface QuoteData {
  date: string; // ISO String
  clientName: string;
  clientNit: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  clientLegalRep: string;
  validityDays: number;
  items: QuoteItem[];
}

export function QuoteTemplate({ data }: { data: QuoteData }) {
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const total = subtotal; // Add tax logic if needed

  return (
    <Letterhead id="quote-template">
      {/* Title & Date */}
      <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">COTIZACIÓN</h1>
          <p className="text-sm text-slate-500 mt-1">N° <span className="font-mono text-slate-900">COT-2024-001</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-700">Fecha: {data.date ? new Date(data.date).toLocaleDateString() : ""}</p>
          <p className="text-xs text-slate-500">Válido hasta: {data.date ? new Date(new Date(data.date).getTime() + data.validityDays * 86400000).toLocaleDateString() : ""}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente</h3>
          <p className="font-bold text-lg text-slate-800">{data.clientName || "Nombre del Cliente"}</p>
          <p className="text-sm text-slate-600">{data.clientAddress}</p>
          {data.clientPhone && <p className="text-sm text-slate-600">Tel: {data.clientPhone}</p>}
          {data.clientEmail && <p className="text-sm text-slate-600">Email: {data.clientEmail}</p>}
          {data.clientNit && <p className="text-sm text-slate-600">NIT: {data.clientNit}</p>}
          {data.clientLegalRep && <p className="text-sm text-slate-600 mt-2"><span className="font-semibold">Attn:</span> {data.clientLegalRep}</p>}
        </div>
        <div>
           {/* Could add specific project info here */}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead className="bg-[#FADA25] text-[#231F20]">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-wider rounded-l-lg">Descripción</th>
            <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-wider w-24">Cant</th>
            <th className="py-3 px-4 text-right text-xs font-black uppercase tracking-wider w-32">V. Unitario</th>
            <th className="py-3 px-4 text-right text-xs font-black uppercase tracking-wider w-32 rounded-r-lg">Total</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.items.map((item, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-0">
              <td className="py-4 px-4 font-medium text-slate-700">{item.description}</td>
              <td className="py-4 px-4 text-center text-slate-600">{item.quantity} {item.unit}</td>
              <td className="py-4 px-4 text-right text-slate-600">$ {item.unitPrice.toLocaleString()}</td>
              <td className="py-4 px-4 text-right font-bold text-slate-800">$ {(item.quantity * item.unitPrice).toLocaleString()}</td>
            </tr>
          ))}
          {data.items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-400 italic">No hay ítems agregados</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>$ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>IVA (19%)</span>
            <span>$ 0</span> {/* Placeholder logic */}
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>$ {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Terms */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-xs text-slate-600 mb-8">
         <h4 className="font-bold text-slate-800 mb-2">Condiciones Comerciales</h4>
         <ul className="list-disc pl-4 space-y-1">
           <li>Validez de la oferta: {data.validityDays} días calendario.</li>
           <li>Forma de pago: 50% anticipo, 50% contra entrega.</li>
           <li>Tiempo de entrega: A convenir según disponibilidad.</li>
         </ul>
      </div>
    </Letterhead>
  );
}
