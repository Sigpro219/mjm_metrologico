'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/components/providers/TenantProvider';
import { OrganizationService } from '@/services/organizations';
import Image from 'next/image';
import { 
  Globe, 
  Building2, 
  MapPin, 
  Landmark, 
  Layers, 
  Monitor,
  PlusCircle,
  Edit,
  Trash2,
  ChevronDown,
  Settings,
  Maximize2,
  Minimize2,
  Palette,
  Upload,
  Save,
} from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: string;
  unit_code?: string;
  full_code?: string;
  parent_id: string | null;
  organization_id?: string;
  children: Node[];
}

const HIERARCHY_LEVELS = [
  { type: 'country', label: 'País', icon: <Globe size={20} />, color: 'text-blue-500', bg: 'bg-blue-50', isNumeric: false, maxLength: 3 },
  { type: 'client',  label: 'Cliente', icon: <Building2 size={20} />, color: 'text-orange-500', bg: 'bg-orange-50', isNumeric: false, maxLength: 3 },
  { type: 'city',    label: 'Ciudad', icon: <MapPin size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-50', isNumeric: false, maxLength: 3 },
  { type: 'cell',    label: 'Sede', icon: <Landmark size={20} />, color: 'text-purple-500', bg: 'bg-purple-50', isNumeric: true, maxLength: 2 },
  { type: 'process', label: 'Zona', icon: <Layers size={20} />, color: 'text-amber-500', bg: 'bg-amber-50', isNumeric: true, maxLength: 2 },
  { type: 'machine', label: 'Equipo', icon: <Monitor size={20} />, color: 'text-indigo-500', bg: 'bg-indigo-50', isNumeric: true, maxLength: 2 }
];

function buildTree(flatNodes: (Omit<Node, 'children'> & { children?: Node[] })[]): Node[] {
  const map: Record<string, Node> = {};
  const roots: Node[] = [];
  
  flatNodes.forEach(node => { 
    map[node.id] = { ...node, children: [] } as Node; 
  });

  flatNodes.forEach(node => {
    if (node.parent_id && map[node.parent_id]) {
      map[node.parent_id].children.push(map[node.id]);
    } else {
      roots.push(map[node.id]);
    }
  });

  const assignCodes = (nodes: Node[], parentCode: string = '') => {
    nodes.forEach(node => {
      if (node.type === 'country') {
        node.full_code = '';
        if (node.children.length > 0) {
          assignCodes(node.children, '');
        }
      } else {
        const currentCode = node.unit_code || '??';
        const separator = parentCode ? '-' : '';
        node.full_code = `${parentCode}${separator}${currentCode}`;
        if (node.children.length > 0) {
          assignCodes(node.children, node.full_code);
        }
      }
    });
  };

  assignCodes(roots);
  return roots;
}

export default function ConfigPage() {
  const { organization, primaryColor: currentPrimary, secondaryColor: currentSecondary, accentColor: currentAccent, brandName: currentName, nit: currentNit, logoUrl: currentLogo } = useTenant();
  const [activeTab, setActiveTab] = useState<'identity' | 'hierarchy'>('identity');
  
  // Organization State
  const [orgName, setOrgName] = useState(currentName);
  const [orgNit, setOrgNit] = useState(currentNit || '');
  const [primaryColor, setPrimaryColor] = useState(currentPrimary);
  const [secondaryColor, setSecondaryColor] = useState(currentSecondary);
  const [accentColor, setAccentColor] = useState(currentAccent);
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hierarchy State
  const [hierarchy, setHierarchy] = useState<Node[]>([]);
  const [flatData, setFlatData] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [visibleLevels, setVisibleLevels] = useState<string[]>(HIERARCHY_LEVELS.map(l => l.type));

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCode, setNewNodeCode] = useState('');
  const [deleteStep, setDeleteStep] = useState(1);

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setOrgNit(organization.nit || '');
      setPrimaryColor(organization.primary_color || '#f97316');
      setSecondaryColor(organization.secondary_color || '#1e3a8a');
      setAccentColor(organization.accent_color || '#f59e0b');
      setLogoPreview(organization.logo_url);
    }
  }, [organization]);

  const loadHierarchy = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizational_units')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading hierarchy:', error);
    } else if (data) {
      const typedData: (Omit<Node, 'children'> & { children?: Node[] })[] = data;
      setFlatData(typedData as Node[]); 
      setHierarchy(buildTree(typedData));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'hierarchy') {
      loadHierarchy();
    }
  }, [activeTab, loadHierarchy]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && organization) {
      try {
        const url = await OrganizationService.uploadLogo(organization.id, file);
        setLogoPreview(url);
        alert('Logo actualizado correctamente. Guarde los cambios para finalizar.');
      } catch (err: unknown) {
        console.error(err);
        alert('Error al subir el logo');
      }
    }
  };

  const saveOrgSettings = async () => {
    if (!organization) return;
    setIsSavingOrg(true);
    try {
      await OrganizationService.update(organization.id, {
        name: orgName,
        nit: orgNit,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        logo_url: logoPreview
      });
      // Force TenantProvider to refresh to reflect changes globally immediately
      window.location.reload(); 
    } catch (err: unknown) {
      console.error(err);
      alert('Error al guardar la configuración');
    } finally {
      setIsSavingOrg(false);
    }
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => 
      prev.includes(id) ? prev.filter(nodeId => nodeId !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedNodes(flatData.map(node => node.id));
  };

  const collapseAll = () => {
    setExpandedNodes([]);
  };

  const toggleLevelVisibility = (type: string) => {
    setVisibleLevels(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const openAddModal = (node: Node) => {
    setSelectedNode(node);
    setNewNodeName('');
    setNewNodeCode('');
    setModalType('add');
    setIsModalOpen(true);
  };

  const openEditModal = (node: Node) => {
    setSelectedNode(node);
    setNewNodeName(node.name);
    setNewNodeCode(node.unit_code || '');
    setModalType('edit');
    setIsModalOpen(true);
  };

  const openDeleteModal = (node: Node) => {
    if (node.children && node.children.length > 0) {
      alert('No se puede eliminar un nivel que tiene dependientes activos.');
      return;
    }
    setSelectedNode(node);
    setDeleteStep(1);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedNode || !newNodeName.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    if (!newNodeCode.trim()) {
      alert("El código es obligatorio.");
      return;
    }

    let targetType = selectedNode.type;
    if (modalType === 'add') {
       const parentTypeIndex = HIERARCHY_LEVELS.findIndex(l => l.type === selectedNode.type);
       const newType = HIERARCHY_LEVELS[parentTypeIndex + 1]?.type;
       if (!newType) return;
       targetType = newType;
    }

    const levelInfo = HIERARCHY_LEVELS.find(l => l.type === targetType);
    if (!levelInfo) return;

    let formattedCode = newNodeCode.trim().toUpperCase();
    
    if (levelInfo.isNumeric) {
      if (!/^\d+$/.test(formattedCode)) {
        alert(`El código para ${levelInfo.label} debe ser numérico.`);
        return;
      }
      formattedCode = formattedCode.padStart(levelInfo.maxLength || 2, '0');
    } else {
      if (!/^[A-Z0-9]+$/.test(formattedCode)) {
        alert(`El código para ${levelInfo.label} debe ser alfanumérico.`);
        return;
      }
    }

    if (levelInfo.maxLength && formattedCode.length > levelInfo.maxLength) {
      alert(`El código no puede exceder ${levelInfo.maxLength} caracteres.`);
      return;
    }

    try {
      if (modalType === 'add') {
        const { error } = await supabase
          .from('organizational_units')
          .insert([{ 
            name: newNodeName.trim(), 
            type: targetType,
            unit_code: formattedCode,
            parent_id: selectedNode.id,
            organization_id: organization?.id || selectedNode.organization_id
          }]);

        if (error) {
          alert(`Error de base de datos: ${error.message}`);
        } else {
          await loadHierarchy();
          setIsModalOpen(false);
          setNewNodeName('');
          setNewNodeCode('');
        }
      } else if (modalType === 'edit') {
        const { error } = await supabase
          .from('organizational_units')
          .update({ 
            name: newNodeName.trim(),
            unit_code: formattedCode
          })
          .eq('id', selectedNode.id);

        if (error) {
          alert(`Error al actualizar: ${error.message}`);
        } else {
          await loadHierarchy();
          setIsModalOpen(false);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error inesperado: ${message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedNode) return;
    
    const { error } = await supabase
      .from('organizational_units')
      .delete()
      .eq('id', selectedNode.id);

    if (error) console.error('Error deleting node:', error);
    else loadHierarchy();
    
    setIsModalOpen(false);
    setDeleteStep(1); 
  };

  const renderTree = (nodes: Node[], depth: number = 0) => {
    return nodes
      .filter(node => visibleLevels.includes(node.type))
      .map(node => {
        const isExpanded = expandedNodes.includes(node.id);
        const visibleChildren = node.children.filter(child => visibleLevels.includes(child.type));
        const hasChildren = visibleChildren.length > 0;
        const levelInfo = HIERARCHY_LEVELS.find(l => l.type === node.type) || HIERARCHY_LEVELS[depth];
        
        const canAddChild = node.type !== 'machine';

        return (
          <div key={node.id} className="mb-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between group hover:shadow-lg hover:border-amber/30 transition-all duration-200 shadow-sm">
              <div 
                onClick={() => toggleNode(node.id)} 
                className="flex items-center gap-4 flex-1 cursor-pointer"
              >
                <div className={`h-12 w-12 ${levelInfo.bg} ${levelInfo.color} rounded-xl flex items-center justify-center shadow-sm`}>
                  {levelInfo.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <div className="font-bold text-slate-800 text-base leading-tight">{node.name}</div>
                     {node.full_code && (
                       <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                         {node.full_code}
                       </span>
                     )}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{levelInfo.label}</div>
                </div>
                {hasChildren && (
                  <ChevronDown 
                    className={`text-slate-300 ml-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(node)}
                  title="Editar" 
                  className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors"
                >
                  <Edit size={18} />
                </button>
                {canAddChild && (
                  <button 
                    onClick={() => openAddModal(node)}
                    title="Agregar sub-nivel" 
                    className="p-2 hover:bg-amber/10 text-amber rounded-xl transition-colors"
                  >
                    <PlusCircle size={18} />
                  </button>
                )}
                <button 
                  onClick={() => openDeleteModal(node)}
                  title="Eliminar" 
                  className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {isExpanded && hasChildren && (
              <div className="pl-16 mt-4 border-l-2 border-slate-100 space-y-4 ml-6 animate-in fade-in slide-in-from-left-2 duration-300">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
         <button 
           onClick={() => setActiveTab('identity')}
           className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'identity' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
         >
           <Palette size={16} /> Identidad Corporativa
         </button>
         <button 
           onClick={() => setActiveTab('hierarchy')}
           className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'hierarchy' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
         >
           <Layers size={16} /> Estructura Organizacional
         </button>
      </div>

      {activeTab === 'identity' ? (
        <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="col-span-8 flex flex-col gap-8">
             {/* General Info */}
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Building2 className="text-[color:var(--color-primary)]" size={20} /> Información General
                </h3>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                      <input 
                        type="text" 
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber/50 outline-none font-bold text-slate-700"
                        placeholder="Nombre de la empresa"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIT / ID Tributario</label>
                      <input 
                        type="text" 
                        value={orgNit}
                        onChange={(e) => setOrgNit(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber/50 outline-none font-bold text-slate-700 font-mono"
                        placeholder="000.000.000-0"
                      />
                   </div>
                </div>
             </div>

             {/* Visual Brand */}
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <Palette className="text-[color:var(--color-primary)]" size={20} /> Identidad Visual
                </h3>
                
                <div className="grid grid-cols-12 gap-10">
                   {/* Logo Upload */}
                   <div className="col-span-4 flex flex-col items-center">
                      <div className="relative group w-full aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-4">
                         {logoPreview ? (
                           <Image src={logoPreview} alt="Logo" width={180} height={60} className="object-contain max-h-16" />
                         ) : (
                           <Building2 size={32} className="text-slate-300" />
                         )}
                         <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="text-white" size={24} />
                         </div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logo Institucional</span>
                   </div>

                   {/* Color Settings */}
                   <div className="col-span-8 grid grid-cols-3 gap-4">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primario</label>
                            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{primaryColor}</span>
                         </div>
                         <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 overflow-hidden shrink-0"
                            />
                            <div className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center text-[9px] font-bold text-slate-500 italic leading-tight">
                               Acciones
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secundario</label>
                            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{secondaryColor}</span>
                         </div>
                         <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 overflow-hidden shrink-0"
                            />
                            <div className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center text-[9px] font-bold text-slate-500 italic leading-tight">
                               Fondos
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acento</label>
                            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{accentColor}</span>
                         </div>
                         <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 overflow-hidden shrink-0"
                            />
                            <div className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center text-[9px] font-bold text-slate-500 italic leading-tight">
                               Detalles
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="col-span-4 space-y-6 self-start sticky top-8">
             <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all duration-300">
                <div className="flex flex-col items-center gap-2 mb-8 pb-6 border-b border-slate-100 text-center">
                   <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <Monitor size={20} className="text-[color:var(--color-primary)]" />
                   </div>
                   <h4 className="font-bold text-xs text-slate-800 uppercase tracking-widest">Vista Previa</h4>
                   <p className="text-[10px] text-slate-400 font-medium">Así lucirá tu interfaz</p>
                </div>

                {/* Interface Mockup */}
                <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-inner flex mb-8">
                   {/* Mock Sidebar */}
                   <div className="w-20 shrink-0 p-3 space-y-4" style={{ backgroundColor: secondaryColor || '#0B1437' }}>
                      <div className="bg-white/10 rounded-lg p-1.5 flex justify-center border border-white/5">
                        {logoPreview ? <Image src={logoPreview} alt="Logo" width={32} height={16} className="object-contain h-4" /> : <Building2 className="text-white" size={14} />}
                      </div>
                      <div className="space-y-2">
                         <div className="h-2 w-full bg-white/20 rounded-full" />
                         <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                         <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                      </div>
                   </div>
                   {/* Mock Content */}
                   <div className="flex-1 bg-slate-50 p-4 space-y-4 border-l border-slate-200">
                      <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
                      <div className="space-y-2">
                         <button className="w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                            Acción Principal
                         </button>
                         <button className="w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-700 bg-white border border-slate-200" style={{ borderColor: primaryColor, color: primaryColor }}>
                            Acción Secundaria
                         </button>
                      </div>
                      <div className="pt-2">
                        <div className="flex gap-1 mb-1 items-center">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
                          <div className="h-1.5 w-1/3 bg-slate-200 rounded-full" />
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                           <div className="h-full w-2/3" style={{ backgroundColor: primaryColor }} />
                        </div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={saveOrgSettings}
                  disabled={isSavingOrg}
                  className="w-full text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSavingOrg ? <Settings className="animate-spin" size={18} /> : <Save size={18} />}
                  Guardar Cambios
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 min-h-full">
          {/* Control Panel (Left) */}
          <div className="col-span-4 self-start sticky top-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] rounded-xl flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Arbol Hierárquico</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Control de Navegación</p>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-amber/5 rounded-2xl border border-amber/10">
                    <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                       <strong>Tip:</strong> El sistema utiliza una arquitectura de árbol. El filtrado de niveles es visual y no afecta la integridad de los datos.
                    </p>
                 </div>
                 
                 <div className="py-6 border-y border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Visibilidad de Niveles</span>
                    <div className="space-y-3">
                       {HIERARCHY_LEVELS.map(level => {
                         const isVisible = visibleLevels.includes(level.type);
                         return (
                           <div key={level.type} className="flex items-center justify-between p-1 group">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${level.bg} ${level.color} flex items-center justify-center transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-40 scale-90 grayscale'}`}>
                                   {level.icon}
                                </div>
                                <span className={`text-[11px] font-bold transition-colors ${isVisible ? 'text-slate-600' : 'text-slate-300'}`}>{level.label}</span>
                              </div>
                              
                              <button 
                                onClick={() => toggleLevelVisibility(level.type)}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isVisible ? 'bg-amber/80 hover:bg-amber' : 'bg-slate-200 hover:bg-slate-300'}`}
                              >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                              </button>
                           </div>
                         );
                       })}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Tree Visualization (Right) */}
          <div className="col-span-8">
            <div className="flex justify-end mb-4 gap-2">
                <button 
                  onClick={expandAll}
                  className="px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md"
                >
                  <Maximize2 size={14} /> Expandir Todo
                </button>
                <button 
                  onClick={collapseAll}
                  className="px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md"
                >
                  <Minimize2 size={14} /> Contraer Todo
                </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <Settings className="animate-spin mb-4" size={40} />
                <p className="font-technical text-xs uppercase tracking-widest">Sincronizando Estructura...</p>
              </div>
            ) : (
              <div className="pb-20 space-y-4">
                {renderTree(hierarchy)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setIsModalOpen(false); setDeleteStep(1); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <Trash2 className="rotate-45" size={20} />
            </button>

            {modalType === 'delete' ? (
               <div className="text-center">
                 <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={32} />
                 </div>
                 
                 {deleteStep === 1 ? (
                   <>
                     <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar {selectedNode?.name}?</h3>
                     <p className="text-sm text-slate-500 mb-8">
                       Esta acción eliminará este nodo. ¿Estás seguro de que quieres continuar?
                     </p>
                     <button 
                        onClick={() => setDeleteStep(2)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-200"
                     >
                        Continuar
                     </button>
                   </>
                 ) : (
                   <>
                     <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmación Final</h3>
                     <p className="text-sm text-slate-500 mb-8">
                       Esta acción es irreversible. Por favor confirma una vez más para eliminar permanentemente.
                     </p>
                     <button 
                        onClick={handleDelete}
                        className="w-full bg-slate-800 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                     >
                        Confirmar Eliminación
                     </button>
                   </>
                 )}
               </div>
            ) : (
               <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    {modalType === 'add' ? <PlusCircle className="text-amber" /> : <Edit className="text-blue-500" />}
                    {modalType === 'add' ? 'Agregar Nuevo Nivel' : 'Editar Nombre'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre</label>
                      <input 
                        type="text" 
                        value={newNodeName}
                        onChange={(e) => setNewNodeName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber/50 font-medium text-slate-800"
                        placeholder="Ej. Sede Norte, Zona de Empaque..."
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Código / Sigla</label>
                      <input 
                        type="text" 
                        value={newNodeCode}
                        onChange={(e) => setNewNodeCode(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber/50 font-medium text-slate-800 font-mono tracking-wider uppercase"
                        placeholder="Ej. BOG, 01, 05"
                        maxLength={3}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        * Alfanumérico para Clientes/Ciudades (3 letras). Numérico para los demás (2 dígitos).
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleSave}
                      className="w-full bg-amber text-slate-900 font-bold py-3 rounded-xl hover:bg-amber/90 transition-all shadow-lg shadow-amber/20 mt-4"
                    >
                      Guardar Cambios
                    </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
