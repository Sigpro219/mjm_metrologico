import { supabase } from "@/lib/supabase";
import type { MaintenanceTicket, MaintenancePlan, DowntimeReason } from "@/types/maintenance";

export const maintenanceService = {
  // --- Tickets ---

  async getTickets(filters?: {
    status?: string;
    type?: string;
    machineId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // 1. Fetch tickets with legacy machines join
    let query = supabase
      .from("maintenance_tickets")
      .select(`
        *,
        machine_legacy:machines (name, code, location)
      `)
      .order("scheduled_date", { ascending: true });

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.machineId) query = query.eq("machine_id", filters.machineId);
    if (filters?.startDate)
      query = query.gte("scheduled_date", filters.startDate);
    if (filters?.endDate) query = query.lte("scheduled_date", filters.endDate);

    const { data: ticketsData, error: ticketsError } = await query;
    if (ticketsError) throw ticketsError;

    // 2. Fetch organizational units to join in memory (for new machines)
    const { data: unitsData, error: unitsError } = await supabase
      .from("organizational_units")
      .select("id, name, unit_code")
      .eq("type", "machine");
    
    if (unitsError) {
      console.warn("⚠️ Secondary Lookup Error (organizational_units):", unitsError.message);
    }

    const unitsMap = new Map((unitsData || []).map(u => [u.id, u]));

    // 3. Normalize machine info
    const normalizedTickets = ticketsData.map(ticket => {
      const unit = unitsMap.get(ticket.machine_id);
      
      return {
        ...ticket,
        machine: unit ? {
          name: unit.name,
          code: unit.unit_code,
          location: 'Planta Principal' // Default or derive from hierarchy if needed
        } : ticket.machine_legacy || {
          name: 'Equipo Desconocido',
          code: 'N/A',
          location: 'N/A'
        }
      };
    });

    return normalizedTickets as MaintenanceTicket[];
  },

  async createTicket(ticket: Partial<MaintenanceTicket>) {
    const { data, error } = await supabase
      .from("maintenance_tickets")
      .insert(ticket)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createTickets(tickets: Partial<MaintenanceTicket>[]) {
    const { data, error } = await supabase
      .from("maintenance_tickets")
      .insert(tickets)
      .select();
    if (error) throw error;
    return data;
  },

  async startTicket(id: string, technicianName: string) {
    const { data, error } = await supabase
      .from("maintenance_tickets")
      .update({
        status: "in_progress",
        assigned_to: technicianName,
        started_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTicketStatus(
    id: string,
    status: MaintenanceTicket["status"],
    details?: MaintenanceTicket["execution_details"],
  ) {
    const updates: Partial<MaintenanceTicket> = { status };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }
    if (details) {
      updates.execution_details = details;
    }

    const { data, error } = await supabase
      .from("maintenance_tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Plans ---

  async getPlans() {
    const { data, error } = await supabase
      .from("maintenance_plans")
      .select(
        `
        *,
        machine:machines (name)
      `,
      )
      .eq("is_active", true);
    if (error) throw error;
    return data as MaintenancePlan[];
  },

  async createPlan(plan: Partial<MaintenancePlan>) {
    const { data, error } = await supabase
      .from("maintenance_plans")
      .insert(plan)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Reasons ---
  async getDowntimeReasons() {
    const { data, error } = await supabase
      .from("downtime_reasons")
      .select("*")
      .order("area")
      .order("code");
    if (error) throw error;
    return data as DowntimeReason[];
  },
};
