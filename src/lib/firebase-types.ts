// Firebase/Firestore data models

export type UserRole = 'ADMIN' | 'LINE_LEADER' | 'AGENT';

export interface FirebaseUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  isActive: boolean;
  lineLeaderId: string | null;
  canRecruitSubagents: boolean;
  refCode: string | null;
  referralUrl: string | null;
  whatsapp: string | null;
  city: string | null;
  needsPasswordReset?: boolean;
  createdAt: Date;
}

export type LeadStatus = 'NUEVO' | 'CONTACTADO' | 'ASIGNADO' | 'CERRADO' | 'DESCARTADO';
export type LeadTier = 'NOVATO' | 'POTENCIAL' | 'APROBABLE';
export type LeadIntent = 'JUGADOR' | 'AGENTE' | 'SOPORTE';

export interface LeadContact {
  whatsapp?: string;
  email?: string;
  telegram?: string;
}

export interface FirebaseLead {
  id?: string;
  createdAt: Date;
  intent: LeadIntent | null;
  country: string;
  city?: string | null;
  refCode: string | null;
  assignedAgentId: string | null;
  assignedLineLeaderId: string | null;
  status: LeadStatus;
  scoreTotal: number;
  tier: LeadTier | null;
  contact: LeadContact;
  rawJson: Record<string, unknown>;
  name: string;
  origen: string;
}

export interface RefCodeDoc {
  agentUid: string;
  lineLeaderId: string | null;
  active: boolean;
  createdAt: Date;
}

// Helper to convert Supabase lead status to Firebase
export const mapLeadStatus = (status: string | null): LeadStatus => {
  const mapping: Record<string, LeadStatus> = {
    'nuevo': 'NUEVO',
    'contactado': 'CONTACTADO',
    'asignado': 'ASIGNADO',
    'cerrado': 'CERRADO',
    'descartado': 'DESCARTADO',
  };
  return mapping[status || 'nuevo'] || 'NUEVO';
};

// Helper to convert Firebase lead status to display
export const displayLeadStatus = (status: LeadStatus): string => {
  const mapping: Record<LeadStatus, string> = {
    'NUEVO': 'nuevo',
    'CONTACTADO': 'contactado',
    'ASIGNADO': 'asignado',
    'CERRADO': 'cerrado',
    'DESCARTADO': 'descartado',
  };
  return mapping[status];
};
