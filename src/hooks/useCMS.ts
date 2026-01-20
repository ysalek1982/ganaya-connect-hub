import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCMS = (key: string) => {
  return useQuery({
    queryKey: ['cms', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data?.value || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllCMS = () => {
  return useQuery({
    queryKey: ['cms', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*');

      if (error) throw error;
      
      const cmsMap: Record<string, any> = {};
      data?.forEach(item => {
        cmsMap[item.key] = item.value;
      });
      
      return cmsMap;
    },
    staleTime: 1000 * 60 * 5,
  });
};
