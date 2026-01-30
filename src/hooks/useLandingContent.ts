import { useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';

// Brand configuration
export interface BrandConfig {
  brandName: string;
  accentStyle: 'emerald_gold' | 'neon' | 'minimal';
  heroVisualStyle: 'roulette' | 'chips' | 'cards' | 'lights';
  trustBadges: string[];
}

// Hero extensions
export interface HeroConfig {
  heroEyebrow: string;
  heroCTASecondaryText: string;
  heroImageOverlayStrength: number;
}

// VSL configuration
export interface VslConfig {
  vslYoutubeUrl: string;
  vslTitle: string;
  vslSubtitle: string;
  vslLayout: 'split' | 'center';
}

// Section titles
export interface SectionTitles {
  howItWorksTitle: string;
  commissionsTitle: string;
  faqTitle: string;
  benefitsTitle: string;
  growthTitle: string;
}

// Social proof
export interface ProofCard {
  title: string;
  text: string;
  icon: string;
}

export interface SocialProof {
  proofCards: ProofCard[];
  disclaimerShort: string;
}

export interface LandingContent {
  // Existing fields (DO NOT REMOVE)
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
  
  // NEW: Brand configuration
  brand: BrandConfig;
  
  // NEW: Hero extensions
  hero: HeroConfig;
  
  // NEW: VSL extensions
  vsl: VslConfig;
  
  // NEW: Section titles
  sectionTitles: SectionTitles;
  
  // NEW: Social proof
  socialProof: SocialProof;
}

// Default brand config
const defaultBrand: BrandConfig = {
  brandName: 'Ganaya.bet',
  accentStyle: 'emerald_gold',
  heroVisualStyle: 'roulette',
  trustBadges: [
    'Programa de agentes',
    '100% móvil',
    'Proceso claro',
    'Soporte directo',
    'Pago mensual*',
    '+18 / Juego responsable'
  ],
};

// Default hero config
const defaultHero: HeroConfig = {
  heroEyebrow: 'PROGRAMA DE AGENTES',
  heroCTASecondaryText: 'Ver cómo funciona',
  heroImageOverlayStrength: 0.55,
};

// Default VSL config
const defaultVsl: VslConfig = {
  vslYoutubeUrl: '',
  vslTitle: 'Mira esto antes de postular',
  vslSubtitle: 'En menos de 2 minutos vas a entender cómo funciona',
  vslLayout: 'split',
};

// Default section titles
const defaultSectionTitles: SectionTitles = {
  howItWorksTitle: 'Cómo funciona',
  commissionsTitle: 'Comisiones y bonos',
  faqTitle: 'Preguntas frecuentes',
  benefitsTitle: 'Beneficios del programa',
  growthTitle: 'Crece con tu red',
};

// Default social proof
const defaultSocialProof: SocialProof = {
  proofCards: [],
  disclaimerShort: '*Resultados dependen de tu gestión y actividad.',
};

// Default content fallback - MAINTAINS ALL EXISTING FIELDS
export const defaultLandingContent: LandingContent = {
  // Existing fields
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
  
  // New fields with defaults
  brand: defaultBrand,
  hero: defaultHero,
  vsl: defaultVsl,
  sectionTitles: defaultSectionTitles,
  socialProof: defaultSocialProof,
};

// Helper to merge content with defaults (deep merge for nested objects)
const mergeWithDefaults = (content: Partial<LandingContent> | null): LandingContent => {
  if (!content) return defaultLandingContent;
  
  return {
    ...defaultLandingContent,
    ...content,
    brand: { ...defaultBrand, ...(content.brand || {}) },
    hero: { ...defaultHero, ...(content.hero || {}) },
    vsl: { ...defaultVsl, ...(content.vsl || {}) },
    sectionTitles: { ...defaultSectionTitles, ...(content.sectionTitles || {}) },
    socialProof: { ...defaultSocialProof, ...(content.socialProof || {}) },
    sectionsEnabled: { ...defaultLandingContent.sectionsEnabled, ...(content.sectionsEnabled || {}) },
  };
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
        
        return mergeWithDefaults(data?.content || null);
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
      
      const res = await invokeBootstrapAdmin<{ success: boolean; content: LandingContent | null }>({
        action: 'landing_content_get',
        idToken,
      });
      
      return mergeWithDefaults(res.content || null);
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

// Export defaults for admin use
export { defaultBrand, defaultHero, defaultVsl, defaultSectionTitles, defaultSocialProof };
