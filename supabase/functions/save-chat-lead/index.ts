import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentProfile {
  name: string | null;
  country: string | null;
  whatsapp: string | null;
  age18: boolean | null;
  working_capital_usd: number | string | null;
  hours_per_day: number | string | null;
  sales_or_customer_service_exp: boolean | null;
  casino_or_betting_exp: boolean | null;
  has_local_payment_methods: boolean | null;
  wants_to_start_now: boolean | null;
}

interface ScoreBreakdownItem {
  key: string;
  label: string;
  value: boolean | string | number | null;
  pointsAwarded: number;
  maxPoints: number;
}

interface SaveLeadRequest {
  mergedData: Record<string, unknown>;
  debug: {
    intent_detected: string | null;
    missing_fields: string[];
    score_total: number;
    tier: string | null;
  };
  intent: "AGENTE" | "JUGADOR" | "SOPORTE" | null;
  refCode: string | null;
  country: string | null;
  scoreTotal?: number;
  tier?: string | null;
}

// Firebase Admin SDK initialization via JWT signing
const initFirebaseAdmin = async () => {
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON not configured");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore"
  };

  const base64urlEncode = (data: Uint8Array | string): string => {
    let bytes: Uint8Array;
    if (typeof data === 'string') {
      bytes = new TextEncoder().encode(data);
    } else {
      bytes = data;
    }
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const claimsB64 = base64urlEncode(JSON.stringify(claims));
  const unsignedToken = `${headerB64}.${claimsB64}`;
  
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = serviceAccount.private_key
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\n/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c: string) => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signedToken = `${unsignedToken}.${base64urlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedToken,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error("[save-chat-lead] Token exchange failed:", error);
    throw new Error("Failed to get Firebase access token");
  }

  const { access_token } = await tokenResponse.json();
  
  return {
    accessToken: access_token,
    projectId: serviceAccount.project_id,
  };
};

// Parse Firestore document
function parseFirestoreDoc(doc: Record<string, unknown>): Record<string, unknown> | null {
  if (!doc || !doc.fields) return null;
  
  const fields = doc.fields as Record<string, Record<string, unknown>>;
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(value);
  }
  
  return result;
}

function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(String(value.integerValue), 10);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return new Date(String(value.timestampValue));
  if (value.mapValue !== undefined) {
    const fields = (value.mapValue as Record<string, unknown>).fields as Record<string, Record<string, unknown>>;
    if (!fields) return {};
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      result[k] = parseFirestoreValue(v);
    }
    return result;
  }
  if (value.arrayValue !== undefined) {
    const values = (value.arrayValue as Record<string, unknown>).values as Array<Record<string, unknown>>;
    if (!values) return [];
    return values.map(parseFirestoreValue);
  }
  return null;
}

function toFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() };
    }
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(toFirestoreValue)
      }
    };
  }
  if (typeof value === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

// Extract and normalize agent profile from raw data
function extractAgentProfile(rawData: Record<string, unknown>): AgentProfile {
  // Normalize aliases
  const name = rawData.name || rawData.nombre || null;
  const country = rawData.country || rawData.pais || null;
  
  // Extract whatsapp
  let whatsapp: string | null = null;
  const contact = rawData.contact as Record<string, unknown> | undefined;
  if (contact?.whatsapp) {
    whatsapp = String(contact.whatsapp);
  } else if (rawData.whatsapp) {
    whatsapp = String(rawData.whatsapp);
  } else if (rawData.telefono) {
    whatsapp = String(rawData.telefono);
  }
  
  // Normalize whatsapp to digits and + only
  if (whatsapp) {
    whatsapp = whatsapp.replace(/[^\d+]/g, '');
  }
  
  // Age confirmation
  const age18 = rawData.age18 ?? rawData.age_confirmed_18plus ?? rawData.mayor_18 ?? rawData.mayor_edad ?? null;
  
  // Capital
  const rawCapital = rawData.working_capital_usd ?? rawData.capital_range ?? rawData.capital ?? rawData.banca ?? null;
  const working_capital_usd: string | number | null = rawCapital !== null && typeof rawCapital !== 'object' 
    ? (typeof rawCapital === 'string' || typeof rawCapital === 'number' ? rawCapital : null) 
    : null;
  
  // Hours
  const rawHours = rawData.hours_per_day ?? rawData.availability_hours ?? rawData.horas ?? null;
  const hours_per_day: string | number | null = rawHours !== null && typeof rawHours !== 'object'
    ? (typeof rawHours === 'string' || typeof rawHours === 'number' ? rawHours : null)
    : null;
  
  // Payment methods
  let has_local_payment_methods = rawData.has_local_payment_methods ?? null;
  if (has_local_payment_methods === null && rawData.payment_methods_knowledge !== undefined) {
    const level = String(rawData.payment_methods_knowledge).toLowerCase();
    has_local_payment_methods = level !== 'ninguno' && level !== 'no';
  }
  
  // Sales experience
  let sales_or_customer_service_exp = rawData.sales_or_customer_service_exp ?? null;
  if (sales_or_customer_service_exp === null && rawData.experience !== undefined) {
    const exp = String(rawData.experience).toLowerCase();
    if (exp.includes('venta') || exp.includes('atencion') || exp.includes('finanza')) {
      sales_or_customer_service_exp = true;
    }
  }
  
  // Casino experience
  let casino_or_betting_exp = rawData.casino_or_betting_exp ?? null;
  if (casino_or_betting_exp === null && rawData.experience !== undefined) {
    const exp = String(rawData.experience).toLowerCase();
    if (exp.includes('casino') || exp.includes('apuesta') || exp.includes('plataforma') || exp.includes('juego')) {
      casino_or_betting_exp = true;
    }
  }
  
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

// Compute agent score
function computeAgentScore(profile: AgentProfile): { score_total: number; score_tier: string; score_breakdown: ScoreBreakdownItem[] } {
  const breakdown: ScoreBreakdownItem[] = [];
  let total = 0;

  // Helper to parse capital
  const parseCapital = (value: number | string | null): number => {
    if (value === null) return 0;
    if (typeof value === 'number') return value;
    const str = String(value).toLowerCase();
    if (str.includes('500') || str.includes('+') || str.includes('más')) return 500;
    if (str.includes('300')) return 300;
    if (str.includes('100')) return 100;
    return 0;
  };

  // Helper to parse hours
  const parseHours = (value: number | string | null): number => {
    if (value === null) return 0;
    if (typeof value === 'number') return value;
    const str = String(value).toLowerCase();
    if (str.includes('6') || str.includes('+') || str.includes('más')) return 6;
    if (str.includes('5')) return 5;
    if (str.includes('4')) return 4;
    if (str.includes('3')) return 3;
    return 0;
  };

  // 1. Working Capital (30 max)
  const capitalValue = parseCapital(profile.working_capital_usd);
  const capitalPoints = capitalValue >= 300 ? 30 : capitalValue >= 100 ? 15 : 0;
  total += capitalPoints;
  breakdown.push({
    key: 'working_capital_usd',
    label: 'Banca $300+',
    value: profile.working_capital_usd,
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
    value: profile.hours_per_day,
    pointsAwarded: hoursPoints,
    maxPoints: 20,
  });

  // 3. Local payment methods (15 max)
  const paymentPoints = profile.has_local_payment_methods === true ? 15 : 0;
  total += paymentPoints;
  breakdown.push({
    key: 'has_local_payment_methods',
    label: 'Métodos de cobro local',
    value: profile.has_local_payment_methods,
    pointsAwarded: paymentPoints,
    maxPoints: 15,
  });

  // 4. Sales/customer service experience (15 max)
  const salesPoints = profile.sales_or_customer_service_exp === true ? 15 : 0;
  total += salesPoints;
  breakdown.push({
    key: 'sales_or_customer_service_exp',
    label: 'Experiencia atención/ventas',
    value: profile.sales_or_customer_service_exp,
    pointsAwarded: salesPoints,
    maxPoints: 15,
  });

  // 5. Casino/betting experience (10 max)
  const casinoPoints = profile.casino_or_betting_exp === true ? 10 : 0;
  total += casinoPoints;
  breakdown.push({
    key: 'casino_or_betting_exp',
    label: 'Experiencia casinos/apuestas',
    value: profile.casino_or_betting_exp,
    pointsAwarded: casinoPoints,
    maxPoints: 10,
  });

  // 6. Wants to start now (10 max)
  const startPoints = profile.wants_to_start_now === true ? 10 : 0;
  total += startPoints;
  breakdown.push({
    key: 'wants_to_start_now',
    label: 'Quiere empezar ya',
    value: profile.wants_to_start_now,
    pointsAwarded: startPoints,
    maxPoints: 10,
  });

  const score_tier = total >= 70 ? 'PROMETEDOR' : total >= 40 ? 'POTENCIAL' : 'NOVATO';

  return { score_total: total, score_tier, score_breakdown: breakdown };
}

// Get agent by refCode
const getRefCodeDoc = async (
  accessToken: string,
  projectId: string,
  refCode: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/refCodes/${refCode}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error("[save-chat-lead] Failed to get refCode:", await response.text());
    return null;
  }

  return parseFirestoreDoc(await response.json());
};

// Query for active agents by country
const getAgentByCountry = async (
  accessToken: string,
  projectId: string,
  country: string
): Promise<{ uid: string; lineLeaderId: string | null } | null> => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            { fieldFilter: { field: { fieldPath: "isActive" }, op: "EQUAL", value: { booleanValue: true } } },
            { fieldFilter: { field: { fieldPath: "country" }, op: "EQUAL", value: { stringValue: country } } },
          ],
        },
      },
      limit: 20,
    },
  };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(query),
    }
  );

  if (!response.ok) {
    console.error("[save-chat-lead] Country query failed:", await response.text());
    return getAnyActiveAgent(accessToken, projectId);
  }

  const results = await response.json();
  for (const result of results) {
    if (result.document) {
      const parsed = parseFirestoreDoc(result.document);
      if (parsed && (parsed.role === 'AGENT' || parsed.role === 'LINE_LEADER')) {
        return { uid: String(parsed.uid || ''), lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null };
      }
    }
  }

  return getAnyActiveAgent(accessToken, projectId);
};

// Get any active agent (fallback)
const getAnyActiveAgent = async (
  accessToken: string,
  projectId: string
): Promise<{ uid: string; lineLeaderId: string | null } | null> => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      where: { fieldFilter: { field: { fieldPath: "isActive" }, op: "EQUAL", value: { booleanValue: true } } },
      limit: 20,
    },
  };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(query),
    }
  );

  if (!response.ok) return null;

  const results = await response.json();
  for (const result of results) {
    if (result.document) {
      const parsed = parseFirestoreDoc(result.document);
      if (parsed && (parsed.role === 'AGENT' || parsed.role === 'LINE_LEADER')) {
        return { uid: String(parsed.uid || ''), lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null };
      }
    }
  }

  return null;
};

// Create lead document
const createLeadDocument = async (
  accessToken: string,
  projectId: string,
  leadData: Record<string, unknown>
): Promise<string> => {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(leadData)) {
    fields[key] = toFirestoreValue(value);
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/leads`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create lead: ${error}`);
  }

  const doc = await response.json();
  const name = doc.name as string;
  return name.split('/').pop() || '';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as SaveLeadRequest;
    const { mergedData, intent, refCode, country } = body;

    console.log("[save-chat-lead] Processing lead:", { intent, refCode, country });

    // Extract and score agent profile
    const agentProfile = extractAgentProfile(mergedData);
    const { score_total, score_tier, score_breakdown } = computeAgentScore(agentProfile);

    console.log("[save-chat-lead] Computed score:", { score_total, score_tier });

    // Initialize Firebase Admin
    const { accessToken, projectId } = await initFirebaseAdmin();

    let assignedAgentId: string | null = null;
    let assignedLineLeaderId: string | null = null;

    // Try to assign by refCode
    if (refCode) {
      const refCodeDoc = await getRefCodeDoc(accessToken, projectId, refCode);
      if (refCodeDoc && refCodeDoc.active !== false) {
        assignedAgentId = refCodeDoc.agentUid ? String(refCodeDoc.agentUid) : null;
        assignedLineLeaderId = refCodeDoc.lineLeaderId ? String(refCodeDoc.lineLeaderId) : null;
      }
    }

    // Fallback: assign by country
    if (!assignedAgentId && (country || agentProfile.country)) {
      const agent = await getAgentByCountry(accessToken, projectId, String(country || agentProfile.country));
      if (agent) {
        assignedAgentId = agent.uid;
        assignedLineLeaderId = agent.lineLeaderId;
      }
    }

    // Build lead document
    const leadDoc = {
      createdAt: new Date(),
      name: agentProfile.name || 'Sin nombre',
      country: agentProfile.country || country || 'No especificado',
      contact: {
        whatsapp: agentProfile.whatsapp || '',
      },
      intent: intent || 'AGENTE',
      refCode: refCode || null,
      assignedAgentId,
      assignedLineLeaderId,
      status: assignedAgentId ? 'ASIGNADO' : 'NUEVO',
      scoreTotal: score_total,
      tier: score_tier,
      scoreBreakdown: score_breakdown,
      agentProfile,
      rawJson: mergedData,
      origen: 'chat_ia',
    };

    console.log("[save-chat-lead] Creating lead document...");
    const leadId = await createLeadDocument(accessToken, projectId, leadDoc);
    console.log("[save-chat-lead] Lead created with ID:", leadId);

    return new Response(
      JSON.stringify({ success: true, leadId, assignedAgentId, assignedLineLeaderId, score_total, score_tier }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[save-chat-lead] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to save lead";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
