import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

      const { data, error } = await supabase.functions.invoke('agent-by-ref', {
        body: null,
        method: 'GET',
      });

      // Since invoke doesn't support query params well, we'll use direct fetch
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
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
        console.error('Error fetching agent by ref:', response.statusText);
        return null;
      }

      const result = await response.json();
      return result.agentInfo || null;
    },
    enabled: !!refCode,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

export default useAgentByRef;
