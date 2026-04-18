import { db } from "@/lib/firebase/config";
import { 
  collection, 
  query as firestoreQuery, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy,
  limit,
  Timestamp,
  doc as firestoreDoc
} from "firebase/firestore";
import type { MaintenanceTicket, MaintenancePlan, DowntimeReason } from "@/types/maintenance";

export const maintenanceService = {
  // --- Tickets ---

  async getTickets(filters?: {
    status?: string;
    type?: string;
    machineId?: string; // Kept as machineId for now in parameters to avoid breaking frontend calls immediately
    startDate?: string;
    endDate?: string;
  }) {
    // 1. Fetch tickets from 'activities' collection
    const ticketsRef = collection(db, "maintenance_tickets"); // Using maintenance_tickets or activities? Let's assume maintenance_tickets exists or I'll create it.
    let q = firestoreQuery(ticketsRef, orderBy("scheduled_date", "asc"));

    if (filters?.status) q = firestoreQuery(q, where("status", "==", filters.status));
    if (filters?.type) q = firestoreQuery(q, where("type", "==", filters.type));
    if (filters?.machineId) q = firestoreQuery(q, where("machine_id", "==", filters.machineId));
    if (filters?.startDate) q = firestoreQuery(q, where("scheduled_date", ">=", filters.startDate));
    if (filters?.endDate) q = firestoreQuery(q, where("scheduled_date", "<=", filters.endDate));

    const querySnapshot = await getDocs(q);
    const ticketsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

    // 2. Fetch hierarchy to join in memory (for instruments)
    const hierarchyRef = collection(db, "hierarchy");
    const hQuery = firestoreQuery(hierarchyRef, where("type", "==", "instrument"));
    const hSnapshot = await getDocs(hQuery);
    
    const unitsMap = new Map();
    hSnapshot.forEach(doc => {
      const data = doc.data();
      unitsMap.set(doc.id, { id: doc.id, name: data.name, unit_code: data.unit_code });
    });

    // 3. Normalize instrument info
    const normalizedTickets = ticketsData.map(ticket => {
      const unit = unitsMap.get(ticket.machine_id);
      
      return {
        ...ticket,
        machine: unit ? {
          name: unit.name,
          code: unit.unit_code,
          location: 'Planta Principal' 
        } : {
          name: 'Instrumento Desconocido',
          code: 'N/A',
          location: 'N/A'
        }
      };
    });

    return normalizedTickets as MaintenanceTicket[];
  },

  async createTicket(ticket: Partial<MaintenanceTicket>) {
    const docRef = await addDoc(collection(db, "maintenance_tickets"), {
      ...ticket,
      created_at: new Date().toISOString(),
      tenantId: 'mjm'
    });
    return { id: docRef.id, ...ticket };
  },

  async createTickets(tickets: Partial<MaintenanceTicket>[]) {
    const results = [];
    for (const ticket of tickets) {
      const docRef = await addDoc(collection(db, "maintenance_tickets"), {
        ...ticket,
        created_at: new Date().toISOString(),
        tenantId: 'mjm'
      });
      results.push({ id: docRef.id, ...ticket });
    }
    return results;
  },

  async startTicket(id: string, technicianName: string) {
    const docRef = doc(db, "maintenance_tickets", id);
    const updates = {
      status: "in_progress",
      assigned_to: technicianName,
      started_at: new Date().toISOString(),
    };
    await updateDoc(docRef, updates);
    return { id, ...updates };
  },

  async updateTicketStatus(
    id: string,
    status: MaintenanceTicket["status"],
    details?: MaintenanceTicket["execution_details"],
  ) {
    const docRef = doc(db, "maintenance_tickets", id);
    const updates: any = { status };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }
    if (details) {
      updates.execution_details = details;
    }

    await updateDoc(docRef, updates);
    return { id, ...updates };
  },

  // --- Plans ---

  async getPlans() {
    const plansRef = collection(db, "maintenance_plans");
    const q = firestoreQuery(plansRef, where("is_active", "==", true));
    const querySnapshot = await getDocs(q);
    
    // Join with instruments in memory for labels
    const hierarchyRef = collection(db, "hierarchy");
    const hSnapshot = await getDocs(firestoreQuery(hierarchyRef, where("type", "==", "instrument")));
    const hMap = new Map();
    hSnapshot.forEach(d => hMap.set(d.id, d.data().name));

    return querySnapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        machine: {
          name: hMap.get(data.machine_id) || 'Instrumento'
        }
      };
    }) as MaintenancePlan[];
  },

  async createPlan(plan: Partial<MaintenancePlan>) {
    const docRef = await addDoc(collection(db, "maintenance_plans"), {
      ...plan,
      created_at: new Date().toISOString(),
      tenantId: 'mjm',
      is_active: true
    });
    return { id: docRef.id, ...plan };
  },

  // --- Reasons ---
  async getDowntimeReasons() {
    const reasonsRef = collection(db, "downtime_reasons");
    const q = firestoreQuery(reasonsRef, orderBy("area"), orderBy("code"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as DowntimeReason[];
  },
};

