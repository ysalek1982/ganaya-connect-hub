import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SaveLeadRequest {
  mergedData: Record<string, unknown>;
  debug: {
    intent_detected: string | null;
    missing_fields: string[];
    score_rules: number;
    score_ai: number;
    score_total: number;
    tier: "NOVATO" | "POTENCIAL" | "APROBABLE" | null;
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

// Parse Firestore document to plain object
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

// Convert value to Firestore format
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

// Get agent by refCode from refCodes collection
const getRefCodeDoc = async (
  accessToken: string,
  projectId: string,
  refCode: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/refCodes/${refCode}`,
    {
      headers: { "Authorization": `Bearer ${accessToken}` },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error("[save-chat-lead] Failed to get refCode:", await response.text());
    return null;
  }

  const doc = await response.json();
  return parseFirestoreDoc(doc);
};

// Query for active agents by country (simplified query without orderBy to avoid index requirement)
const getAgentByCountry = async (
  accessToken: string,
  projectId: string,
  country: string
): Promise<{ uid: string; lineLeaderId: string | null } | null> => {
  // Simple query: role = AGENT/LINE_LEADER, isActive = true, country matches
  // Using IN operator for role
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
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    }
  );

  if (!response.ok) {
    console.error("[save-chat-lead] Country query failed:", await response.text());
    return getAnyActiveAgent(accessToken, projectId);
  }

  const results = await response.json();
  
  // Filter client-side for role = AGENT or LINE_LEADER
  for (const result of results) {
    if (result.document) {
      const parsed = parseFirestoreDoc(result.document);
      if (parsed && (parsed.role === 'AGENT' || parsed.role === 'LINE_LEADER')) {
        return {
          uid: String(parsed.uid || ''),
          lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null,
        };
      }
    }
  }

  // Fallback to any active agent
  return getAnyActiveAgent(accessToken, projectId);
};

// Get any active agent (fallback) - simplified without orderBy
const getAnyActiveAgent = async (
  accessToken: string,
  projectId: string
): Promise<{ uid: string; lineLeaderId: string | null } | null> => {
  const query = {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      where: {
        fieldFilter: { 
          field: { fieldPath: "isActive" }, 
          op: "EQUAL", 
          value: { booleanValue: true } 
        },
      },
      limit: 20,
    },
  };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    }
  );

  if (!response.ok) {
    console.error("[save-chat-lead] Fallback query failed:", await response.text());
    return null;
  }

  const results = await response.json();
  
  // Filter client-side for role = AGENT or LINE_LEADER
  for (const result of results) {
    if (result.document) {
      const parsed = parseFirestoreDoc(result.document);
      if (parsed && (parsed.role === 'AGENT' || parsed.role === 'LINE_LEADER')) {
        return {
          uid: String(parsed.uid || ''),
          lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null,
        };
      }
    }
  }

  return null;
};

// Create lead document in Firestore
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
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[save-chat-lead] Create lead failed:", error);
    throw new Error(`Failed to create lead: ${error}`);
  }

  const doc = await response.json();
  // Extract document ID from name: projects/.../documents/leads/DOCID
  const name = doc.name as string;
  const parts = name.split('/');
  return parts[parts.length - 1];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as SaveLeadRequest;
    const { mergedData, debug, intent, refCode, country, scoreTotal, tier } = body;

    console.log("[save-chat-lead] Processing lead:", { intent, refCode, country, scoreTotal, tier });
    console.log("[save-chat-lead] Merged data keys:", Object.keys(mergedData || {}));

    // Initialize Firebase Admin
    const { accessToken, projectId } = await initFirebaseAdmin();
    console.log("[save-chat-lead] Firebase Admin initialized");

    let assignedAgentId: string | null = null;
    let assignedLineLeaderId: string | null = null;

    // Step 1: Try to assign by refCode
    if (refCode) {
      console.log("[save-chat-lead] Looking up refCode:", refCode);
      const refCodeDoc = await getRefCodeDoc(accessToken, projectId, refCode);
      
      if (refCodeDoc && refCodeDoc.active !== false) {
        assignedAgentId = refCodeDoc.agentUid ? String(refCodeDoc.agentUid) : null;
        assignedLineLeaderId = refCodeDoc.lineLeaderId ? String(refCodeDoc.lineLeaderId) : null;
        console.log("[save-chat-lead] Assigned via refCode:", { assignedAgentId, assignedLineLeaderId });
      }
    }

    // Step 2: If no refCode assignment, try by country
    if (!assignedAgentId && country) {
      console.log("[save-chat-lead] Looking up agent by country:", country);
      const agent = await getAgentByCountry(accessToken, projectId, country);
      
      if (agent) {
        assignedAgentId = agent.uid;
        assignedLineLeaderId = agent.lineLeaderId;
        console.log("[save-chat-lead] Assigned via country:", { assignedAgentId, assignedLineLeaderId });
      }
    }

    // Extract contact info
    const contactData = mergedData.contact as Record<string, unknown> | undefined;
    const contact = {
      whatsapp: contactData?.whatsapp ? String(contactData.whatsapp) : 
                (mergedData.whatsapp ? String(mergedData.whatsapp) : 
                (mergedData.telefono ? String(mergedData.telefono) : '')),
      email: mergedData.email ? String(mergedData.email) : undefined,
      telegram: contactData?.telegram ? String(contactData.telegram) : 
                (mergedData.telegram ? String(mergedData.telegram) : undefined),
    };

    // Build the lead document
    const leadDoc = {
      createdAt: new Date(),
      name: String(mergedData.name || mergedData.nombre || 'Sin nombre'),
      country: String(country || mergedData.country || mergedData.pais || 'No especificado'),
      city: mergedData.city || mergedData.ciudad || null,
      contact,
      intent: intent || null,
      refCode: refCode || null,
      assignedAgentId,
      assignedLineLeaderId,
      status: assignedAgentId ? 'ASIGNADO' : 'NUEVO',
      scoreTotal: scoreTotal ?? (debug?.score_total || 0),
      tier: tier || debug?.tier || null,
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
