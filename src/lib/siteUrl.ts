/**
 * Returns the public site URL for generating referral links.
 * Priority: valid VITE_PUBLIC_SITE_URL > current non-preview origin > fallback ganaya.bet
 */
const PRODUCTION_SITE_FALLBACK = 'https://ganaya.bet';

const isPreviewOrLocalHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.lovableproject.com') ||
    host.endsWith('.lovable.app')
  );
};

const normalizeAbsoluteUrl = (rawUrl: string): string | null => {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
};

export const getPublicSiteUrl = (): string => {
  const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (envUrl) {
    const normalizedEnvUrl = normalizeAbsoluteUrl(envUrl);
    if (normalizedEnvUrl) {
      const envHost = new URL(normalizedEnvUrl).hostname;
      if (!isPreviewOrLocalHost(envHost)) {
        return normalizedEnvUrl;
      }
    }
  }

  const currentHost = window.location.hostname;
  if (!isPreviewOrLocalHost(currentHost)) {
    return window.location.origin.replace(/\/$/, '');
  }

  return PRODUCTION_SITE_FALLBACK;
};

/**
 * Generates a referral URL with the given ref code
 */
export const getReferralUrl = (refCode: string): string => {
  const baseUrl = getPublicSiteUrl();
  return `${baseUrl}/?ref=${refCode}`;
};

/**
 * Generates the login URL for agents
 */
export const getLoginUrl = (): string => {
  const baseUrl = getPublicSiteUrl();
  return `${baseUrl}/login`;
};
