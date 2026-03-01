import type { LeadStatus } from '@/lib/firebase-types';

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NUEVO: { bg: 'bg-primary/15', text: 'text-primary' },
  CONTACTADO: { bg: 'bg-gold/15', text: 'text-gold' },
  APROBADO: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  ONBOARDED: { bg: 'bg-primary/15', text: 'text-primary' },
  RECHAZADO: { bg: 'bg-red-500/15', text: 'text-red-400' },
  DESCARTADO: { bg: 'bg-muted', text: 'text-muted-foreground' },
  CERRADO: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

export const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'NUEVO', label: 'Nuevo', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: 'CONTACTADO', label: 'Contactado', color: 'bg-gold/20 text-gold border-gold/30' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'ONBOARDED', label: 'Onboarded', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'DESCARTADO', label: 'Descartado', color: 'bg-muted text-muted-foreground' },
];

export const getStatusConfig = (status: LeadStatus) =>
  STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

export const timeAgo = (date: Date): string => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return `hace ${Math.floor(diff / 604800)}sem`;
};

export const STATUS_BAR_COLORS: Record<string, string> = {
  NUEVO: 'hsl(var(--primary))',
  CONTACTADO: 'hsl(var(--gold))',
  APROBADO: 'hsl(210 100% 60%)',
  ONBOARDED: 'hsl(var(--primary))',
  RECHAZADO: 'hsl(0 70% 55%)',
  DESCARTADO: 'hsl(var(--muted-foreground))',
};
