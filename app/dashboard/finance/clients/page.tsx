"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2, Pencil, Trash2, Phone, Mail, MapPin, User } from "lucide-react";
import { ClientService, Client } from "@/services/clients";
import { ClientForm } from "@/components/finance/ClientForm";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await ClientService.getAll();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este cliente?")) {
      try {
        await ClientService.delete(id);
        fetchClients();
      } catch (error) {
        alert("Error al eliminar el cliente");
      }
    }
  };

  const handleSubmit = async (data: Omit<Client, "id" | "created_at">) => {
    try {
      setIsSubmitting(true);
      if (editingClient) {
        await ClientService.update(editingClient.id, data);
      } else {
        await ClientService.create(data);
      }
      await fetchClients();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar el cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.nit && client.nit.includes(searchTerm)) ||
    (client.legal_representative && client.legal_representative.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-amber-500" />
            Gestión de Clientes
          </h1>
          <p className="text-slate-500 mt-1">Administre su base de datos de clientes y contactos.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-5 h-5 text-amber-500" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, NIT o representante..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="text-sm text-slate-500">
          Total: <span className="font-bold text-slate-900">{filteredClients.length}</span> clientes
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeletons
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-48 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <div key={client.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
              
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(client)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(client.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={client.name}>{client.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded">
                  NIT: {client.nit || "N/A"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {client.legal_representative && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{client.legal_representative}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                 {client.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-2 text-xs">{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Building2 className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No se encontraron clientes.</p>
            <button onClick={handleCreate} className="mt-2 text-amber-600 hover:text-amber-700 font-bold text-sm">
              Crear el primero
            </button>
          </div>
        )}
      </div>

      <ClientForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingClient}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
