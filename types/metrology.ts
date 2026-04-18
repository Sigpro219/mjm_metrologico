import { Timestamp } from 'firebase/firestore';

export type InstrumentStatus = 'Operativo' | 'Mantenimiento' | 'Archivado' | 'Fuera de Servicio' | 'En Calibración';
export type Criticality = 'A' | 'B' | 'C';

export interface MetrologyMetadata {
  brand: string;
  model: string;
  serial: string;
  capacity?: string;
  powerSource?: string;
  status: InstrumentStatus;
  criticality: Criticality;
  mfgYear?: string;
  purchaseDate?: string;
  imageUrl?: string;
  
  // ISO 10012 Specifics
  calibrationInterval?: number; // In days
  lastCalibrationDate?: string | Timestamp;
  nextCalibrationDate?: string | Timestamp;
  accuracyClass?: string;
  resolution?: string;
  measurementRange?: string;
}

export interface InstrumentAsset {
  id: string;
  name: string;
  type: 'instrument';
  unitCode: string;
  parentId: string;
  tenantId: string;
  metadata: MetrologyMetadata;
  createdAt: Timestamp;
}

export interface CalibrationEvent {
  id: string;
  instrumentId: string;
  date: Timestamp;
  technician: string;
  provider: string; // Internal or External Lab
  certificateNumber?: string;
  result: 'Pass' | 'Fail' | 'Adjusted';
  notes?: string;
  attachments?: string[]; // URLs to certificates/photos
}

export interface TelemetryReading {
  instrumentId: string;
  timestamp: Timestamp;
  value: number;
  unit: string;
}
