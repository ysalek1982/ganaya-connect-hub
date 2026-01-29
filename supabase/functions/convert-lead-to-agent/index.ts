import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate secure temporary password
const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  const length = 14;
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate unique refCode: AGT-XXXXXX
const generateRefCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AGT-${suffix}`;
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
    scope: "https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore"
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
    throw new Error("Failed to get Firebase access token");
  }

  const { access_token } = await tokenResponse.json();
  
  return {
    accessToken: access_token,
    projectId: serviceAccount.project_id,
  };
};

// Get lead document
const getLeadDoc = async (
  accessToken: string,
  projectId: string,
  leadId: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/leads/${leadId}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );

  if (!response.ok) return null;
  
  const doc = await response.json();
  if (!doc.fields) return null;
  
  const parseValue = (val: Record<string, unknown>): unknown => {
    if (val.stringValue !== undefined) return val.stringValue;
    if (val.integerValue !== undefined) return parseInt(String(val.integerValue), 10);
    if (val.booleanValue !== undefined) return val.booleanValue;
    if (val.nullValue !== undefined) return null;
    if (val.timestampValue !== undefined) return new Date(String(val.timestampValue));
    if (val.mapValue) {
      const fields = (val.mapValue as Record<string, unknown>).fields as Record<string, Record<string, unknown>>;
      if (!fields) return {};
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fields)) {
        result[k] = parseValue(v);
      }
      return result;
    }
    return null;
  };
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = parseValue(value as Record<string, unknown>);
  }
  
  return result;
};

// Get user document
const getUserDoc = async (
  accessToken: string,
  projectId: string,
  uid: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );

  if (!response.ok) return null;
  
  const doc = await response.json();
  if (!doc.fields) return null;
  
  const parseValue = (val: Record<string, unknown>): unknown => {
    if (val.stringValue !== undefined) return val.stringValue;
    if (val.booleanValue !== undefined) return val.booleanValue;
    return null;
  };
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = parseValue(value as Record<string, unknown>);
  }
  
  return result;
};

// Create Firebase Auth user
const createFirebaseUser = async (
  accessToken: string,
  projectId: string,
  email: string,
  password: string
): Promise<string> => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, emailVerified: true }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    const errorCode = error.error?.message || "UNKNOWN_ERROR";
    if (errorCode === "EMAIL_EXISTS") {
      throw new Error("Este email ya está registrado");
    }
    throw new Error(`Error de Firebase: ${errorCode}`);
  }

  const data = await response.json();
  return data.localId;
};

// Firestore value converter
const toFirestoreValue = (value: unknown): Record<string, unknown> => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (typeof value === "string") return { stringValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toFirestoreValue(v)])
        ),
      },
    };
  }
  return { stringValue: String(value) };
};

// Create Firestore document
const createFirestoreDoc = async (
  accessToken: string,
  projectId: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> => {
  const fields = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, toFirestoreValue(v)])
  );

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?documentId=${docId}`,
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
    const error = await response.json();
    throw new Error(error.error?.message || `Failed to create ${collection} document`);
  }
};

// Update Firestore document
const updateFirestoreDoc = async (
  accessToken: string,
  projectId: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> => {
  const fields = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, toFirestoreValue(v)])
  );

  const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?${updateMask}`,
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
    const error = await response.json();
    console.error(`[Firestore] Update ${collection}/${docId} failed:`, error);
    throw new Error(error.error?.message || `Failed to update ${collection} document`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[convert-lead-to-agent] Starting...");
    
    const body = await req.json();
    const { leadId, callerUid, roleToCreate = "AGENT" } = body;

    if (!leadId) {
      return new Response(
        JSON.stringify({ error: "Missing leadId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { accessToken, projectId } = await initFirebaseAdmin();
    console.log("[convert-lead-to-agent] Firebase Admin initialized");

    // Get lead data
    const lead = await getLeadDoc(accessToken, projectId, leadId);
    if (!lead) {
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[convert-lead-to-agent] Lead found:", lead.name);

    // Verify caller permissions if provided
    if (callerUid) {
      const callerUser = await getUserDoc(accessToken, projectId, callerUid);
      if (!callerUser) {
        return new Response(
          JSON.stringify({ error: "Caller not found" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const callerRole = callerUser.role as string;
      const canRecruitSubagents = callerUser.canRecruitSubagents === true;
      const isLeadOwner = lead.assignedAgentId === callerUid || lead.assignedLineLeaderId === callerUid;

      if (callerRole !== "ADMIN" && !(isLeadOwner && canRecruitSubagents)) {
        return new Response(
          JSON.stringify({ error: "No permission to convert this lead" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Extract contact info
    const contact = lead.contact as Record<string, unknown> || {};
    const rawJson = lead.rawJson as Record<string, unknown> || {};
    const agentProfile = rawJson.agentProfile as Record<string, unknown> || rawJson;
    
    const name = String(lead.name || agentProfile.name || 'Nuevo Agente');
    const whatsapp = String(contact.whatsapp || agentProfile.whatsapp || '');
    const email = String(contact.email || agentProfile.email || `${name.toLowerCase().replace(/\s+/g, '.')}${Date.now()}@temp.ganaya.bet`);
    const country = String(lead.country || agentProfile.country || 'Paraguay');
    const city = lead.city ? String(lead.city) : null;

    // Generate credentials
    const tempPassword = generateTempPassword();
    const refCode = generateRefCode();

    console.log("[convert-lead-to-agent] Creating Firebase Auth user...");
    const newUid = await createFirebaseUser(accessToken, projectId, email, tempPassword);
    console.log("[convert-lead-to-agent] User created:", newUid);

    // Determine line leader
    const lineLeaderId = lead.assignedAgentId || lead.assignedLineLeaderId || null;

    // Create user document
    const userData = {
      uid: newUid,
      name,
      email,
      role: roleToCreate,
      country,
      city,
      whatsapp,
      isActive: true,
      lineLeaderId,
      canRecruitSubagents: false,
      refCode,
      referralUrl: `https://ganaya-connect-hub.lovable.app/?ref=${refCode}`,
      needsPasswordReset: true,
      publicContact: { whatsapp, contactLabel: name },
      createdAt: new Date(),
    };

    console.log("[convert-lead-to-agent] Creating Firestore user document...");
    await createFirestoreDoc(accessToken, projectId, "users", newUid, userData);

    // Create refCode document
    const refCodeData = {
      agentUid: newUid,
      lineLeaderId,
      active: true,
      createdAt: new Date(),
    };
    await createFirestoreDoc(accessToken, projectId, "refCodes", refCode, refCodeData);

    // Update lead status
    console.log("[convert-lead-to-agent] Updating lead status...");
    await updateFirestoreDoc(accessToken, projectId, "leads", leadId, {
      status: "ONBOARDED",
      createdAgentUid: newUid,
      onboardedAt: new Date(),
    });

    console.log("[convert-lead-to-agent] Success!");

    return new Response(
      JSON.stringify({
        success: true,
        uid: newUid,
        email,
        tempPassword,
        refCode,
        referralUrl: userData.referralUrl,
        message: "Agent created successfully. Temporary password must be changed on first login.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[convert-lead-to-agent] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to convert lead";
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
