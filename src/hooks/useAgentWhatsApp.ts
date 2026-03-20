import { useState, useEffect } from 'react';
import { useRefCode } from '@/hooks/useRefCode';

const FALLBACK_WHATSAPP = '59176356972';

interface AgentContactInfo {
  whatsapp: string;
  displayName?: string;
  isAgentSpecific: boolean;
}

/**
 * Resolves the WhatsApp number for the current ref code.
 * Falls back to global number if no agent is found.
 */
export const useAgentWhatsApp = () => {
  const { refCode, campaignId } = useRefCode();
  const [contact, setContact] = useState<AgentContactInfo>({
    whatsapp: FALLBACK_WHATSAPP,
    isAgentSpecific: false,
  });

  useEffect(() => {
    if (!refCode) return;

    const resolve = async () => {
      try {
        const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-by-ref`);
        url.searchParams.set('ref', refCode);
        if (campaignId) url.searchParams.set('cid', campaignId);

        const res = await fetch(url.toString(), {
          headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.agentInfo?.whatsapp) {
            setContact({
              whatsapp: data.agentInfo.whatsapp,
              displayName: data.agentInfo.displayName,
              isAgentSpecific: true,
            });
          }
        }
      } catch {
        // keep fallback
      }
    };

    resolve();
  }, [refCode, campaignId]);

  const openWhatsApp = (customMessage?: string) => {
    const message = encodeURIComponent(
      customMessage || 'Hola, quiero información sobre Ganaya.bet'
    );
    window.open(`https://wa.me/${contact.whatsapp}?text=${message}`, '_blank');
  };

  return { ...contact, openWhatsApp };
};
