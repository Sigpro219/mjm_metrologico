'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Filter, 
  Settings2, 
  History, 
  ChevronRight, 
  QrCode, 
  UploadCloud, 
  Plus,
  Zap,
  Edit,
  Download,
  Printer,
  X,
  Play,
  Wrench,
  Archive,
  FileSpreadsheet
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useTenant } from '@/components/providers/TenantProvider';
import Link from 'next/link';

interface Asset {
  id: string;
  name: string;
  type: string;
  unit_code: string;
  full_code?: string;
  metadata: {
    brand?: string;
    model?: string;
    serial?: string;
    capacity?: string;
    status?: string;
    install_date?: string;
    power_source?: string;
    image_url?: string;
    criticality?: string;
    mfg_year?: string;
    purchase_date?: string;
  };
  parentId: string; // Changed to match Firebase camelCase structure
  path?: string[];
}

interface HierarchyNode {
  id: string;
  name: string;
  unit_code: string;
  full_code?: string;
  type: string;
  parentId: string | null;
  tenantId?: string; // Added tenantId to match Firebase
  children: HierarchyNode[];
  metadata?: Asset['metadata'];
}

export default function AssetsPage() {
  const { brandName } = useTenant();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // New Asset Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);
  
  // Hierarchy selection state
  const [selClient, setSelClient] = useState('');
  const [selCity, setSelCity] = useState('');
  const [selSite, setSelSite] = useState('');
  const [selZone, setSelZone] = useState('');

  const [newNode, setNewNode] = useState({
    name: '',
    unit_code: '',
    metadata: {
      brand: '', model: '', serial: '', capacity: '', power_source: '', 
      status: 'Operativo', criticality: 'B', mfg_year: '', purchase_date: '', image_url: ''
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El servidor tardó demasiado en responder')), 10000);
      });

      const fetchPromise = getDocs(collection(db, 'hierarchy')).then(snapshot => {
        return { data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as HierarchyNode[], error: null };
      }).catch(error => {
        return { data: null, error };
      });

      // Race against the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as { data: HierarchyNode[] | null; error: any };
      const { data, error } = response;
      
      if (error) {
        console.error('❌ Error fetching assets:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert('Error de conexión: No se pudieron cargar los activos. Por favor, intente recargar la página.');
      } else if (data) {
        const allNodes = data;
        const map: Record<string, HierarchyNode> = {};
        const roots: HierarchyNode[] = [];
  
        allNodes.forEach(node => { map[node.id] = { ...node, children: [] }; });
        allNodes.forEach(node => {
          if (node.parentId && map[node.parentId]) {
            map[node.parentId].children.push(map[node.id]);
          } else {
            roots.push(map[node.id]);
          }
        });
  
        const assignCodes = (nodes: HierarchyNode[], parentCode: string = '') => {
          nodes.forEach(node => {
            if (node.type === 'country') {
              node.full_code = '';
              assignCodes(node.children, '');
            } else {
              const currentCode = node.unit_code || '??';
              const separator = parentCode ? '-' : '';
              node.full_code = `${parentCode}${separator}${currentCode}`;
              assignCodes(node.children, node.full_code);
            }
          });
        };
        
        assignCodes(roots);
        setHierarchy(roots);
        
        const instruments = allNodes
          .filter(n => n.type === 'instrument')
          .map(n => map[n.id] as unknown as Asset);
          
        setAssets(instruments);
      }
    } catch (err) {
      console.error('System Error:', err);
      // Optional: Show a toast or alert to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSave = async () => {
    if (!newNode.name || !newNode.unit_code || !selZone) {
      alert('Por favor completa los campos obligatorios (Nombre, Código y Ubicación Exacta).');
      return;
    }

    let finalImageUrl = newNode.metadata.image_url;

    // Actual upload to Firebase Storage
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `asset-images/${fileName}`;

        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        const uploadError = error as Error;
        console.error('Error uploading image:', uploadError);
        alert('Error al subir la imagen: ' + uploadError.message);
        return;
      }
    }

    try {
      if (isEditing && editingId) {
        const docRef = doc(db, 'hierarchy', editingId);
        await updateDoc(docRef, {
          name: newNode.name,
          unit_code: newNode.unit_code.padStart(2, '0'),
          parentId: selZone,
          metadata: { ...newNode.metadata, image_url: finalImageUrl }
        });
      } else {
        await addDoc(collection(db, 'hierarchy'), {
          name: newNode.name,
          type: 'instrument',
          unit_code: newNode.unit_code.padStart(2, '0'),
          parentId: selZone,
          metadata: { ...newNode.metadata, image_url: finalImageUrl },
          tenantId: 'mjm'
        });
      }
    } catch (err: any) {
      alert('Error: ' + err.message); return;
    }

    setIsModalOpen(false);
    fetchAssets();
    setNewNode({
      name: '', unit_code: '',
      metadata: {
        brand: '', model: '', serial: '', capacity: '', power_source: '', 
        status: 'Operativo', criticality: 'B', mfg_year: '', purchase_date: '', image_url: ''
      }
    });
    setSelClient(''); setSelCity(''); setSelSite(''); setSelZone('');
    setImageFile(null); setImagePreview(null);
    setIsEditing(false); setEditingId(null);
  };

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setIsEditing(true);
    
    // Normalize metadata to avoid uncontrolled input warnings (null/undefined -> '')
    const normalizedMetadata = {
      brand: asset.metadata.brand || '',
      model: asset.metadata.model || '',
      serial: asset.metadata.serial || '',
      capacity: asset.metadata.capacity || '',
      power_source: asset.metadata.power_source || '',
      status: asset.metadata.status || 'Operativo',
      criticality: asset.metadata.criticality || 'B',
      mfg_year: asset.metadata.mfg_year || '',
      purchase_date: asset.metadata.purchase_date || '',
      image_url: asset.metadata.image_url || ''
    };

    setNewNode({
      name: asset.name,
      unit_code: asset.unit_code,
      metadata: normalizedMetadata
    });
    setImagePreview(asset.metadata.image_url || null);

    const findHierarchyPath = (id: string) => {
      const path: HierarchyNode[] = [];
      const traverse = (nodes: HierarchyNode[], targetId: string): boolean => {
        for (const node of nodes) {
          if (node.id === targetId) { path.push(node); return true; }
          if (node.children && traverse(node.children, targetId)) { path.push(node); return true; }
        }
        return false;
      };
      traverse(hierarchy, id);
      return path.reverse();
    };

    const path = findHierarchyPath(asset.parentId);
    const client = path.find(n => n.type === 'client');
    const city = path.find(n => n.type === 'city');
    const site = path.find(n => n.type === 'cell');
    const zone = path.find(n => n.type === 'process');

    if (client) setSelClient(client.id);
    if (city) setSelCity(city.id);
    if (site) setSelSite(site.id);
    if (zone) setSelZone(zone.id);

    setIsModalOpen(true);
  };


  /* 
   * Updated to capture the entire label container instead of just the QR canvas.
   * Uses html-to-image to generate a high-quality PNG of the asset tag.
   */
  /* 
   * Updated to capture the entire label container instead of just the QR canvas.
   * Uses html-to-image to generate a high-quality PNG of the asset tag.
   */
  const downloadQR = async () => {
    const element = document.getElementById('asset-label-container');
    if (!element) return;

    try {
      // Dynamic import to avoid SSR issues and potential race conditions
      const { toPng: htmlToPng } = await import('html-to-image');
      
      const dataUrl = await htmlToPng(element, { 
          quality: 1.0, 
          pixelRatio: 3,
          backgroundColor: 'white',
          filter: (node: globalThis.Node) => {
              // Exclude search-related or action-related elements
              if (node instanceof HTMLElement) {
                  return !node.classList.contains('print:hidden');
              }
              return true;
          }
      });
      
      const link = document.createElement('a');
      link.download = `ETIQUETA-${selectedQRAsset?.full_code || 'ASSET'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating label image:', err);
      alert('No se pudo generar la imagen de la etiqueta.');
    }
  };

  const handleShowQR = (asset: Asset) => {
    setSelectedQRAsset(asset);
    setIsQRModalOpen(true);
  };



  const filteredAssets = assets.filter(asset => {
    const searchLower = search.toLowerCase();
    const name = asset.name?.toLowerCase() || '';
    const code = asset.full_code?.toLowerCase() || '';
    const brand = asset.metadata?.brand?.toLowerCase() || '';
    
    const matchesSearch = name.includes(searchLower) || 
                         code.includes(searchLower) || 
                         brand.includes(searchLower);
    
    const assetStatus = asset.metadata?.status || 'Operativo'; // Default to Operativo if missing
    const matchesStatus = statusFilter === 'TODOS' || assetStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Helper functions to get children for dropdowns
  const getClients = () => hierarchy;
  const getCities = (clientId: string) => hierarchy.find(n => n.id === clientId)?.children || [];
  const getSites = (cityId: string) => {
    const city = hierarchy.flatMap(client => client.children).find(n => n.id === cityId);
    return city?.children || [];
  };
  const getZones = (siteId: string) => {
    const site = hierarchy.flatMap(client => client.children).flatMap(city => city.children).find(n => n.id === siteId);
    return site?.children || [];
  };

  const handleDownloadTemplate = () => {
    const headers = [
      ['NOMBRE', 'CODIGO', 'MARCA', 'MODELO', 'SERIE', 'CAPACIDAD', 'FUENTE_ENERGIA', 'ANO_FAB', 'FECHA_COMPRA', 'ESTADO', 'CRITICIDAD']
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Activos");
    XLSX.writeFile(wb, "plantilla_carga_masiva_activos.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            const wb = XLSX.read(data, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname]; 
            const rows = XLSX.utils.sheet_to_json(ws) as any[];

            if (!rows || rows.length === 0) {
                alert("El archivo parece estar vacío.");
                setLoading(false);
                return;
            }

            let success = 0;
            let errors = 0;

            for (const row of rows) {
                if (!row.NOMBRE) continue;

                const payload = {
                    name: String(row.NOMBRE),
                    type: 'instrument',
                    unit_code: row.CODIGO ? String(row.CODIGO).padStart(2, '0') : '00',
                    parentId: null,
                    metadata: {
                        brand: String(row.MARCA || ''),
                        model: String(row.MODELO || ''),
                        serial: String(row.SERIE || ''),
                        capacity: String(row.CAPACIDAD || ''),
                        power_source: String(row.FUENTE_ENERGIA || ''),
                        status: String(row.ESTADO || 'Operativo'),
                        criticality: String(row.CRITICIDAD || 'B'),
                        mfg_year: String(row.ANO_FAB || ''),
                        purchase_date: row.FECHA_COMPRA || '',
                        image_url: ''
                    },
                    tenantId: 'mjm'
                };

                try {
                    await addDoc(collection(db, 'hierarchy'), payload);
                    success++;
                } catch (err) {
                    console.error("Row error:", err);
                    errors++;
                }
            }

            alert(`Carga completada.\n✅ Importados: ${success}\n❌ Errores: ${errors}`);
            setIsUploadModalOpen(false);
            fetchAssets(); 
        } catch (err) {
            console.error(err);
            alert("Error al procesar el archivo.");
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="text-amber" size={24} />
            Gestión de Instrumentos - {brandName}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {assets.length} instrumentos registrados en la estructura
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Operativos: {assets.length}</span>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-[11px] hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider flex items-center gap-2"
          >
            <UploadCloud size={16} className="text-blue-500" /> Carga Masiva
          </button>
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setNewNode({
                name: '', unit_code: '',
                metadata: {
                  brand: '', model: '', serial: '', capacity: '', power_source: '', 
                  status: 'Operativo', criticality: 'B', mfg_year: '', purchase_date: '', image_url: ''
                }
              });
              setSelClient(''); setSelCity(''); setSelSite(''); setSelZone('');
              setImagePreview(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-slate-800 text-white font-black rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Nuevo Instrumento
          </button>
        </div>
      </div>

      {/* Search and Filters - Sticky with background mask for clean scroll */}
      <div className="sticky -top-8 z-20 -mx-8 px-8 py-4 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm mb-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por código, nombre o marca..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber/40 bg-white shadow-sm focus:border-amber transition-all text-sm font-medium text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="flex-1 md:flex-none px-4 py-3 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-amber/40 shadow-sm cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TODOS">ESTADO: TODOS</option>
              <option value="Operativo">OPERATIVO</option>
              <option value="Mantenimiento">MANTENIMIENTO</option>
              <option value="Archivado">ARCHIVADO</option>
            </select>
            <button 
              onClick={() => {
                setSearch('');
                setStatusFilter('TODOS');
              }}
              className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all shadow-sm group relative"
              title="Limpiar filtros"
            >
              <Filter size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              {(search || statusFilter !== 'TODOS') && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
           Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="h-full bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
               <div className="aspect-4/3 bg-slate-100 animate-pulse relative">
                 <div className="absolute top-4 left-4 w-16 h-6 bg-white/50 rounded-full" />
               </div>
               <div className="p-6 flex-1 flex flex-col space-y-4">
                 <div className="h-6 bg-slate-100 rounded-lg animate-pulse w-3/4" />
                 <div className="h-4 bg-slate-50 rounded-lg animate-pulse w-1/2" />
                 <div className="mt-auto pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                   <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                   <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                 </div>
               </div>
             </div>
           ))
        ) : filteredAssets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron instrumentos</h3>
            <p className="text-slate-500 max-w-md mb-8 text-sm font-medium">
              No hay instrumentos que coincidan con tu búsqueda o filtros actuales. Intenta ajustar los términos.
            </p>
            <button 
              onClick={() => { setSearch(''); setStatusFilter('TODOS'); }}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 hover:shadow-xl text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Filter size={16} /> Limpiar Búsqueda
            </button>
          </div>
        ) : (
          filteredAssets.map((asset: Asset) => (
            <Link key={asset.id} href={`/dashboard/assets/${asset.id}`} className="group h-full">
              <div className="asset-card h-full bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-amber/10 hover:border-amber/30 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer">
              <div className="aspect-4/3 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100/50">
                {asset.metadata?.image_url ? (
                   <img src={asset.metadata.image_url} alt={asset.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
                     <Settings2 className="w-20 h-20 text-slate-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
                   </div>
                )}
                
                {/* Overlay Gradient for badges */}
                <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/20`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      asset.metadata?.status === 'Mantenimiento' ? 'bg-orange-500' : 
                      asset.metadata?.status === 'Archivado' ? 'bg-slate-400' : 'bg-green-500 animate-pulse'
                    }`}></div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{asset.metadata?.status || 'Operativo'}</span>
                  </div>
                    {/* 
                    {asset.metadata?.criticality && (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/20 font-black text-[10px] uppercase tracking-widest ${
                        asset.metadata.criticality === 'A' ? 'text-red-500' : 
                        asset.metadata.criticality === 'B' ? 'text-orange-500' : 'text-blue-500'
                      }`}>
                        Crit: {asset.metadata.criticality}
                      </div>
                    )}
                    */}
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(asset); }}
                    className="bg-white/90 backdrop-blur text-slate-600 p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-amber hover:text-white"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShowQR(asset); }}
                    className="bg-amber text-slate-900 p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-amber-500"
                  >
                    <QrCode size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-slate-800 group-hover:text-amber transition-colors leading-tight">{asset.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-black text-amber bg-amber/10 px-2 py-1 rounded-lg uppercase tracking-wider border border-amber/20">
                      {asset.full_code || `EQ-${asset.id.substring(0,6)}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 py-4 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marca / Modelo</p>
                    <p className="text-[11px] font-bold text-slate-700 truncate">
                      {asset.metadata?.brand || 'N/A'} - {asset.metadata?.model || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nº Serie</p>
                    <p className="text-[11px] font-bold text-slate-600 truncate font-mono">
                      {asset.metadata?.serial || '---'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Capacidad / Potencia</p>
                    <div className="flex items-center gap-1.5 justify-start">
                      <Zap size={10} className="text-amber-500" />
                      <p className="text-[11px] font-bold text-slate-700 truncate">{asset.metadata?.capacity || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Energía</p>
                    <p className="text-[11px] font-bold text-slate-600 truncate uppercase">{asset.metadata?.power_source?.substring(0, 15) || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <History size={12} className="text-slate-400" />
                       Historial:
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Sin alertas</span>
                  </div>
                  <button className="h-8 px-4 bg-white border border-slate-200 rounded-lg text-slate-800 font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all shadow-sm flex items-center gap-2">
                    Hoja de Vida <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 relative animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
               <div className="p-2 bg-amber rounded-xl">
                 <Zap className="text-slate-900" size={24} />
               </div>
               {isEditing ? 'Editar Instrumento' : 'Registro Técnico de Instrumento'}
            </h2>
            <p className="text-slate-400 text-xs mb-8">
              {isEditing ? 'Modifica los parámetros técnicos del instrumento' : 'Ingresa los parámetros técnicos para el nuevo instrumento'}
            </p>

            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Image and Basic Info */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                 <div className="relative aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden flex flex-col items-center justify-center group">
                    {imagePreview ? (
                        <>
                          <img src={imagePreview} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => {setImageFile(null); setImagePreview(null);}}
                            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="rotate-45" size={20} />
                          </button>
                        </>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center p-8 text-center">
                           <UploadCloud size={48} className="text-slate-300 mb-4" />
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subir Fotografía</span>
                           <span className="text-[10px] text-slate-400 mt-2 italic">Formatos: JPG, PNG • Max 5MB</span>
                           <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                 </div>

                 <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre del Instrumento *</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-800 text-white rounded-2xl outline-none focus:ring-4 focus:ring-amber/20 font-bold text-lg transition-all border-none"
                        placeholder="Ej. Balanza Analítica"
                        value={newNode.name}
                        onChange={e => setNewNode({...newNode, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Código ID (01-99) *</label>
                          <input 
                            type="text" 
                            maxLength={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber/20 font-mono text-center text-lg font-bold transition-all"
                            placeholder="01"
                            value={newNode.unit_code}
                            onChange={e => setNewNode({...newNode, unit_code: e.target.value})}
                          />
                        </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Estado del Instrumento</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'Operativo', label: 'Operativo', icon: Play, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                          { id: 'Mantenimiento', label: 'Mantenimiento', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                          { id: 'Archivado', label: 'Archivado', icon: Archive, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300' }
                        ].map((status) => (
                          <button
                            key={status.id}
                            type="button"
                            onClick={() => setNewNode({ ...newNode, metadata: { ...newNode.metadata, status: status.id } })}
                            className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
                              newNode.metadata.status === status.id 
                                ? `${status.bg} ${status.border} ${status.color} shadow-sm ring-2 ring-offset-1 ring-current/20 scale-[1.02]` 
                                : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <status.icon size={18} className="mb-1" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">{status.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Criticidad</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'A', label: 'A - ALTA', active: 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200', hover: 'hover:border-red-200 hover:bg-red-50 hover:text-red-700', inactive: 'bg-white border-slate-100 text-slate-400' },
                          { id: 'B', label: 'B - MEDIA', active: 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200', hover: 'hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700', inactive: 'bg-white border-slate-100 text-slate-400' },
                          { id: 'C', label: 'C - BAJA', active: 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200', hover: 'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700', inactive: 'bg-white border-slate-100 text-slate-400' }
                        ].map((crit) => (
                          <button
                            key={crit.id}
                            type="button"
                            onClick={() => setNewNode({ ...newNode, metadata: { ...newNode.metadata, criticality: crit.id } })}
                            className={`py-3 rounded-2xl border-2 font-black text-[10px] transition-all uppercase tracking-tighter ${
                              newNode.metadata.criticality === crit.id
                                ? crit.active
                                : `${crit.inactive} ${crit.hover}`
                            }`}
                          >
                            {crit.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    </div>
                 </div>
              </div>

              {/* Center / Right Column: Location and Specs */}
              <div className="col-span-12 lg:col-span-8 space-y-8">
                {/* 4-Step Cascading Location Selector */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Filter size={14} /> Ubicación en la Estructura
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Cliente</p>
                      <select 
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm outline-none focus:border-amber"
                        value={selClient}
                        onChange={e => {setSelClient(e.target.value); setSelCity(''); setSelSite(''); setSelZone('');}}
                      >
                        <option value="">Seleccionar...</option>
                        {getClients().map((c: HierarchyNode) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Ciudad</p>
                      <select 
                        disabled={!selClient}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm outline-none focus:border-amber disabled:opacity-50"
                        value={selCity}
                        onChange={e => {setSelCity(e.target.value); setSelSite(''); setSelZone('');}}
                      >
                        <option value="">Seleccionar...</option>
                        {getCities(selClient).map((c: HierarchyNode) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Sede / Planta</p>
                      <select 
                        disabled={!selCity}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm outline-none focus:border-amber disabled:opacity-50"
                        value={selSite}
                        onChange={e => {setSelSite(e.target.value); setSelZone('');}}
                      >
                        <option value="">Seleccionar...</option>
                        {getSites(selCity).map((s: HierarchyNode) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Zona / Proceso *</p>
                      <select 
                        disabled={!selSite}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm outline-none ring-2 ring-amber/10 focus:ring-amber/30 disabled:opacity-50"
                        value={selZone}
                        onChange={e => setSelZone(e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {getZones(selSite).map((z: HierarchyNode) => <option key={z.id} value={z.id}>{z.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Technical Specs Grid */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Settings2 size={14} /> Ficha Técnica y Fabricación
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Marca</label>
                      <input 
                        type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-amber outline-none transition-all"
                        placeholder="Siemens, ABB, etc."
                        value={newNode.metadata.brand}
                        onChange={e => setNewNode({...newNode, metadata: {...newNode.metadata, brand: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Modelo / Referencia</label>
                      <input 
                        type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-amber outline-none transition-all"
                        placeholder="KRD-200-XL"
                        value={newNode.metadata.model}
                        onChange={e => setNewNode({...newNode, metadata: {...newNode.metadata, model: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Número de Serie</label>
                      <input 
                        type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-amber outline-none transition-all"
                        placeholder="SN-123456789"
                        value={newNode.metadata.serial}
                        onChange={e => setNewNode({...newNode, metadata: {...newNode.metadata, serial: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Capacidad / Potencia</label>
                      <input 
                        type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-amber outline-none transition-all"
                        placeholder="50 HP / 35 kW / 500 RPM"
                        value={newNode.metadata.capacity}
                        onChange={e => setNewNode({...newNode, metadata: {...newNode.metadata, capacity: e.target.value}})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Año Fab.</label>
                        <input 
                          type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                          placeholder="2024"
                          value={newNode.metadata.mfg_year}
                          onChange={e => setNewNode({...newNode, metadata: {...newNode.metadata, mfg_year: e.target.value}})}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Adquisición</label>
                        <input 
                          type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                          value={newNode.metadata.purchase_date}
                          onChange={e => setNewNode({...newNode, metadata: {...newNode.metadata, purchase_date: e.target.value}})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Fuente de Energía</label>
                      <input 
                        type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                        placeholder="Trifásica / Neumática"
                        value={newNode.metadata.power_source}
                        onChange={e => setNewNode({...newNode, metadata: {...newNode.metadata, power_source: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-4 bg-amber text-slate-900 font-bold rounded-2xl shadow-lg shadow-amber/20 hover:bg-amber-500 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                  >
                    {isEditing ? 'Actualizar Cambios' : '+ Registrar Asset en Sistema'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQRModalOpen && selectedQRAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div id="asset-label-container" className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20">
            {/* Header / Background */}
            <div className="h-32 bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center relative">
              <div className="absolute top-4 right-4 print:hidden">
                 <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-all"
                 >
                   <X size={20} />
                 </button>
              </div>
              <div className="text-white text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Identificador de Activo</p>
                <h4 className="font-bold text-lg">{selectedQRAsset.full_code || '---'}</h4>
              </div>
            </div>

            <div className="p-8 flex flex-col items-center -mt-12 bg-white rounded-b-[40px]">
               <div className="bg-white p-6 rounded-[32px] shadow-2xl border-4 border-white mb-6">
                 <QRCodeCanvas 
                    id="asset-qrcode"
                    value={`https://ingyemel.app/asset/${selectedQRAsset.id}`}
                    size={200}
                    level="H"
                    includeMargin={false}
                 />
               </div>

               <div className="text-center mb-8">
                 <p className="text-slate-800 font-bold text-lg mb-1">{selectedQRAsset.name}</p>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    {selectedQRAsset.metadata?.brand} • {selectedQRAsset.metadata?.model}
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-3 w-full print:hidden">
                 <button 
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                 >
                   <Download size={16} /> Descargar
                 </button>
                 <button 
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 bg-amber text-slate-900 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-amber/20"
                 >
                   <Printer size={16} /> Imprimir
                 </button>
               </div>
               
               <p className="mt-8 text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                 Ingyemel Smart Assets System
               </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-300">
              <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                  <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <FileSpreadsheet size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Carga Masiva de Activos</h3>
                  <p className="text-slate-500 text-sm mb-8">
                     Descarga la plantilla, rellénala con tus activos y súbela aquí. 
                     <br/><span className="text-xs text-amber-600 font-bold mt-2 block">Nota: La ubicación se asignará manualmente después.</span>
                  </p>

                  <button 
                    onClick={handleDownloadTemplate}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 mb-4"
                  >
                     <Download size={16} /> Descargar Plantilla Excel
                  </button>

                  <div className="w-full relative group">
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={loading}
                      />
                      <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 group-hover:bg-black transition-all flex items-center justify-center gap-2">
                         {loading ? (
                             <span className="animate-pulse">Procesando...</span>
                         ) : (
                             <>
                                <UploadCloud size={16} /> Seleccionar Archivo Excel
                             </>
                         )}
                      </button>
                  </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
