import { useMemo } from 'react';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export const useUTM = (): UTMParams => {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { utm_source: null, utm_medium: null, utm_campaign: null };
    }

    const params = new URLSearchParams(window.location.search);
    
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
    };
  }, []);
};
