// Firebase/Firestore data models

export type UserRole = 'ADMIN' | 'LINE_LEADER' | 'AGENT';

export interface PublicContact {
  whatsapp?: string;
  telegram?: string;
  contactLabel?: string;
}

export interface FirebaseUser {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  country: string;
  city?: string | null;
  isActive: boolean;
  lineLeaderId: string | null;
  canRecruitSubagents: boolean;
  refCode: string | null;
  referralUrl: string | null;
  whatsapp: string | null;
  publicContact?: PublicContact;
  needsPasswordReset?: boolean;
  createdAt: Date;
}

// Configurable referral links per agent
export interface ReferralLink {
  id: string;
  agentUid: string;
  name: string; // e.g., "Instagram CL", "TikTok AR"
  country?: string | null;
  whatsappOverride?: string | null;
  contactLabelOverride?: string | null;
  messageTemplate?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Tutorials CMS
export type TutorialOwnerType = 'AGENT' | 'GLOBAL';

export interface Tutorial {
  id: string;
  ownerType: TutorialOwnerType;
  ownerUid?: string | null;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  videoUrl?: string | null;
  countryTags?: string[];
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Lead statuses - production workflow
export type LeadStatus = 'NUEVO' | 'CONTACTADO' | 'APROBADO' | 'RECHAZADO' | 'ONBOARDED' | 'CERRADO' | 'DESCARTADO';
export type LeadTier = 'NOVATO' | 'POTENCIAL' | 'PROMETEDOR';
export type LeadIntent = 'AGENTE'; // Only agent recruitment now

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
  campaignId?: string | null; // Optional campaign link id
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

// Public agent info for landing page (returned by agent-by-ref endpoint)
export interface PublicAgentInfo {
  displayName: string;
  contactLabel: string;
  whatsapp: string;
  messageTemplate?: string;
  tutorials: PublicTutorial[];
}

export interface PublicTutorial {
  id: string;
  title: string;
  summary: string;
  videoUrl?: string | null;
  order: number;
}

// Helper to convert Supabase lead status to Firebase
export const mapLeadStatus = (status: string | null): LeadStatus => {
  const mapping: Record<string, LeadStatus> = {
    'nuevo': 'NUEVO',
    'contactado': 'CONTACTADO',
    'aprobado': 'APROBADO',
    'rechazado': 'RECHAZADO',
    'onboarded': 'ONBOARDED',
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
    'APROBADO': 'aprobado',
    'RECHAZADO': 'rechazado',
    'ONBOARDED': 'onboarded',
    'CERRADO': 'cerrado',
    'DESCARTADO': 'descartado',
  };
  return mapping[status];
};
