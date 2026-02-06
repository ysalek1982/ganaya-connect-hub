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

// --- NEW section content interfaces ---
export interface ProblemSectionContent {
  title: string;
  subtitle: string;
  items: { title: string; description: string }[];
}

export interface OpportunitySectionContent {
  title: string;
  subtitle: string;
  stats: { value: string; label: string; sublabel: string }[];
}

export interface CompetitiveSectionContent {
  title: string;
  subtitle: string;
  vsEmployment: { traditional: string; ganaya: string }[];
  vsPlatforms: { traditional: string; ganaya: string }[];
}

export interface AcquisitionSectionContent {
  title: string;
  subtitle: string;
  methods: { title: string; description: string; tips: string[] }[];
}

export interface NextStepsSectionContent {
  title: string;
  subtitle: string;
  steps: { title: string; description: string }[];
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
  
  // Brand configuration
  brand: BrandConfig;
  hero: HeroConfig;
  vsl: VslConfig;
  sectionTitles: SectionTitles;
  socialProof: SocialProof;

  // NEW section content
  problemSection: ProblemSectionContent;
  opportunitySection: OpportunitySectionContent;
  competitiveSection: CompetitiveSectionContent;
  acquisitionSection: AcquisitionSectionContent;
  nextStepsSection: NextStepsSectionContent;
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

const defaultHero: HeroConfig = {
  heroEyebrow: 'PROGRAMA DE AGENTES',
  heroCTASecondaryText: 'Ver cómo funciona',
  heroImageOverlayStrength: 0.55,
};

const defaultVsl: VslConfig = {
  vslYoutubeUrl: '',
  vslTitle: 'Mira esto antes de postular',
  vslSubtitle: 'En menos de 2 minutos vas a entender cómo funciona',
  vslLayout: 'split',
};

const defaultSectionTitles: SectionTitles = {
  howItWorksTitle: 'Cómo funciona',
  commissionsTitle: 'Comisiones y bonos',
  faqTitle: 'Preguntas frecuentes',
  benefitsTitle: 'Beneficios del programa',
  growthTitle: 'Crece con tu red',
};

const defaultSocialProof: SocialProof = {
  proofCards: [],
  disclaimerShort: '*Resultados dependen de tu gestión y actividad.',
};

// --- NEW defaults ---
const defaultProblemSection: ProblemSectionContent = {
  title: 'El problema actual',
  subtitle: '¿Te identificás con alguno de estos obstáculos?',
  items: [
    { title: 'Techo salarial', description: 'Ingresos limitados sin importar cuánto trabajes' },
    { title: 'Sin libertad', description: 'Horarios rígidos y sin movilidad geográfica' },
    { title: 'Altos costos', description: 'Negocio físico requiere inventario, local y empleados' },
    { title: 'Poco escalable', description: 'Solo creces por tu tiempo físico disponible' },
  ],
};

const defaultOpportunitySection: OpportunitySectionContent = {
  title: 'Oportunidad LATAM',
  subtitle: 'El mercado de apuestas online crece a ritmo acelerado en América Latina',
  stats: [
    { value: '+25%', label: 'Crecimiento anual', sublabel: 'Mercado iGaming LATAM' },
    { value: '85%', label: 'Operaciones móviles', sublabel: 'Desde smartphones' },
    { value: 'Alta', label: 'Demanda local', sublabel: 'Pagos en moneda local' },
    { value: '$8.5B', label: 'Mercado 2026', sublabel: 'Proyección USD' },
  ],
};

const defaultCompetitiveSection: CompetitiveSectionContent = {
  title: 'Ventajas competitivas',
  subtitle: 'Por qué Ganaya.bet es diferente',
  vsEmployment: [
    { traditional: 'Oficina y desplazamiento', ganaya: '100% móvil' },
    { traditional: 'Inventario físico', ganaya: 'Sin inventario, digital' },
    { traditional: 'Empleados que gestionar', ganaya: 'Negocio personal' },
    { traditional: 'Ingresos limitados', ganaya: 'Ingresos escalables' },
  ],
  vsPlatforms: [
    { traditional: 'Comisiones 15–25% máx', ganaya: 'Hasta 40%' },
    { traditional: 'Banca inicial $500–$1,000', ganaya: '$300 para empezar' },
    { traditional: 'Sistemas complejos', ganaya: 'Operación simple' },
    { traditional: 'Multinivel confuso', ganaya: 'Modelo transparente' },
  ],
};

const defaultAcquisitionSection: AcquisitionSectionContent = {
  title: 'Métodos de captación',
  subtitle: 'Estrategias probadas para conseguir tus primeros clientes',
  methods: [
    {
      title: 'Contacto directo y referidos',
      description: 'Tu círculo cercano es tu primer mercado',
      tips: [
        'Pitch de 30 segundos: problema → solución → beneficio',
        'Bonificación especial a primeros 10 clientes',
        'Crea un grupo VIP inicial con tus mejores contactos',
      ],
    },
    {
      title: 'Grupos de mensajería',
      description: 'WhatsApp/Telegram de deportes y pronósticos',
      tips: [
        'Pronósticos gratis para generar confianza',
        'Canal con atención rápida y personalizada',
        'Capturas de ganancias (sin prometer resultados)',
      ],
    },
  ],
};

const defaultNextStepsSection: NextStepsSectionContent = {
  title: 'Próximos pasos',
  subtitle: 'En 4 simples pasos podés comenzar a operar',
  steps: [
    { title: 'Capital', description: 'Validá tu banca operativa de $300 USD' },
    { title: 'Cuenta operativa', description: 'Binance verificada + métodos locales' },
    { title: 'Registro', description: 'Completá el formulario de alta' },
    { title: 'Onboarding', description: 'Capacitación 15 min y comenzás' },
  ],
};

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
    problem: true,
    opportunity: true,
    competitive: true,
    acquisition: true,
    nextSteps: true,
  },
  
  brand: defaultBrand,
  hero: defaultHero,
  vsl: defaultVsl,
  sectionTitles: defaultSectionTitles,
  socialProof: defaultSocialProof,

  problemSection: defaultProblemSection,
  opportunitySection: defaultOpportunitySection,
  competitiveSection: defaultCompetitiveSection,
  acquisitionSection: defaultAcquisitionSection,
  nextStepsSection: defaultNextStepsSection,
};

// Helper to merge content with defaults
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
    problemSection: { ...defaultProblemSection, ...(content.problemSection || {}) },
    opportunitySection: { ...defaultOpportunitySection, ...(content.opportunitySection || {}) },
    competitiveSection: { ...defaultCompetitiveSection, ...(content.competitiveSection || {}) },
    acquisitionSection: { ...defaultAcquisitionSection, ...(content.acquisitionSection || {}) },
    nextStepsSection: { ...defaultNextStepsSection, ...(content.nextStepsSection || {}) },
  };
};

// Helper to invoke bootstrap-admin
const invokeBootstrapAdmin = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('bootstrap-admin', { body: payload });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
};

// Public hook
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
    staleTime: 5 * 60 * 1000,
  });
};

// Admin hook
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
export { defaultBrand, defaultHero, defaultVsl, defaultSectionTitles, defaultSocialProof, defaultProblemSection, defaultOpportunitySection, defaultCompetitiveSection, defaultAcquisitionSection, defaultNextStepsSection };
