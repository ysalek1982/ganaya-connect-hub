export const countries = [
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', prefix: '+595' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', prefix: '+54' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', prefix: '+57' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', prefix: '+593' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', prefix: '+56' },
  { code: 'MX', name: 'México', flag: '🇲🇽', prefix: '+52' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', prefix: '+591' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', prefix: '+51' },
  { code: 'US', name: 'USA', flag: '🇺🇸', prefix: '+1' },
  { code: 'ES', name: 'España', flag: '🇪🇸', prefix: '+34' },
] as const;

/** Flat list of country names for Select components */
export const COUNTRY_NAMES = countries.map(c => c.name);

export type CountryCode = typeof countries[number]['code'];

export const getCountryByCode = (code: string) => 
  countries.find(c => c.code === code);

export const getCountryByPrefix = (prefix: string) =>
  countries.find(c => c.prefix === prefix);

export const formatWhatsApp = (number: string, countryCode?: string) => {
  const digits = number.replace(/\D/g, '');
  const country = countryCode ? getCountryByCode(countryCode) : null;
  
  if (country && !digits.startsWith(country.prefix.replace('+', ''))) {
    return country.prefix + digits;
  }
  
  return '+' + digits;
};

export const validateWhatsApp = (number: string): boolean => {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};
