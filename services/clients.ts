import { supabase } from "@/lib/supabase";

export interface Client {
  id: string;
  created_at: string;
  name: string;
  nit: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  legal_representative: string | null;
  status?: 'active' | 'prospect';
}

export const ClientService = {
  // Client Management Service - Trigger Sync
  // Create a new client
  async create(client: Omit<Client, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("clients")
      .insert(client)
      .select()
      .single();

    if (error) {
      console.error("Error creating client:", error);
      throw error;
    }

    return data as Client;
  },

  // Fetch all clients
  async getAll() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }

    return data as Client[];
  },

  // Update an existing client
  async update(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating client:", error);
      throw error;
    }

    return data as Client;
  },

  // Search clients by name or NIT
  async search(query: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .or(`name.ilike.%${query}%,nit.ilike.%${query}%`)
      .limit(5);

    if (error) {
      console.error("Error searching clients:", error);
      return [];
    }

    return data as Client[];
  },

  // Delete a client
  async delete(id: string) {
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting client:", error);
      throw error;
    }

    return true;
  }
};
