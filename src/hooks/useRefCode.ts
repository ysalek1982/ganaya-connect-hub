import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const REF_CODE_KEY = 'ganaya_ref_code';

export const useRefCode = () => {
  const [searchParams] = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for ref parameter
    const urlRefCode = searchParams.get('ref');
    
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
  }, [searchParams]);

  const getRefCode = (): string | null => {
    return refCode || sessionStorage.getItem(REF_CODE_KEY);
  };

  const clearRefCode = () => {
    sessionStorage.removeItem(REF_CODE_KEY);
    setRefCode(null);
  };

  return { refCode, getRefCode, clearRefCode };
};
