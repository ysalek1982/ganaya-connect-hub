import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReferralLink } from '@/lib/firebase-types';

// Fetch referral links for an agent
export const useReferralLinks = (agentUid: string | null) => {
  return useQuery({
    queryKey: ['referral-links', agentUid],
    queryFn: async (): Promise<ReferralLink[]> => {
      if (!agentUid) return [];

      const linksRef = collection(db, 'referralLinks');
      const q = query(
        linksRef, 
        where('agentUid', '==', agentUid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          agentUid: data.agentUid,
          name: data.name || '',
          country: data.country || null,
          whatsappOverride: data.whatsappOverride || null,
          contactLabelOverride: data.contactLabelOverride || null,
          messageTemplate: data.messageTemplate || null,
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as ReferralLink;
      });
    },
    enabled: !!agentUid,
  });
};

// Create referral link
export const useCreateReferralLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ReferralLink, 'id' | 'createdAt' | 'updatedAt'>) => {
      const linksRef = collection(db, 'referralLinks');
      const docRef = await addDoc(linksRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['referral-links', variables.agentUid] });
    },
  });
};

// Update referral link
export const useUpdateReferralLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, agentUid, data }: { 
      id: string; 
      agentUid: string;
      data: Partial<ReferralLink> 
    }) => {
      const linkRef = doc(db, 'referralLinks', id);
      await updateDoc(linkRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['referral-links', variables.agentUid] });
    },
  });
};

// Delete referral link
export const useDeleteReferralLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, agentUid }: { id: string; agentUid: string }) => {
      const linkRef = doc(db, 'referralLinks', id);
      await deleteDoc(linkRef);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['referral-links', variables.agentUid] });
    },
  });
};

export default useReferralLinks;
