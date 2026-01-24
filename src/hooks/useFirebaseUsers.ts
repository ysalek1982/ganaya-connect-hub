import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
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
      let q = query(
        usersRef,
        where('role', 'in', ['AGENT', 'LINE_LEADER']),
        orderBy('createdAt', 'desc')
      );

      if (options?.lineLeaderId) {
        q = query(
          usersRef,
          where('lineLeaderId', '==', options.lineLeaderId),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebaseUser[];
    },
  });
};

// Fetch line leaders only
export const useFirebaseLineLeaders = () => {
  return useQuery({
    queryKey: ['firebase-line-leaders'],
    queryFn: async (): Promise<FirebaseUser[]> => {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'LINE_LEADER'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebaseUser[];
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

// Create agent user via Edge Function
export const useCreateAgentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      country: string;
      whatsapp: string;
      city?: string;
      lineLeaderId?: string;
      canRecruitSubagents?: boolean;
      role?: UserRole;
    }) => {
      const { data: response, error } = await supabase.functions.invoke('create-agent-user', {
        body: data,
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      return response as { uid: string; refCode: string; referralUrl: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
    },
  });
};

export default useFirebaseAgents;
