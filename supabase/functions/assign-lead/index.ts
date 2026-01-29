import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Firebase Admin SDK initialization
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
    console.error("[Firebase Admin] Token exchange failed:", error);
    throw new Error("Failed to get Firebase access token");
  }

  const { access_token } = await tokenResponse.json();
  
  return {
    accessToken: access_token,
    projectId: serviceAccount.project_id,
  };
};

// Query Firestore for refCode
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
    console.error("[Firestore] Failed to get refCode:", await response.text());
    return null;
  }

  const doc = await response.json();
  return parseFirestoreDoc(doc);
};

// Query Firestore for agents by country (simple round-robin)
const getAgentByCountry = async (
  accessToken: string,
  projectId: string,
  country: string
): Promise<{ uid: string; lineLeaderId: string | null } | null> => {
  // Query for active agents in the specified country
  const query = {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            { fieldFilter: { field: { fieldPath: "role" }, op: "IN", value: { arrayValue: { values: [{ stringValue: "AGENT" }, { stringValue: "LINE_LEADER" }] } } } },
            { fieldFilter: { field: { fieldPath: "isActive" }, op: "EQUAL", value: { booleanValue: true } } },
            { fieldFilter: { field: { fieldPath: "country" }, op: "EQUAL", value: { stringValue: country } } },
          ],
        },
      },
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "ASCENDING" }],
      limit: 1,
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
    console.error("[Firestore] Query failed:", await response.text());
    return null;
  }

  const results = await response.json();
  
  if (results.length > 0 && results[0].document) {
    const parsed = parseFirestoreDoc(results[0].document);
    if (parsed) {
      return {
        uid: String(parsed.uid || ''),
        lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null,
      };
    }
  }

  // Try without country filter
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
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            { fieldFilter: { field: { fieldPath: "role" }, op: "IN", value: { arrayValue: { values: [{ stringValue: "AGENT" }, { stringValue: "LINE_LEADER" }] } } } },
            { fieldFilter: { field: { fieldPath: "isActive" }, op: "EQUAL", value: { booleanValue: true } } },
          ],
        },
      },
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "ASCENDING" }],
      limit: 1,
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
    console.error("[Firestore] Fallback query failed:", await response.text());
    return null;
  }

  const results = await response.json();
  
  if (results.length > 0 && results[0].document) {
    const parsed = parseFirestoreDoc(results[0].document);
    if (parsed) {
      return {
        uid: String(parsed.uid || ''),
        lineLeaderId: parsed.lineLeaderId ? String(parsed.lineLeaderId) : null,
      };
    }
  }

  return null;
};

// Update lead with assignment
const updateLeadAssignment = async (
  accessToken: string,
  projectId: string,
  leadId: string,
  assignedAgentId: string,
  assignedLineLeaderId: string | null
): Promise<void> => {
  const updateMask = assignedLineLeaderId 
    ? "updateMask.fieldPaths=assignedAgentId&updateMask.fieldPaths=assignedLineLeaderId&updateMask.fieldPaths=status"
    : "updateMask.fieldPaths=assignedAgentId&updateMask.fieldPaths=status";

  const fields: Record<string, unknown> = {
    assignedAgentId: { stringValue: assignedAgentId },
    status: { stringValue: "ASIGNADO" },
  };

  if (assignedLineLeaderId) {
    fields.assignedLineLeaderId = { stringValue: assignedLineLeaderId };
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/leads/${leadId}?${updateMask}`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    console.error("[Firestore] Update lead failed:", await response.text());
  }
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { leadId, refCode, country } = body;

    console.log("[assign-lead] Processing:", { leadId, refCode, country });

    // Initialize Firebase Admin
    const { accessToken, projectId } = await initFirebaseAdmin();
    console.log("[assign-lead] Firebase Admin initialized");

    let assignedAgentId: string | null = null;
    let assignedLineLeaderId: string | null = null;

    // Step 1: Try to assign by refCode
    if (refCode) {
      console.log("[assign-lead] Looking up refCode:", refCode);
      const refCodeDoc = await getRefCodeDoc(accessToken, projectId, refCode);
      
      if (refCodeDoc && refCodeDoc.active) {
        assignedAgentId = String(refCodeDoc.agentUid || '');
        assignedLineLeaderId = refCodeDoc.lineLeaderId ? String(refCodeDoc.lineLeaderId) : null;
        console.log("[assign-lead] Assigned via refCode:", { assignedAgentId, assignedLineLeaderId });
      }
    }

    // Step 2: If no refCode assignment, try by country
    if (!assignedAgentId && country) {
      console.log("[assign-lead] Looking up agent by country:", country);
      const agent = await getAgentByCountry(accessToken, projectId, country);
      
      if (agent) {
        assignedAgentId = agent.uid;
        assignedLineLeaderId = agent.lineLeaderId;
        console.log("[assign-lead] Assigned via country:", { assignedAgentId, assignedLineLeaderId });
      }
    }

    // Step 3: Update lead if we have an assignment and leadId
    if (leadId && assignedAgentId) {
      await updateLeadAssignment(accessToken, projectId, leadId, assignedAgentId, assignedLineLeaderId);
      console.log("[assign-lead] Lead updated in Firestore");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        assignedAgentId,
        assignedLineLeaderId,
        refCode: refCode || null,
        country: country || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[assign-lead] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to assign lead";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
