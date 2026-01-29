import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc,
  updateDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirebaseLead, LeadStatus } from '@/lib/firebase-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Fetch leads based on user role - WITHOUT orderBy to avoid composite index requirements
export const useFirebaseLeads = (options: {
  agentId?: string | null;
  lineLeaderId?: string | null;
  isAdmin?: boolean;
}) => {
  const { agentId, lineLeaderId, isAdmin } = options;

  return useQuery({
    queryKey: ['firebase-leads', agentId, lineLeaderId, isAdmin],
    queryFn: async (): Promise<FirebaseLead[]> => {
      try {
        const leadsRef = collection(db, 'leads');
        let q;

        if (isAdmin) {
          // Admin sees all leads - no filter, just limit
          q = query(leadsRef, limit(500));
        } else if (lineLeaderId) {
          // Line leader sees leads assigned to their network - NO orderBy
          q = query(
            leadsRef,
            where('assignedLineLeaderId', '==', lineLeaderId),
            limit(500)
          );
        } else if (agentId) {
          // Agent sees only their assigned leads - NO orderBy
          q = query(
            leadsRef,
            where('assignedAgentId', '==', agentId),
            limit(500)
          );
        } else {
          return [];
        }

        const snapshot = await getDocs(q);
        const leads = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            name: data.name as string || '',
            country: data.country as string || '',
            city: data.city as string | null || null,
            contact: data.contact as FirebaseLead['contact'] || {},
            intent: data.intent as FirebaseLead['intent'] || null,
            refCode: data.refCode as string | null || null,
            assignedAgentId: data.assignedAgentId as string | null || null,
            assignedLineLeaderId: data.assignedLineLeaderId as string | null || null,
            status: data.status as LeadStatus || 'NUEVO',
            scoreTotal: data.scoreTotal as number || 0,
            tier: data.tier as FirebaseLead['tier'] || null,
            rawJson: data.rawJson as Record<string, unknown> || {},
            origen: data.origen as string || '',
            createdAt: (data.createdAt as { toDate: () => Date })?.toDate?.() || new Date(),
          } as FirebaseLead;
        });

        // Sort client-side by createdAt descending
        leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return leads;
      } catch (error) {
        console.error('[useFirebaseLeads] Query error:', error);
        toast.error('Error al cargar leads: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        return [];
      }
    },
    enabled: isAdmin || !!agentId || !!lineLeaderId,
  });
};

// Get lead count for agents
export const useFirebaseLeadCounts = () => {
  return useQuery({
    queryKey: ['firebase-lead-counts'],
    queryFn: async (): Promise<Record<string, number>> => {
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, where('assignedAgentId', '!=', null));
      const snapshot = await getDocs(q);

      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const agentId = doc.data().assignedAgentId;
        if (agentId) {
          counts[agentId] = (counts[agentId] || 0) + 1;
        }
      });

      return counts;
    },
  });
};

// Add lead directly to Firestore
export const useAddFirebaseLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: Omit<FirebaseLead, 'id' | 'createdAt'>) => {
      const leadsRef = collection(db, 'leads');
      const docRef = await addDoc(leadsRef, {
        ...lead,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase-leads'] });
      queryClient.invalidateQueries({ queryKey: ['firebase-lead-counts'] });
    },
  });
};

// Update lead status
export const useUpdateFirebaseLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FirebaseLead> }) => {
      const leadRef = doc(db, 'leads', id);
      await updateDoc(leadRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase-leads'] });
    },
  });
};

// Assign lead via Edge Function
export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      leadId: string;
      refCode?: string;
      country?: string;
    }) => {
      const { data: response, error } = await supabase.functions.invoke('assign-lead', {
        body: data,
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase-leads'] });
    },
  });
};

// Save lead from chat (combines creation and assignment)
export const useSaveChatLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      country: string;
      contact: { whatsapp?: string; email?: string; telegram?: string };
      intent: 'JUGADOR' | 'AGENTE' | 'SOPORTE' | null;
      refCode?: string | null;
      scoreTotal?: number;
      tier?: 'NOVATO' | 'POTENCIAL' | 'APROBABLE' | null;
      rawJson: Record<string, unknown>;
    }) => {
      // First, add the lead to Firestore
      const leadsRef = collection(db, 'leads');
      const leadData: Omit<FirebaseLead, 'id'> = {
        name: data.name,
        country: data.country,
        contact: data.contact,
        intent: data.intent,
        refCode: data.refCode || null,
        scoreTotal: data.scoreTotal || 0,
        tier: data.tier || null,
        rawJson: data.rawJson,
        status: 'NUEVO',
        assignedAgentId: null,
        assignedLineLeaderId: null,
        origen: 'chat_ia',
        createdAt: new Date(),
      };

      const docRef = await addDoc(leadsRef, {
        ...leadData,
        createdAt: Timestamp.now(),
      });

      // If there's a refCode, try to assign via edge function
      if (data.refCode) {
        try {
          await supabase.functions.invoke('assign-lead', {
            body: {
              leadId: docRef.id,
              refCode: data.refCode,
              country: data.country,
            },
          });
        } catch (e) {
          console.error('Error assigning lead:', e);
        }
      }

      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase-leads'] });
      queryClient.invalidateQueries({ queryKey: ['firebase-lead-counts'] });
    },
  });
};

export default useFirebaseLeads;
