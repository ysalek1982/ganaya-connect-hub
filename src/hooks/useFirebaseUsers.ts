import { getPublicSiteUrl } from '@/lib/siteUrl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirebaseUser, UserRole } from '@/lib/firebase-types';
import { supabase } from '@/integrations/supabase/client';

// Fetch all agents (users with role AGENT or LINE_LEADER)
export const useFirebaseAgents = (options?: { lineLeaderId?: string }) => {
  return useQuery({
    queryKey: ['firebase-agents', options?.lineLeaderId],
    queryFn: async (): Promise<FirebaseUser[]> => {
      const usersRef = collection(db, 'users');

      // NOTE: Avoid composite-index requirements by not combining where+orderBy.
      // We sort client-side by createdAt.
      let snapshot;
      if (options?.lineLeaderId) {
        // Fetch by leader first (single-field filter), then filter roles client-side.
        snapshot = await getDocs(query(usersRef, where('lineLeaderId', '==', options.lineLeaderId)));
      } else {
        snapshot = await getDocs(query(usersRef, where('role', 'in', ['AGENT', 'LINE_LEADER'])));
      }

      const users = snapshot.docs
        .map((d) => {
          const data = d.data() as any;
          return {
            uid: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(0),
          };
        })
        .filter((u) => (u.role === 'AGENT' || u.role === 'LINE_LEADER') && u.isActive !== false) as FirebaseUser[];

      users.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      return users;
    },
  });
};

// Fetch line leaders only
export const useFirebaseLineLeaders = () => {
  return useQuery({
    queryKey: ['firebase-line-leaders'],
    queryFn: async (): Promise<FirebaseUser[]> => {
      const usersRef = collection(db, 'users');
      // Avoid composite index by not using orderBy with where
      const snapshot = await getDocs(query(usersRef, where('role', '==', 'LINE_LEADER')));

      const users = snapshot.docs.map(d => {
        const data = d.data() as any;
        return {
          uid: d.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(0),
        };
      }) as FirebaseUser[];

      // Sort client-side
      users.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      return users;
    },
  });
};

// Fetch single user
export const useFirebaseUser = (uid: string | null) => {
  return useQuery({
    queryKey: ['firebase-user', uid],
    queryFn: async (): Promise<FirebaseUser | null> => {
      if (!uid) return null;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role as UserRole || 'AGENT',
        country: data.country || '',
        isActive: data.isActive ?? true,
        lineLeaderId: data.lineLeaderId || null,
        canRecruitSubagents: data.canRecruitSubagents ?? false,
        refCode: data.refCode || null,
        referralUrl: data.referralUrl || null,
        whatsapp: data.whatsapp || null,
        city: data.city || null,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    },
    enabled: !!uid,
  });
};

// Update user
export const useUpdateFirebaseUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, data }: { uid: string; data: Partial<FirebaseUser> }) => {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
      queryClient.invalidateQueries({ queryKey: ['firebase-user'] });
    },
  });
};

// Create agent result type
export interface CreateAgentResult {
  success: boolean;
  uid?: string;
  email?: string;
  tempPassword?: string;
  refCode?: string;
  error?: string;
}

// Create agent user via Edge Function
export const useCreateAgentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      country: string;
      whatsapp?: string;
      city?: string;
      lineLeaderId?: string;
      canRecruitSubagents?: boolean;
      role?: UserRole;
    }): Promise<CreateAgentResult> => {
      const { data: response, error } = await supabase.functions.invoke('create-agent-user', {
        body: { ...data, siteUrl: getPublicSiteUrl() },
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      return {
        success: true,
        uid: response.uid,
        email: response.email,
        tempPassword: response.tempPassword,
        refCode: response.refCode,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
    },
  });
};

// Combined hook for admin pages - provides agents, line leaders, and mutations
export const useFirebaseUsers = () => {
  const queryClient = useQueryClient();
  
  const agentsQuery = useFirebaseAgents();
  const lineLeadersQuery = useFirebaseLineLeaders();
  
  // Lead counts (simple in-memory tracking, could be enhanced with Firestore aggregation)
  const leadCountsQuery = useQuery({
    queryKey: ['lead-counts'],
    queryFn: async (): Promise<Record<string, number>> => {
      const leadsRef = collection(db, 'leads');
      const snapshot = await getDocs(leadsRef);
      
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

  // Create agent - using fetch directly to properly handle error responses
  const createAgent = async (data: {
    name: string;
    email: string;
    country: string;
    whatsapp?: string;
    city?: string;
    lineLeaderId?: string;
    canRecruitSubagents?: boolean;
  }): Promise<CreateAgentResult> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-agent-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({ ...data, siteUrl: getPublicSiteUrl() }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Extract error message from response body
        return { success: false, error: responseData.error || 'Error al crear agente' };
      }

      if (responseData?.error) {
        return { success: false, error: responseData.error };
      }

      queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
      return { 
        success: true, 
        uid: responseData.uid,
        email: responseData.email,
        tempPassword: responseData.tempPassword,
        refCode: responseData.refCode,
      };
    } catch (err: any) {
      const message = err.message || 'Error desconocido al crear agente';
      return { success: false, error: message };
    }
  };

  // Update agent
  const updateAgent = async (uid: string, data: Partial<FirebaseUser>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
  };

  // Delete agent (soft delete by setting isActive to false, or hard delete)
  const deleteAgent = async (uid: string) => {
    // Soft delete - just deactivate
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
    queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
  };

  // Get lead count for an agent
  const getLeadCount = (agentUid: string): number => {
    return leadCountsQuery.data?.[agentUid] || 0;
  };

  return {
    agents: agentsQuery.data,
    lineLeaders: lineLeadersQuery.data,
    isLoading: agentsQuery.isLoading || lineLeadersQuery.isLoading,
    error: agentsQuery.error || lineLeadersQuery.error,
    createAgent,
    updateAgent,
    deleteAgent,
    getLeadCount,
    refetch: () => {
      agentsQuery.refetch();
      lineLeadersQuery.refetch();
      leadCountsQuery.refetch();
    },
  };
};

export default useFirebaseAgents;
