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
import { toast } from 'sonner';

// Helper to parse Firestore lead document
const parseLeadDoc = (docSnap: { id: string; data: () => Record<string, unknown> }): FirebaseLead => {
  const data = docSnap.data() as Record<string, unknown>;
  return {
    id: docSnap.id,
    name: data.name as string || '',
    country: data.country as string || '',
    city: data.city as string | null || null,
    contact: data.contact as FirebaseLead['contact'] || {},
    intent: data.intent as FirebaseLead['intent'] || null,
    refCode: data.refCode as string | null || null,
    campaignId: data.campaignId as string | null || null,
    assignedAgentId: data.assignedAgentId as string | null || null,
    assignedLineLeaderId: data.assignedLineLeaderId as string | null || null,
    status: data.status as LeadStatus || 'NUEVO',
    scoreTotal: data.scoreTotal as number || 0,
    tier: data.tier as FirebaseLead['tier'] || null,
    rawJson: data.rawJson as Record<string, unknown> || {},
    origen: data.origen as string || '',
    createdAt: (data.createdAt as { toDate: () => Date })?.toDate?.() || new Date(),
  } as FirebaseLead;
};

// Fetch leads based on user role - strict isolation per agent
export const useFirebaseLeads = (options: {
  agentId?: string | null;
  lineLeaderId?: string | null;
  isAdmin?: boolean;
  refCode?: string | null;
}) => {
  const { agentId, lineLeaderId, isAdmin, refCode } = options;

  return useQuery({
    queryKey: ['firebase-leads', agentId, lineLeaderId, isAdmin, refCode],
    queryFn: async (): Promise<FirebaseLead[]> => {
      const leadsRef = collection(db, 'leads');
      const allLeads: FirebaseLead[] = [];
      const seenIds = new Set<string>();

      const addDocs = (snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => {
        snapshot.docs.forEach(docSnap => {
          if (!seenIds.has(docSnap.id)) {
            seenIds.add(docSnap.id);
            allLeads.push(parseLeadDoc(docSnap));
          }
        });
      };

      if (isAdmin) {
        try {
          const q = query(leadsRef, limit(500));
          const snapshot = await getDocs(q);
          addDocs(snapshot);
          console.log('[useFirebaseLeads] Admin query returned', snapshot.size, 'leads');
        } catch (error) {
          console.error('[useFirebaseLeads] Admin query error:', error);
        }
      } else if (agentId) {
        // Query 1: leads assigned directly to this agent
        try {
          const agentQuery = query(
            leadsRef,
            where('assignedAgentId', '==', agentId),
            limit(500)
          );
          const agentSnapshot = await getDocs(agentQuery);
          addDocs(agentSnapshot);
          console.log('[useFirebaseLeads] AssignedAgent query returned', agentSnapshot.size, 'leads for', agentId);
        } catch (error) {
          console.warn('[useFirebaseLeads] AssignedAgent query failed:', error);
        }

        // Query 2: leads by refCode - matches leads that came via this agent's referral link
        if (refCode) {
          try {
            const refQuery = query(
              leadsRef,
              where('refCode', '==', refCode),
              limit(500)
            );
            const refSnapshot = await getDocs(refQuery);
            addDocs(refSnapshot);
            console.log('[useFirebaseLeads] RefCode query returned', refSnapshot.size, 'leads for refCode', refCode);
          } catch (error) {
            console.warn('[useFirebaseLeads] RefCode query failed:', error);
          }
        }

        console.log('[useFirebaseLeads] Agent queries complete. agentId:', agentId, 'refCode:', refCode);
      } else {
        return [];
      }

      // Sort client-side by createdAt descending
      allLeads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      console.log('[useFirebaseLeads] Total unique leads:', allLeads.length);
      return allLeads;
    },
    enabled: isAdmin || !!agentId,
    refetchInterval: 30000, // Auto-refresh every 30s
    staleTime: 15000,
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