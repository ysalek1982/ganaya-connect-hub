import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const REF_CODE_KEY = 'ganaya_ref_code';
const CAMPAIGN_ID_KEY = 'ganaya_campaign_id';

export const useRefCode = () => {
  const [searchParams] = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for ref parameter
    const urlRefCode = searchParams.get('ref');
    const urlCampaignId = searchParams.get('cid');
    
    if (urlRefCode) {
      // Store in sessionStorage
      sessionStorage.setItem(REF_CODE_KEY, urlRefCode);
      setRefCode(urlRefCode);
    } else {
      // Try to get from sessionStorage
      const storedRefCode = sessionStorage.getItem(REF_CODE_KEY);
      if (storedRefCode) {
        setRefCode(storedRefCode);
      }
    }

    if (urlCampaignId) {
      sessionStorage.setItem(CAMPAIGN_ID_KEY, urlCampaignId);
      setCampaignId(urlCampaignId);
    } else {
      const storedCampaignId = sessionStorage.getItem(CAMPAIGN_ID_KEY);
      if (storedCampaignId) {
        setCampaignId(storedCampaignId);
      }
    }
  }, [searchParams]);

  const getRefCode = (): string | null => {
    return refCode || sessionStorage.getItem(REF_CODE_KEY);
  };

  const getCampaignId = (): string | null => {
    return campaignId || sessionStorage.getItem(CAMPAIGN_ID_KEY);
  };

  const clearRefCode = () => {
    sessionStorage.removeItem(REF_CODE_KEY);
    sessionStorage.removeItem(CAMPAIGN_ID_KEY);
    setRefCode(null);
    setCampaignId(null);
  };

  return { refCode, campaignId, getRefCode, getCampaignId, clearRefCode };
};
