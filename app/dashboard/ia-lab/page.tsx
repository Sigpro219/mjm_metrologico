'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { 
  UploadCloud, 
  FileText, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Cpu, 
  FileCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { useTenant } from '@/components/providers/TenantProvider';
import { analyzeMetrologyCertificateWithGemini, ExtractedMetrologyData } from '@/lib/geminiMetrologyService';

interface CalibrationPoint {
  nominal: number;
  reference: number;
  measured: number;
  uncertainty: number;
  emp: number;
  unit: string;
}

interface ExtractedData {
  instrumentName: string;
  serial: string;
  brand: string;
  model: string;
  capacity: string;
  certificateNumber: string;
  calibrationDate: string;
  laboratoryName: string;
  laboratoryType: 'Acreditado' | 'Trazable';
  normaReferencia?: string;
  veredicto?: 'Conforme' | 'No Conforme' | 'Zona de Duda';
  dictamenParrafo?: string;
  aptitudUso?: string;
  points: CalibrationPoint[];
}

export default function IALabPage() {
  const { tenantId, brandName } = useTenant();
  
  // States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  
  // Database check states
  const [existingAssets, setExistingAssets] = useState<any[]>([]);
  const [existsInInventory, setExistsInInventory] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  
  // Custom manual adjustment mode
  const [isEditing, setIsEditing] = useState(false);

  // Load all assets to match serial number
  const loadAssets = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'hierarchy'));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExistingAssets(items);
    } catch (error) {
      console.error('Error fetching assets for verification:', error);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // Check if serial matches when extractedData changes
  useEffect(() => {
    if (extractedData) {
      const serialLower = extractedData.serial.toLowerCase().trim();
      const match = existingAssets.some(asset => {
        const assetSerial = asset.metadata?.serial || '';
        return assetSerial.toLowerCase().trim() === serialLower;
      });
      setExistsInInventory(match);
      setRegistrationSuccess(null);
    }
  }, [extractedData, existingAssets]);

  // Handle PDF selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF válido.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setExtractedData(null);
    setRegistrationSuccess(null);
  };

  // Conexión real con Google Gemini 3.6 Flash para interpretación metrológica multimodal
  const handleStartParsing = async () => {
    if (!selectedFile) return;

    setIsParsing(true);
    setParsingProgress(15);

    const interval = setInterval(() => {
      setParsingProgress(prev => (prev >= 90 ? 90 : prev + 15));
    }, 500);

    try {
      const realData = await analyzeMetrologyCertificateWithGemini(selectedFile);
      clearInterval(interval);
      setParsingProgress(100);
      setExtractedData(realData);
    } catch (err: any) {
      clearInterval(interval);
      console.error("Error analizando con Gemini:", err);
      alert("Error procesando certificado con Gemini: " + (err.message || 'Error desconocido'));
    } finally {
      setIsParsing(false);
    }
  };

  // Perform Auto-Registration in Firestore
  const handleAutoRegister = async () => {
    if (!extractedData) return;

    setIsRegistering(true);
    try {
      // Find latest sequential MJM ID (e.g. find all codes starting with MJM- and get max number)
      let nextNumber = 1;
      const mjmInstruments = existingAssets.filter(asset => 
        asset.type === 'instrument' && 
        asset.full_code?.startsWith('MJM-')
      );

      if (mjmInstruments.length > 0) {
        const numbers = mjmInstruments.map(asset => {
          const numStr = asset.full_code.replace('MJM-', '');
          const parsed = parseInt(numStr);
          return isNaN(parsed) ? 0 : parsed;
        });
        nextNumber = Math.max(...numbers, 0) + 1;
      } else {
        // Fallback to searching all unit codes
        const allInstrumentCodes = existingAssets
          .filter(asset => asset.type === 'instrument')
          .map(asset => parseInt(asset.unit_code));
        const maxCode = allInstrumentCodes.length > 0 ? Math.max(...allInstrumentCodes, 0) : 0;
        nextNumber = maxCode + 1;
      }

      const nextCodeStr = nextNumber.toString().padStart(2, '0');
      const nextFullCode = `MJM-${nextCodeStr}`;

      // Find a default zone parent (process type) in the hierarchy to attach the instrument
      const zoneNode = existingAssets.find(node => node.type === 'process');
      const parentId = zoneNode ? zoneNode.id : 'default-zone';

      const payload = {
        name: extractedData.instrumentName,
        type: 'instrument',
        unit_code: nextCodeStr,
        parentId: parentId,
        tenantId: tenantId || 'mjm',
        metadata: {
          brand: extractedData.brand,
          model: extractedData.model,
          serial: extractedData.serial,
          capacity: extractedData.capacity,
          status: 'Operativo',
          criticality: 'B',
          mfg_year: new Date().getFullYear().toString(),
          purchase_date: new Date().toISOString().split('T')[0],
          image_url: ''
        }
      };

      await addDoc(collection(db, 'hierarchy'), payload);
      setRegistrationSuccess(nextFullCode);
      await loadAssets(); // Refresh assets
    } catch (err: any) {
      console.error('Error auto-registering instrument:', err);
      alert('Error al registrar equipo: ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Metrological calculations
  const evaluatePoint = (pt: CalibrationPoint) => {
    const error = Math.abs(pt.measured - pt.reference);
    const criterion = error + pt.uncertainty;
    const isCompliant = criterion <= pt.emp;
    return { error, criterion, isCompliant };
  };

  const getOverallVerdict = () => {
    if (!extractedData) return null;
    const isNoConforme = extractedData.veredicto === 'No Conforme';
    const isDuda = extractedData.veredicto === 'Zona de Duda';
    const hasFail = isNoConforme || (extractedData.points.length > 0 && extractedData.points.some(pt => !evaluatePoint(pt).isCompliant));

    return {
      status: isNoConforme || hasFail ? 'NO_CONFORME' : isDuda ? 'ZONA_DE_DUDA' : 'CONFORME',
      text: isNoConforme || hasFail 
        ? 'No Conforme (Reprobado)' 
        : isDuda 
        ? 'Zona de Duda (Indeterminación / Guard Band)' 
        : 'Conforme (Aprobado)',
      colorClass: isNoConforme || hasFail 
        ? 'text-red-700 bg-red-50 border-red-200' 
        : isDuda 
        ? 'text-amber-800 bg-amber-50 border-amber-200' 
        : 'text-green-700 bg-green-50 border-green-200',
      badgeClass: isNoConforme || hasFail ? 'bg-red-500 text-white' : isDuda ? 'bg-amber-500 text-white' : 'bg-green-500 text-white',
      desc: extractedData.dictamenParrafo || (isNoConforme || hasFail
        ? 'El instrumento presenta desviaciones fuera de la tolerancia metrológica admisible más su incertidumbre expandida (U).' 
        : 'El instrumento cumple satisfactoriamente con la tolerancia especificada bajo las normas ISO/IEC 17025 e ISO 10012.')
    };
  };

  const verdict = getOverallVerdict();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Brain className="text-amber-500 animate-pulse" size={26} />
          Laboratorio de Verificación con IA
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Análisis automatizado de certificaciones de calibración en PDF bajo los lineamientos de la norma ISO 10012:2026.
        </p>
      </div>

      {/* Unified File Upload & Controls Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Area: Dropzone */}
          <div className="md:col-span-6">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-amber/50 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all text-center">
              <UploadCloud size={32} className="text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700 truncate max-w-full px-4">
                {selectedFile ? selectedFile.name : 'Seleccionar Certificado PDF'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Haz clic para examinar archivos .pdf de prueba
              </span>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </div>

          {/* Right Area: Main Actions */}
          <div className="md:col-span-6 flex flex-col sm:flex-row gap-3">
            {selectedFile && !extractedData && (
              <button
                onClick={handleStartParsing}
                disabled={isParsing}
                className="flex-1 py-4 bg-slate-850 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isParsing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Procesando... {parsingProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" />
                    Analizar Certificado
                  </>
                )}
              </button>
            )}

            {pdfUrl && (
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="flex-1 py-4 bg-amber hover:bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Ver Certificado PDF
              </button>
            )}

            {!selectedFile && (
              <div className="flex-1 flex items-center justify-center p-4 border border-slate-100 rounded-xl bg-slate-50 text-[11px] font-semibold text-slate-400 text-center">
                Por favor carga una certificación para iniciar el diagnóstico
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Analysis Display Panel */}
      {(extractedData || isParsing) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-2">
              <Cpu size={18} className="text-slate-400" />
              Diagnóstico e Interpretación Metrológica
            </h3>
            {extractedData && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-amber hover:text-amber-600 transition-colors uppercase tracking-wider"
              >
                {isEditing ? 'Guardar Cambios' : 'Ajustar Datos'}
              </button>
            )}
          </div>

          {isParsing && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Escaneando documento...</p>
                <p className="text-[10px] text-slate-400">Extrayendo magnitudes, puntos e incertidumbre expandida</p>
              </div>
            </div>
          )}

          {extractedData && !isParsing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Metrological Certificate Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instrumento Calibrado</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={extractedData.instrumentName} 
                        onChange={e => setExtractedData({...extractedData, instrumentName: e.target.value})}
                        className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded mt-1 bg-white" 
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{extractedData.instrumentName}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nº Serie del Certificado</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={extractedData.serial} 
                        onChange={e => setExtractedData({...extractedData, serial: e.target.value})}
                        className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded mt-1 bg-white" 
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{extractedData.serial}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marca / Modelo</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{extractedData.brand} / {extractedData.model}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Número de Certificado</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{extractedData.certificateNumber}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Laboratorio Emisor</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{extractedData.laboratoryName}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha de Calibración</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{extractedData.calibrationDate}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trazabilidad</span>
                      <span className={`block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5 border ${
                        extractedData.laboratoryType === 'Acreditado' 
                          ? 'text-blue-600 bg-blue-50 border-blue-200' 
                          : 'text-orange-600 bg-orange-50 border-orange-200'
                      }`}>
                        {extractedData.laboratoryType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Status Alert & Auto-Registration */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                existsInInventory 
                  ? 'bg-green-50/50 border-green-200 text-green-800' 
                  : 'bg-amber-50/50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center gap-3">
                  {existsInInventory ? (
                    <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                  ) : (
                    <AlertCircle className="text-amber-500 shrink-0 animate-bounce" size={20} />
                  )}
                  <div>
                    <h4 className="text-xs font-bold">
                      {existsInInventory 
                        ? 'Instrumento sincronizado con tu inventario.' 
                        : 'Instrumento de prueba no encontrado en tu base de datos.'}
                    </h4>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {existsInInventory 
                        ? 'La serie coincide con un activo registrado. El historial se adjuntará automáticamente.' 
                        : 'Puedes auto-registrar este equipo con un solo click. Se le asignará el identificador secuencial siguiente.'}
                    </p>
                  </div>
                </div>
                
                {!existsInInventory && !registrationSuccess && (
                  <button
                    onClick={handleAutoRegister}
                    disabled={isRegistering}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all shrink-0 shadow-md"
                  >
                    {isRegistering ? 'Registrando...' : 'Auto-Registrar'}
                  </button>
                )}

                {registrationSuccess && (
                  <div className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
                    Registrado: {registrationSuccess}
                  </div>
                )}
              </div>

              {/* Calibration Points Table (Multi-point Support) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Puntos de Calibración Evaluados
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 italic">
                    Fórmula: Error Encontrado + Incertidumbre ≤ EMP
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Valor Nominal</th>
                        <th className="px-4 py-3">Valor Ref.</th>
                        <th className="px-4 py-3">Valor Medido</th>
                        <th className="px-4 py-3">Error Abs.</th>
                        <th className="px-4 py-3">Incertidumbre (U)</th>
                        <th className="px-4 py-3">EMP</th>
                        <th className="px-4 py-3 text-right">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                      {extractedData.points.map((pt, idx) => {
                        const { error, criterion, isCompliant } = evaluatePoint(pt);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-bold">{pt.nominal} {pt.unit}</td>
                            <td className="px-4 py-3 font-mono">{pt.reference}</td>
                            <td className="px-4 py-3 font-mono">{pt.measured}</td>
                            <td className="px-4 py-3 font-mono">{error.toFixed(4)}</td>
                            <td className="px-4 py-3 font-mono">{pt.uncertainty}</td>
                            <td className="px-4 py-3 font-mono font-bold">{pt.emp}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isCompliant 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {isCompliant ? (
                                  <>
                                    <CheckCircle2 size={10} /> Conforme
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={10} /> No Conforme
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overall Verdict Card */}
              {verdict && (
                <div className={`p-6 rounded-3xl border space-y-4 ${verdict.colorClass}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${verdict.badgeClass}`}>
                        {verdict.status === 'CONFORME' ? (
                          <ShieldCheck size={24} />
                        ) : (
                          <AlertCircle size={24} />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
                          Dictamen Metrológico Oficial {extractedData.normaReferencia ? `· ${extractedData.normaReferencia}` : ''}
                        </p>
                        <h4 className="text-lg font-black tracking-tight">{verdict.text}</h4>
                      </div>
                    </div>
                    {extractedData.aptitudUso && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-black/10">
                        {extractedData.aptitudUso}
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-white/80 rounded-2xl border border-black/5 shadow-sm">
                    <p className="text-xs font-medium leading-relaxed text-slate-800">
                      {verdict.desc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PDF Fullscreen Modal */}
      {isPdfModalOpen && pdfUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-amber-500" size={20} />
                <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">
                  Visor Completo del Certificado
                </h3>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-850 transition-colors"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 bg-slate-100 p-2 relative">
              <iframe 
                src={pdfUrl} 
                className="w-full h-full rounded-2xl border border-slate-200 shadow-inner"
                title="Visor de PDF Expandido"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
