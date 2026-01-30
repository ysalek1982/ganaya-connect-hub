import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ TYPES ============

interface QuestionOption {
  value: string;
  label: string;
  points: number;
}

interface ScoringRule {
  condition: string;
  value?: string | number | boolean;
  points: number;
}

interface ChatQuestion {
  id: string;
  label: string;
  prompt: string;
  type: "text" | "select" | "boolean" | "number";
  required: boolean;
  options?: QuestionOption[];
  scoring?: { rules: ScoringRule[] };
  storeKey?: string;
  order: number;
}

interface ChatConfig {
  id: string;
  name: string;
  isActive: boolean;
  version: number;
  thresholds: {
    prometedorMin: number;
    potencialMin: number;
  };
  questions: ChatQuestion[];
}

interface ScoreBreakdownItem {
  key: string;
  label: string;
  value: unknown;
  pointsAwarded: number;
  maxPoints: number;
}

interface SaveLeadRequest {
  mergedData: Record<string, unknown>;
  debug?: Record<string, unknown>;
  intent: "AGENTE" | null;
  refCode: string | null;
  campaignId?: string | null;
  country: string | null;
  scoreTotal?: number;
  tier?: string | null;
  tracking?: Record<string, string>; // UTM params
}

// ============ FIREBASE ADMIN ============

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

// ============ FIRESTORE HELPERS ============

function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(String(value.integerValue), 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
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

// ============ LOAD CONFIG ============

async function loadConfig(
  accessToken: string, 
  projectId: string, 
  configId?: string
): Promise<ChatConfig | null> {
  try {
    // If specific configId provided, load that one
    if (configId && configId !== 'default') {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/chat_configs/${configId}`,
        { headers: { "Authorization": `Bearer ${accessToken}` } }
      );

      if (response.ok) {
        const doc = await response.json();
        const fields = doc.fields as Record<string, Record<string, unknown>>;
        const parsed: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          parsed[key] = parseFirestoreValue(value);
        }

        return {
          id: configId,
          name: String(parsed.name || 'Config'),
          isActive: Boolean(parsed.isActive),
          version: Number(parsed.version || 1),
          thresholds: (parsed.thresholds as ChatConfig['thresholds']) || { prometedorMin: 70, potencialMin: 40 },
          questions: ((parsed.questions as ChatQuestion[]) || []).sort((a, b) => a.order - b.order),
        };
      }
    }

    // Otherwise load active config
    const query = {
      structuredQuery: {
        from: [{ collectionId: "chat_configs" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "isActive" },
            op: "EQUAL",
            value: { booleanValue: true }
          }
        },
        limit: 1
      }
    };

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${accessToken}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(query),
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    for (const result of results) {
      if (result.document) {
        const fields = result.document.fields as Record<string, Record<string, unknown>>;
        const docName = result.document.name as string;
        const docId = docName.split('/').pop() || '';
        
        const parsed: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          parsed[key] = parseFirestoreValue(value);
        }

        return {
          id: docId,
          name: String(parsed.name || 'Config'),
          isActive: true,
          version: Number(parsed.version || 1),
          thresholds: (parsed.thresholds as ChatConfig['thresholds']) || { prometedorMin: 70, potencialMin: 40 },
          questions: ((parsed.questions as ChatQuestion[]) || []).sort((a, b) => a.order - b.order),
        };
      }
    }

    return null;
  } catch (error) {
    console.error("[save-chat-lead] Error loading config:", error);
    return null;
  }
}

// ============ RECALCULATE SCORE ============

function recalculateScore(
  answers: Record<string, unknown>,
  config: ChatConfig
): { scoreTotal: number; tier: string; scoreBreakdown: ScoreBreakdownItem[] } {
  const breakdown: ScoreBreakdownItem[] = [];
  let total = 0;

  for (const question of config.questions) {
    const answerValue = answers[question.id] ?? answers[question.storeKey || ''];
    let pointsAwarded = 0;
    let maxPoints = 0;

    if (question.type === 'select' && question.options) {
      maxPoints = Math.max(...question.options.map(o => o.points), 0);
      const selectedOption = question.options.find(o => 
        o.value === answerValue || o.label === answerValue
      );
      if (selectedOption) {
        pointsAwarded = selectedOption.points;
      }
    } else if (question.type === 'boolean' && question.scoring?.rules) {
      for (const rule of question.scoring.rules) {
        if (rule.condition === '==' && rule.value === true) {
          maxPoints = rule.points;
          if (answerValue === true) {
            pointsAwarded = rule.points;
          }
        }
      }
    } else if (question.type === 'number' && question.scoring?.rules) {
      const numValue = typeof answerValue === 'number' ? answerValue : parseFloat(String(answerValue || '0'));
      maxPoints = Math.max(...question.scoring.rules.map(r => r.points), 0);
      for (const rule of question.scoring.rules) {
        const ruleValue = Number(rule.value);
        let matched = false;
        if (rule.condition === '>=' && numValue >= ruleValue) matched = true;
        if (rule.condition === '>' && numValue > ruleValue) matched = true;
        if (rule.condition === '<=' && numValue <= ruleValue) matched = true;
        if (rule.condition === '<' && numValue < ruleValue) matched = true;
        if (rule.condition === '==' && numValue === ruleValue) matched = true;
        if (matched && rule.points > pointsAwarded) {
          pointsAwarded = rule.points;
        }
      }
    }

    if (maxPoints > 0 || pointsAwarded > 0) {
      breakdown.push({
        key: question.id,
        label: question.label,
        value: answerValue ?? null,
        pointsAwarded,
        maxPoints,
      });
    }

    total += pointsAwarded;
  }

  const tier = total >= config.thresholds.prometedorMin 
    ? "PROMETEDOR" 
    : total >= config.thresholds.potencialMin 
      ? "POTENCIAL" 
      : "NOVATO";

  return { scoreTotal: total, tier, scoreBreakdown: breakdown };
}

// ============ ASSIGNMENT LOGIC ============

async function getRefCodeDoc(
  accessToken: string,
  projectId: string,
  refCode: string
): Promise<Record<string, unknown> | null> {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/refCodes/${refCode}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );

  if (response.status === 404) return null;
  if (!response.ok) return null;

  const doc = await response.json();
  if (!doc.fields) return null;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc.fields as Record<string, Record<string, unknown>>)) {
    result[key] = parseFirestoreValue(value);
  }
  return result;
}

async function getAgentDoc(
  accessToken: string,
  projectId: string,
  agentUid: string
): Promise<Record<string, unknown> | null> {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${agentUid}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );

  if (response.status === 404) return null;
  if (!response.ok) return null;

  const doc = await response.json();
  if (!doc.fields) return null;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc.fields as Record<string, Record<string, unknown>>)) {
    result[key] = parseFirestoreValue(value);
  }
  return result;
}

async function getAgentByCountry(
  accessToken: string,
  projectId: string,
  country: string
): Promise<{ uid: string; lineLeaderId: string | null } | null> {
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

  if (!response.ok) return getAnyActiveAgent(accessToken, projectId);

  const results = await response.json();
  for (const result of results) {
    if (result.document) {
      const fields = result.document.fields as Record<string, Record<string, unknown>>;
      const parsed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        parsed[key] = parseFirestoreValue(value);
      }
      if (parsed.role === 'AGENT' || parsed.role === 'LINE_LEADER') {
        return { uid: String(parsed.uid || ''), lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null };
      }
    }
  }

  return getAnyActiveAgent(accessToken, projectId);
}

async function getAnyActiveAgent(
  accessToken: string,
  projectId: string
): Promise<{ uid: string; lineLeaderId: string | null } | null> {
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
      const fields = result.document.fields as Record<string, Record<string, unknown>>;
      const parsed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        parsed[key] = parseFirestoreValue(value);
      }
      if (parsed.role === 'AGENT' || parsed.role === 'LINE_LEADER') {
        return { uid: String(parsed.uid || ''), lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null };
      }
    }
  }

  return null;
}

// ============ BUILD UPLINE ARRAY ============

async function buildUplineArray(
  accessToken: string,
  projectId: string,
  agentUid: string | null,
  lineLeaderId: string | null,
  maxLevels: number = 5
): Promise<string[]> {
  const upline: string[] = [];
  
  if (agentUid) {
    upline.push(agentUid);
  }
  
  let currentLeaderId = lineLeaderId;
  let level = 0;
  
  while (currentLeaderId && level < maxLevels) {
    upline.push(currentLeaderId);
    
    // Fetch the leader's document to get their lineLeaderId
    const leaderDoc = await getAgentDoc(accessToken, projectId, currentLeaderId);
    if (!leaderDoc) break;
    
    currentLeaderId = leaderDoc.lineLeaderId ? String(leaderDoc.lineLeaderId) : null;
    if (currentLeaderId === '' || currentLeaderId === 'null') currentLeaderId = null;
    level++;
  }
  
  return upline;
}

// ============ CREATE LEAD ============

async function createLeadDocument(
  accessToken: string,
  projectId: string,
  leadData: Record<string, unknown>
): Promise<string> {
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
}

// ============ MAIN HANDLER ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as SaveLeadRequest;
    const { mergedData, intent, refCode, campaignId, country, tracking } = body;

    console.log("[save-chat-lead] Processing lead:", { intent, refCode, campaignId, country, tracking });

    // Initialize Firebase Admin
    const { accessToken, projectId } = await initFirebaseAdmin();

    // Extract answers from mergedData - support both question.id and storeKey formats
    const answers = (mergedData.answers || mergedData) as Record<string, unknown>;
    const chatConfigId = mergedData.chatConfigId as string | undefined;
    const chatConfigVersion = mergedData.chatConfigVersion as number | undefined;

    // Load config for recalculating score
    const config = await loadConfig(accessToken, projectId, chatConfigId);
    
    let scoreTotal: number;
    let tier: string;
    let scoreBreakdown: ScoreBreakdownItem[];

    if (config && config.questions.length > 0) {
      // Recalculate score server-side using config
      const recalculated = recalculateScore(answers, config);
      scoreTotal = recalculated.scoreTotal;
      tier = recalculated.tier;
      scoreBreakdown = recalculated.scoreBreakdown;
      console.log("[save-chat-lead] Recalculated score from config:", { scoreTotal, tier });
    } else {
      // Use values from frontend if no config available
      scoreTotal = (mergedData.scoreTotal as number) || (body.scoreTotal as number) || 0;
      tier = (mergedData.tier as string) || body.tier || 'NOVATO';
      scoreBreakdown = (mergedData.scoreBreakdown as ScoreBreakdownItem[]) || [];
      console.log("[save-chat-lead] Using frontend score (no config):", { scoreTotal, tier });
    }

    // Extract applicant info with robust fallbacks for both id and storeKey
    const name = answers.name || answers.nombre || mergedData.name || mergedData.nombre || 'Sin nombre';
    const applicantCountry = answers.country || answers.pais || mergedData.country || mergedData.pais || country || 'No especificado';
    const whatsapp = answers.whatsapp || answers.telefono || answers.phone || mergedData.whatsapp || mergedData.telefono || '';
    const age18 = answers.age18 ?? mergedData.age18 ?? null;

    // Assignment logic
    let assignedAgentId: string | null = null;
    let assignedLineLeaderId: string | null = null;

    if (refCode) {
      const refCodeDoc = await getRefCodeDoc(accessToken, projectId, refCode);
      if (refCodeDoc && refCodeDoc.active !== false) {
        assignedAgentId = refCodeDoc.agentUid ? String(refCodeDoc.agentUid) : null;
        assignedLineLeaderId = refCodeDoc.lineLeaderId ? String(refCodeDoc.lineLeaderId) : null;
      }
    }

    if (!assignedAgentId && applicantCountry) {
      const agent = await getAgentByCountry(accessToken, projectId, String(applicantCountry));
      if (agent) {
        assignedAgentId = agent.uid;
        assignedLineLeaderId = agent.lineLeaderId;
      }
    }

    // Build upline array for multi-level network visibility (up to 5 levels)
    const upline = await buildUplineArray(accessToken, projectId, assignedAgentId, assignedLineLeaderId, 5);
    console.log("[save-chat-lead] Built upline array:", upline);

    // Build lead document - status is ALWAYS 'NUEVO', use isAssigned for assignment tracking
    const leadDoc = {
      createdAt: new Date(),
      type: 'AGENT_RECRUITMENT',
      name: String(name),
      country: String(applicantCountry),
      contact: { whatsapp: String(whatsapp) },
      intent: intent || 'AGENTE',
      refCode: refCode || null,
      campaignId: campaignId || null,
      assignedAgentId,
      assignedLineLeaderId,
      upline, // Multi-level network visibility
      isAssigned: !!assignedAgentId, // Boolean flag for assignment
      status: 'NUEVO', // Always NUEVO on creation
      scoreTotal,
      tier,
      scoreBreakdown,
      chatConfigId: chatConfigId || null,
      chatConfigVersion: chatConfigVersion || null,
      answers,
      applicant: {
        name: String(name),
        whatsapp: String(whatsapp),
        country: String(applicantCountry),
        age18: age18,
      },
      tracking: tracking || {}, // UTM and campaign tracking
      rawJson: mergedData,
      origen: 'chat_ia',
    };

    console.log("[save-chat-lead] Creating lead document...");
    const leadId = await createLeadDocument(accessToken, projectId, leadDoc);
    console.log("[save-chat-lead] Lead created with ID:", leadId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId, 
        assignedAgentId, 
        assignedLineLeaderId,
        upline,
        scoreTotal, 
        tier,
        scoreBreakdown,
      }),
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
