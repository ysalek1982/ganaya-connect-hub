/**
 * Unified Agent Profile Model and Scoring System
 * 
 * This is the CANONICAL model for agent lead profiles.
 * All chat questions, save logic, and admin UI should align with this.
 */

export interface AgentProfile {
  name: string | null;
  country: string | null;
  whatsapp: string | null;
  age18: boolean | null;
  working_capital_usd: number | string | null; // Can be number or range string like "300-500"
  hours_per_day: number | string | null; // Can be number or range string like "3-5"
  sales_or_customer_service_exp: boolean | null;
  casino_or_betting_exp: boolean | null;
  has_local_payment_methods: boolean | null;
  wants_to_start_now: boolean | null;
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  value: boolean | string | number | null;
  pointsAwarded: number;
  maxPoints: number;
}

export interface AgentScoreResult {
  score_total: number;
  score_tier: 'PROMETEDOR' | 'POTENCIAL' | 'NOVATO';
  score_breakdown: ScoreBreakdownItem[];
}

/**
 * Compute agent score from profile data.
 * Total possible: 100 points
 * 
 * Weights:
 * - working_capital_usd >= 300 => +30
 * - hours_per_day >= 4 => +20 (>=2 and <4 => +10)
 * - has_local_payment_methods true => +15
 * - sales_or_customer_service_exp true => +15
 * - casino_or_betting_exp true => +10
 * - wants_to_start_now true => +10
 */
export function computeAgentScore(profile: Partial<AgentProfile>): AgentScoreResult {
  const breakdown: ScoreBreakdownItem[] = [];
  let total = 0;

  // 1. Working Capital (30 max)
  const capitalValue = parseCapital(profile.working_capital_usd);
  const capitalPoints = capitalValue >= 300 ? 30 : capitalValue >= 100 ? 15 : 0;
  total += capitalPoints;
  breakdown.push({
    key: 'working_capital_usd',
    label: 'Banca $300+',
    value: profile.working_capital_usd ?? null,
    pointsAwarded: capitalPoints,
    maxPoints: 30,
  });

  // 2. Hours per day (20 max)
  const hoursValue = parseHours(profile.hours_per_day);
  const hoursPoints = hoursValue >= 4 ? 20 : hoursValue >= 2 ? 10 : 0;
  total += hoursPoints;
  breakdown.push({
    key: 'hours_per_day',
    label: 'Horas/día (4+)',
    value: profile.hours_per_day ?? null,
    pointsAwarded: hoursPoints,
    maxPoints: 20,
  });

  // 3. Local payment methods (15 max)
  const paymentPoints = profile.has_local_payment_methods === true ? 15 : 0;
  total += paymentPoints;
  breakdown.push({
    key: 'has_local_payment_methods',
    label: 'Métodos de cobro local',
    value: profile.has_local_payment_methods ?? null,
    pointsAwarded: paymentPoints,
    maxPoints: 15,
  });

  // 4. Sales/customer service experience (15 max)
  const salesPoints = profile.sales_or_customer_service_exp === true ? 15 : 0;
  total += salesPoints;
  breakdown.push({
    key: 'sales_or_customer_service_exp',
    label: 'Experiencia atención/ventas',
    value: profile.sales_or_customer_service_exp ?? null,
    pointsAwarded: salesPoints,
    maxPoints: 15,
  });

  // 5. Casino/betting experience (10 max)
  const casinoPoints = profile.casino_or_betting_exp === true ? 10 : 0;
  total += casinoPoints;
  breakdown.push({
    key: 'casino_or_betting_exp',
    label: 'Experiencia casinos/apuestas',
    value: profile.casino_or_betting_exp ?? null,
    pointsAwarded: casinoPoints,
    maxPoints: 10,
  });

  // 6. Wants to start now (10 max)
  const startPoints = profile.wants_to_start_now === true ? 10 : 0;
  total += startPoints;
  breakdown.push({
    key: 'wants_to_start_now',
    label: 'Quiere empezar ya',
    value: profile.wants_to_start_now ?? null,
    pointsAwarded: startPoints,
    maxPoints: 10,
  });

  // Determine tier
  let tier: AgentScoreResult['score_tier'];
  if (total >= 70) {
    tier = 'PROMETEDOR';
  } else if (total >= 40) {
    tier = 'POTENCIAL';
  } else {
    tier = 'NOVATO';
  }

  return {
    score_total: total,
    score_tier: tier,
    score_breakdown: breakdown,
  };
}

/**
 * Parse capital value from various formats
 */
function parseCapital(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  
  const str = String(value).toLowerCase();
  
  // Handle range formats like "300-500", "500+"
  if (str.includes('500') || str.includes('más') || str.includes('+')) return 500;
  if (str.includes('300')) return 300;
  if (str.includes('100')) return 100;
  
  // Try to parse as number
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Parse hours value from various formats
 */
function parseHours(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  
  const str = String(value).toLowerCase();
  
  // Handle range formats like "6+", "3-5", "1-2"
  if (str.includes('6') || str.includes('más') || str.includes('full') || str.includes('+')) return 6;
  if (str.includes('5')) return 5;
  if (str.includes('4')) return 4;
  if (str.includes('3')) return 3;
  if (str.includes('2')) return 2;
  if (str.includes('1')) return 1;
  
  // Try to parse as number
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Extract AgentProfile from raw lead data (normalize aliases)
 */
export function extractAgentProfile(rawData: Record<string, unknown>): AgentProfile {
  // Normalize aliases
  const name = rawData.name || rawData.nombre || null;
  const country = rawData.country || rawData.pais || null;
  
  // Extract whatsapp from various locations
  let whatsapp: string | null = null;
  const contact = rawData.contact as Record<string, unknown> | undefined;
  if (contact?.whatsapp) {
    whatsapp = String(contact.whatsapp);
  } else if (rawData.whatsapp) {
    whatsapp = String(rawData.whatsapp);
  } else if (rawData.telefono) {
    whatsapp = String(rawData.telefono);
  }
  
  // Normalize whatsapp to digits only if present
  if (whatsapp) {
    whatsapp = whatsapp.replace(/[^\d+]/g, '');
  }
  
  // Age confirmation
  const age18 = rawData.age18 ?? rawData.age_confirmed_18plus ?? rawData.mayor_18 ?? rawData.mayor_edad ?? null;
  
  // Capital - check multiple aliases
  const rawCapital = rawData.working_capital_usd ?? rawData.capital_range ?? rawData.capital ?? rawData.banca ?? null;
  const working_capital_usd: string | number | null = rawCapital !== null && typeof rawCapital !== 'object' 
    ? (typeof rawCapital === 'string' || typeof rawCapital === 'number' ? rawCapital : null) 
    : null;
  
  // Hours - check multiple aliases  
  const rawHours = rawData.hours_per_day ?? rawData.availability_hours ?? rawData.horas ?? null;
  const hours_per_day: string | number | null = rawHours !== null && typeof rawHours !== 'object'
    ? (typeof rawHours === 'string' || typeof rawHours === 'number' ? rawHours : null)
    : null;
  
  // Payment methods
  const has_local_payment_methods = rawData.has_local_payment_methods ?? 
    (rawData.payment_methods_knowledge && String(rawData.payment_methods_knowledge) !== 'ninguno' ? true : null);
  
  // Sales experience
  const sales_or_customer_service_exp = rawData.sales_or_customer_service_exp ??
    (rawData.experience && (
      String(rawData.experience).includes('venta') ||
      String(rawData.experience).includes('atencion') ||
      String(rawData.experience).includes('finanza')
    ) ? true : null);
  
  // Casino experience
  const casino_or_betting_exp = rawData.casino_or_betting_exp ??
    (rawData.experience && (
      String(rawData.experience).includes('casino') ||
      String(rawData.experience).includes('apuesta') ||
      String(rawData.experience).includes('plataforma')
    ) ? true : null);
  
  // Wants to start now
  const wants_to_start_now = rawData.wants_to_start_now ?? rawData.quiere_empezar ?? null;
  
  return {
    name: name ? String(name) : null,
    country: country ? String(country) : null,
    whatsapp,
    age18: age18 === true || age18 === 'true' || age18 === 'sí' || age18 === 'si' ? true : 
           age18 === false || age18 === 'false' || age18 === 'no' ? false : null,
    working_capital_usd,
    hours_per_day,
    sales_or_customer_service_exp: sales_or_customer_service_exp === true ? true :
                                   sales_or_customer_service_exp === false ? false : null,
    casino_or_betting_exp: casino_or_betting_exp === true ? true :
                           casino_or_betting_exp === false ? false : null,
    has_local_payment_methods: has_local_payment_methods === true ? true :
                               has_local_payment_methods === false ? false : null,
    wants_to_start_now: wants_to_start_now === true || wants_to_start_now === 'sí' || wants_to_start_now === 'si' ? true :
                        wants_to_start_now === false || wants_to_start_now === 'no' ? false : null,
  };
}

/**
 * Get display color for tier
 */
export function getTierColor(tier: AgentScoreResult['score_tier'] | string | null): string {
  switch (tier) {
    case 'PROMETEDOR':
      return 'text-primary bg-primary/20 border-primary/30';
    case 'POTENCIAL':
      return 'text-gold bg-gold/20 border-gold/30';
    case 'NOVATO':
    default:
      return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
  }
}

/**
 * Get display text for tier
 */
export function getTierText(tier: AgentScoreResult['score_tier'] | string | null): string {
  switch (tier) {
    case 'PROMETEDOR':
      return 'Prometedor';
    case 'POTENCIAL':
      return 'Potencial';
    case 'NOVATO':
      return 'Novato';
    default:
      return tier || 'Sin clasificar';
  }
}
