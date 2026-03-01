import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import type { FirebaseUser } from '@/lib/firebase-types';

export interface CreateSubagentResult {
  success: boolean;
  uid?: string;
  email?: string;
  tempPassword?: string;
  refCode?: string;
  referralUrl?: string;
  error?: string;
}

// Fetch subagents for the current user (via secure backend)
export const useSubagents = () => {
  return useQuery({
    queryKey: ['subagents'],
    queryFn: async (): Promise<FirebaseUser[]> => {
      const user = auth.currentUser;
      if (!user) return [];
      
      const idToken = await user.getIdToken(true);
      
      const { data, error } = await supabase.functions.invoke('create-agent-user', {
        body: {
          action: 'list-subagents',
          idToken,
        },
      });
      
      if (error) {
        console.error('[useSubagents] Error:', error);
        throw new Error(error.message);
      }
      
      if (data?.error) {
        console.error('[useSubagents] API Error:', data.error);
        throw new Error(data.error);
      }
      
      // Transform to FirebaseUser format
      const subagents = (data?.subagents || []).map((s: Record<string, unknown>) => ({
        uid: s.uid as string,
        name: s.name as string || '',
        displayName: s.displayName as string || s.name as string || '',
        email: s.email as string || '',
        role: s.role as FirebaseUser['role'] || 'AGENT',
        country: s.country as string || '',
        city: s.city as string | null || null,
        isActive: s.isActive as boolean ?? true,
        lineLeaderId: s.lineLeaderId as string | null || null,
        canRecruitSubagents: s.canRecruitSubagents as boolean ?? false,
        refCode: s.refCode as string | null || null,
        referralUrl: s.referralUrl as string | null || null,
        whatsapp: s.whatsapp as string | null || null,
        createdAt: s.createdAt ? new Date(s.createdAt as string) : new Date(),
      })) as FirebaseUser[];
      
      // Sort by createdAt desc
      subagents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return subagents;
    },
    enabled: !!auth.currentUser,
  });
};

// Create subagent (authenticated)
export const useCreateSubagent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      country: string;
      whatsapp?: string;
      city?: string;
    }): Promise<CreateSubagentResult> => {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No autenticado' };
      }
      
      const idToken = await user.getIdToken(true);
      
      const { getPublicSiteUrl } = await import('@/lib/siteUrl');
      const { data: response, error } = await supabase.functions.invoke('create-agent-user', {
        body: {
          ...data,
          idToken,
          role: 'AGENT',
          canRecruitSubagents: false,
          siteUrl: getPublicSiteUrl(),
        },
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (response?.error) {
        return { success: false, error: response.error };
      }
      
      return {
        success: true,
        uid: response.uid,
        email: response.email,
        tempPassword: response.tempPassword,
        refCode: response.refCode,
        referralUrl: response.referralUrl,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subagents'] });
      queryClient.invalidateQueries({ queryKey: ['firebase-lead-counts'] });
    },
  });
};

export default useSubagents;
