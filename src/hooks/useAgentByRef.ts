import { useQuery } from '@tanstack/react-query';
import type { PublicAgentInfo } from '@/lib/firebase-types';

interface UseAgentByRefOptions {
  refCode: string | null;
  campaignId?: string | null;
}

export const useAgentByRef = ({ refCode, campaignId }: UseAgentByRefOptions) => {
  return useQuery({
    queryKey: ['agent-by-ref', refCode, campaignId],
    queryFn: async (): Promise<PublicAgentInfo | null> => {
      if (!refCode) return null;

      const params = new URLSearchParams({ ref: refCode });
      if (campaignId) {
        params.append('cid', campaignId);
      }

      // Use direct fetch to edge function with query params
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!baseUrl || !anonKey) {
        console.error('Missing Supabase configuration');
        return null;
      }
      
      const response = await fetch(
        `${baseUrl}/functions/v1/agent-by-ref?${params.toString()}`,
        {
          headers: {
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Error fetching agent by ref:', response.status, response.statusText);
        return null;
      }

      const result = await response.json();
      
      if (result.error) {
        console.warn('Agent lookup error:', result.error);
        return null;
      }
      
      return result.agentInfo || null;
    },
    enabled: !!refCode,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export default useAgentByRef;
