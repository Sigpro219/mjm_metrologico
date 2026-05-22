export type MaintenanceTicket = {
  id: string;
  ticket_number?: number;
  created_at: string;
  organization_id?: string;
  machine_id: string;
  plan_id?: string;
  title: string;
  description?: string;
  type: "preventive" | "corrective";
  status: "scheduled" | "open" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  production_resumed_at?: string;
  reported_by?: string;
  assigned_to?: string;
  execution_details?: {
    work_description?: string;
    notes?: string;
    spare_parts?: Array<{ name: string; quantity: number }>;
    received_by?: string;
  };
  machine?: {
    name: string;
    code: string;
    location: string;
  };
  is_last_of_5_years?: boolean;
};

export type MaintenancePlan = {
  id: string;
  created_at: string;
  machine_id: string;
  title: string;
  description?: string;
  frequency_days: number;
  next_due_date: string;
  is_active: boolean;
  machine?: {
    name: string;
  };
};

export type DowntimeReason = {
    id: string;
    code: string;
    description: string;
    area: string;
    category: string;
    is_planned: boolean;
}
