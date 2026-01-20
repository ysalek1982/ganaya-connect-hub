export const countries = [
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', prefix: '+595' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', prefix: '+54' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', prefix: '+57' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', prefix: '+593' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', prefix: '+1' },
] as const;

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
