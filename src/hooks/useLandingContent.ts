import { useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';

export interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBullets: string[];
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  vslYoutubeUrl: string;
  vslTitle: string;
  vslSubtitle: string;
  disclaimerText: string;
  sectionsEnabled: Record<string, boolean>;
}

// Default content fallback
export const defaultLandingContent: LandingContent = {
  heroTitle: 'Crea ingresos como Agente Ganaya.bet desde tu celular',
  heroSubtitle: 'Comisiones escalables (hasta 40%) + bonos por red (7% y 5%). 100% móvil.',
  heroBullets: [
    'Operación simple + soporte directo',
    'Crecimiento por red (sub-agentes)',
    'Pago mensual puntual'
  ],
  ctaPrimaryText: 'Postularme ahora',
  ctaSecondaryText: 'Ver cómo funciona',
  vslYoutubeUrl: '',
  vslTitle: 'Mira esto antes de postular',
  vslSubtitle: 'En menos de 2 minutos vas a entender cómo funciona',
  disclaimerText: 'Resultados dependen de tu gestión y actividad.',
  sectionsEnabled: {
    video: true,
    howItWorks: true,
    benefits: true,
    forWho: true,
    requirements: true,
    flow: true,
    commissions: true,
    growth: true,
    faq: true,
  },
};

// Helper to invoke bootstrap-admin
const invokeBootstrapAdmin = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('bootstrap-admin', { body: payload });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
};

// Public hook - loads landing content without auth (uses edge function with public read)
export const useLandingContent = () => {
  return useQuery({
    queryKey: ['landing-content'],
    queryFn: async (): Promise<LandingContent> => {
      try {
        const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
          body: { action: 'landing_content_get_public' },
        });
        
        if (error || data?.error) {
          console.log('[useLandingContent] No content found, using defaults');
          return defaultLandingContent;
        }
        
        return {
          ...defaultLandingContent,
          ...(data?.content || {}),
        };
      } catch (err) {
        console.error('[useLandingContent] Error:', err);
        return defaultLandingContent;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Admin hook - loads and saves landing content (requires auth)
export const useAdminLandingContent = () => {
  return useQuery({
    queryKey: ['admin-landing-content'],
    queryFn: async (): Promise<LandingContent> => {
      const user = auth.currentUser;
      if (!user) throw new Error('No autenticado');
      
      const idToken = await user.getIdToken(true);
      
      const res = await invokeBootstrapAdmin<{ success: boolean; content: LandingContent }>({
        action: 'landing_content_get',
        idToken,
      });
      
      return {
        ...defaultLandingContent,
        ...(res.content || {}),
      };
    },
    enabled: !!auth.currentUser,
  });
};

// Extract YouTube ID from URL
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
