/**
 * Returns the production site URL for generating referral links.
 * Priority: VITE_PUBLIC_SITE_URL env var > fallback to ganaya.bet
 */
export const getPublicSiteUrl = (): string => {
  // Check for configured public site URL
  const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  
  // Production fallback - always use ganaya.bet in production
  if (import.meta.env.PROD) {
    return 'https://ganaya.bet';
  }
  
  // Development fallback to current origin
  return window.location.origin;
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
