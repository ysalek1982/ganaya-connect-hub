import { useMemo } from 'react';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  // Meta/Facebook specific
  fbclid: string | null;
  // Google specific
  gclid: string | null;
  // Custom campaign tracking
  campaign_name: string | null;
  adset_id: string | null;
  ad_id: string | null;
}

export const useUTM = (): UTMParams => {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        fbclid: null,
        gclid: null,
        campaign_name: null,
        adset_id: null,
        ad_id: null,
      };
    }

    const params = new URLSearchParams(window.location.search);

    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
      fbclid: params.get('fbclid'),
      gclid: params.get('gclid'),
      campaign_name: params.get('campaign_name'),
      adset_id: params.get('adset_id'),
      ad_id: params.get('ad_id'),
    };
  }, []);
};

// Helper to get non-null tracking params only
export const getTrackingData = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const trackingKeys = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'fbclid', 'gclid', 'campaign_name', 'adset_id', 'ad_id',
  ];

  const result: Record<string, string> = {};
  for (const key of trackingKeys) {
    const value = params.get(key);
    if (value) {
      result[key] = value;
    }
  }

  return result;
};
