/**
 * Returns the public site URL for generating referral links.
 * Priority: valid VITE_PUBLIC_SITE_URL > current non-preview origin > fallback ganaya.bet
 */
/**
 * Only exclude actual preview/dev environments.
 * .lovable.app is a valid published domain and should NOT be excluded.
 */
const isPreviewOrLocalHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.lovableproject.com')
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
  // 1. If VITE_PUBLIC_SITE_URL is set and not a preview host, use it
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

  // 2. Use the current browser origin if it's not a preview/dev host
  //    This covers custom domains AND .lovable.app published domains
  const currentHost = window.location.hostname;
  if (!isPreviewOrLocalHost(currentHost)) {
    return window.location.origin.replace(/\/$/, '');
  }

  // 3. Last resort: return current origin anyway (better than a wrong hardcoded domain)
  return window.location.origin.replace(/\/$/, '');
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
