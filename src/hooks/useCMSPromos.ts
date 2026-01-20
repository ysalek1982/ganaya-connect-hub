import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CMSSection {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  enabled: boolean;
  order: number;
}

export interface CMSLobby {
  id: string;
  category: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string | null;
  badge: string | null;
  order: number;
  active: boolean;
}

export interface CMSPromoCarousel {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string | null;
  order: number;
  active: boolean;
}

export interface CMSSpotlightGame {
  id: string;
  name: string;
  category: string;
  speed_tag: string;
  image_url: string | null;
  cta_text: string;
  cta_link: string | null;
  order: number;
  active: boolean;
}

export interface CMSFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export interface CMSMobileCTA {
  id: string;
  button_key: string;
  text: string;
  link: string;
  visible: boolean;
  order: number;
}

export interface CMSSEO {
  id: string;
  page_key: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
}

export const useCMSSections = () => {
  return useQuery({
    queryKey: ['cms_sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_sections')
        .select('*')
        .order('order', { ascending: true });
      if (error) throw error;
      return data as CMSSection[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSLobbies = () => {
  return useQuery({
    queryKey: ['cms_lobbies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_lobbies')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });
      if (error) throw error;
      return data as CMSLobby[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSPromoCarousel = () => {
  return useQuery({
    queryKey: ['cms_promos_carousel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_promos_carousel')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });
      if (error) throw error;
      return data as CMSPromoCarousel[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSSpotlightGames = () => {
  return useQuery({
    queryKey: ['cms_spotlight_games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_spotlight_games')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });
      if (error) throw error;
      return data as CMSSpotlightGame[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSFAQ = () => {
  return useQuery({
    queryKey: ['cms_faq'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_faq')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });
      if (error) throw error;
      return data as CMSFAQ[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSMobileCTAs = () => {
  return useQuery({
    queryKey: ['cms_mobile_ctas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_mobile_ctas')
        .select('*')
        .eq('visible', true)
        .order('order', { ascending: true });
      if (error) throw error;
      return data as CMSMobileCTA[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCMSSEO = (pageKey: string) => {
  return useQuery({
    queryKey: ['cms_seo', pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_seo')
        .select('*')
        .eq('page_key', pageKey)
        .maybeSingle();
      if (error) throw error;
      return data as CMSSEO | null;
    },
    staleTime: 1000 * 60 * 5,
  });
};
