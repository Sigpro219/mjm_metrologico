export type MachineStatus = "idle" | "running" | "maintenance" | "offline";

export interface Machine {
  id: string;
  created_at: string;
  name: string;
  code: string;
  type: string;
  status: MachineStatus;
  location?: string;
}
