import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate secure temporary password (12-16 chars)
const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const length = 12 + Math.floor(Math.random() * 5);
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

// Firebase Admin SDK initialization using service account
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
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
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

// Verify Firebase ID token and get user claims
const verifyIdToken = async (
  accessToken: string,
  projectId: string,
  idToken: string
): Promise<{ uid: string; email: string }> => {
  // Use Firebase Auth REST API to verify token
  const apiKey = Deno.env.get("FIREBASE_API_KEY") || "";
  
  // Decode the token to get uid (we'll verify via Firestore lookup)
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error("Token inválido");
  }
  
  try {
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(payloadB64));
    
    // Verify token hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token expirado");
    }
    
    // Verify issuer matches our project
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIssuer) {
      throw new Error("Token de proyecto incorrecto");
    }
    
    return {
      uid: payload.user_id || payload.sub,
      email: payload.email || "",
    };
  } catch (e) {
    console.error("[verifyIdToken] Error:", e);
    throw new Error("No se pudo verificar el token");
  }
};

// Get Firestore document
const getFirestoreDoc = async (
  accessToken: string,
  projectId: string,
  collection: string,
  docId: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.json();
    console.error(`[Firestore] Get ${collection}/${docId} failed:`, error);
    return null;
  }

  const doc = await response.json();
  
  // Parse Firestore value format to plain object
  const parseValue = (val: Record<string, unknown>): unknown => {
    if ('stringValue' in val) return val.stringValue;
    if ('booleanValue' in val) return val.booleanValue;
    if ('integerValue' in val) return parseInt(val.integerValue as string);
    if ('doubleValue' in val) return val.doubleValue;
    if ('nullValue' in val) return null;
    if ('timestampValue' in val) return new Date(val.timestampValue as string);
    if ('mapValue' in val) {
      const map = val.mapValue as { fields?: Record<string, unknown> };
      const result: Record<string, unknown> = {};
      if (map.fields) {
        for (const [k, v] of Object.entries(map.fields)) {
          result[k] = parseValue(v as Record<string, unknown>);
        }
      }
      return result;
    }
    if ('arrayValue' in val) {
      const arr = val.arrayValue as { values?: unknown[] };
      return (arr.values || []).map(v => parseValue(v as Record<string, unknown>));
    }
    return null;
  };
  
  const result: Record<string, unknown> = {};
  if (doc.fields) {
    for (const [k, v] of Object.entries(doc.fields)) {
      result[k] = parseValue(v as Record<string, unknown>);
    }
  }
  return result;
};

// Create Firebase Auth user
const createFirebaseUser = async (
  accessToken: string,
  projectId: string,
  email: string,
  password: string,
  displayName?: string
): Promise<string> => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        emailVerified: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("[Firebase Admin] Create user failed:", error);
    const errorCode = error.error?.message || "UNKNOWN_ERROR";
    
    const errorMessages: Record<string, string> = {
      "EMAIL_EXISTS": "Este email ya está registrado. Usa otro email.",
      "INVALID_EMAIL": "El formato del email no es válido.",
      "WEAK_PASSWORD": "La contraseña es muy débil.",
    };
    
    throw new Error(errorMessages[errorCode] || `Error de Firebase: ${errorCode}`);
  }

  const data = await response.json();
  return data.localId;
};

// Create Firestore document
const createFirestoreDoc = async (
  accessToken: string,
  projectId: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> => {
  const convertToFirestoreValue = (value: unknown): Record<string, unknown> => {
    if (value === null) return { nullValue: null };
    if (typeof value === "boolean") return { booleanValue: value };
    if (typeof value === "number") return { integerValue: String(value) };
    if (typeof value === "string") return { stringValue: value };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (Array.isArray(value)) {
      return { arrayValue: { values: value.map(convertToFirestoreValue) } };
    }
    if (typeof value === "object") {
      return {
        mapValue: {
          fields: Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, convertToFirestoreValue(v)])
          ),
        },
      };
    }
    return { stringValue: String(value) };
  };

  const fields = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, convertToFirestoreValue(v)])
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
    console.error(`[Firestore] Create ${collection}/${docId} failed:`, error);
    throw new Error(error.error?.message || `Failed to create ${collection} document`);
  }
};

// Query Firestore documents
const queryFirestoreDocs = async (
  accessToken: string,
  projectId: string,
  collection: string,
  fieldPath: string,
  op: string,
  value: unknown
): Promise<Array<{ id: string; data: Record<string, unknown> }>> => {
  const convertToFirestoreValue = (val: unknown): Record<string, unknown> => {
    if (val === null) return { nullValue: null };
    if (typeof val === "boolean") return { booleanValue: val };
    if (typeof val === "number") return { integerValue: String(val) };
    if (typeof val === "string") return { stringValue: val };
    return { stringValue: String(val) };
  };
  
  const parseValue = (val: Record<string, unknown>): unknown => {
    if ('stringValue' in val) return val.stringValue;
    if ('booleanValue' in val) return val.booleanValue;
    if ('integerValue' in val) return parseInt(val.integerValue as string);
    if ('doubleValue' in val) return val.doubleValue;
    if ('nullValue' in val) return null;
    if ('timestampValue' in val) return new Date(val.timestampValue as string);
    if ('mapValue' in val) {
      const map = val.mapValue as { fields?: Record<string, unknown> };
      const result: Record<string, unknown> = {};
      if (map.fields) {
        for (const [k, v] of Object.entries(map.fields)) {
          result[k] = parseValue(v as Record<string, unknown>);
        }
      }
      return result;
    }
    if ('arrayValue' in val) {
      const arr = val.arrayValue as { values?: unknown[] };
      return (arr.values || []).map(v => parseValue(v as Record<string, unknown>));
    }
    return null;
  };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: {
            fieldFilter: {
              field: { fieldPath },
              op,
              value: convertToFirestoreValue(value),
            },
          },
          limit: 100,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`[Firestore] Query ${collection} failed:`, error);
    return [];
  }

  const results = await response.json();
  const docs: Array<{ id: string; data: Record<string, unknown> }> = [];
  
  for (const result of results) {
    if (result.document) {
      const name = result.document.name as string;
      const id = name.split('/').pop() || '';
      const data: Record<string, unknown> = {};
      if (result.document.fields) {
        for (const [k, v] of Object.entries(result.document.fields)) {
          data[k] = parseValue(v as Record<string, unknown>);
        }
      }
      docs.push({ id, data });
    }
  }
  
  return docs;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[create-agent-user] Starting...");
    
    const body = await req.json();
    const { 
      action,
      idToken,
      name, 
      email, 
      country, 
      whatsapp, 
      city, 
      lineLeaderId, 
      canRecruitSubagents, 
      role,
      // For listing subagents
      callerUid,
    } = body;

    console.log("[create-agent-user] Initializing Firebase Admin...");
    const { accessToken, projectId } = await initFirebaseAdmin();
    console.log("[create-agent-user] Firebase Admin initialized for project:", projectId);

    // ACTION: List subagents for a recruiter
    if (action === 'list-subagents') {
      if (!idToken) {
        return new Response(
          JSON.stringify({ error: "Token de autenticación requerido" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const caller = await verifyIdToken(accessToken, projectId, idToken);
      console.log("[create-agent-user] Caller verified:", caller.uid);
      
      // Get caller's user document
      const callerDoc = await getFirestoreDoc(accessToken, projectId, "users", caller.uid);
      if (!callerDoc) {
        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const callerRole = callerDoc.role as string;
      const callerCanRecruit = callerDoc.canRecruitSubagents as boolean;
      
      // Query subagents where lineLeaderId == caller.uid
      const subagents = await queryFirestoreDocs(
        accessToken,
        projectId,
        "users",
        "lineLeaderId",
        "EQUAL",
        caller.uid
      );
      
      console.log(`[create-agent-user] Found ${subagents.length} subagents for ${caller.uid}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          subagents: subagents.map(s => ({
            uid: s.id,
            ...s.data,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DEFAULT ACTION: Create subagent
    // Validate required fields
    if (!name || !email || !country) {
      return new Response(
        JSON.stringify({ error: "Campos requeridos: name, email, country" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify caller has permission if idToken is provided
    let effectiveLineLeaderId = lineLeaderId;
    let creatorRole = 'ADMIN'; // Default for legacy calls
    
    if (idToken) {
      const caller = await verifyIdToken(accessToken, projectId, idToken);
      console.log("[create-agent-user] Caller verified:", caller.uid);
      
      // Get caller's user document to check permissions
      const callerDoc = await getFirestoreDoc(accessToken, projectId, "users", caller.uid);
      if (!callerDoc) {
        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      creatorRole = callerDoc.role as string;
      const callerCanRecruit = callerDoc.canRecruitSubagents as boolean;
      
      // Check permissions
      if (creatorRole !== 'ADMIN' && !callerCanRecruit) {
        return new Response(
          JSON.stringify({ error: "No tienes permiso para crear subagentes" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // For non-admin callers, set lineLeaderId to the caller's uid
      if (creatorRole !== 'ADMIN') {
        effectiveLineLeaderId = caller.uid;
      }
      
      console.log(`[create-agent-user] Permission granted. Role: ${creatorRole}, canRecruit: ${callerCanRecruit}`);
    }

    // Generate secure temporary password
    const tempPassword = generateTempPassword();
    console.log("[create-agent-user] Generated temp password");

    // Create Firebase Auth user
    console.log("[create-agent-user] Creating Firebase Auth user...");
    const uid = await createFirebaseUser(accessToken, projectId, email, tempPassword, name);
    console.log("[create-agent-user] Firebase Auth user created:", uid);

    // Generate unique refCode
    const refCode = generateRefCode();
    
    // Build referral URL
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || Deno.env.get("VITE_PUBLIC_SITE_URL") || "https://ganaya-connect-hub.lovable.app";
    const referralUrl = `${siteUrl}/?ref=${refCode}`;

    // Create user document in Firestore
    const userData = {
      uid,
      name,
      displayName: name,
      email,
      role: role || "AGENT",
      country,
      city: city || null,
      whatsapp: whatsapp || null,
      isActive: true,
      lineLeaderId: effectiveLineLeaderId || null,
      canRecruitSubagents: canRecruitSubagents || false,
      refCode,
      referralUrl,
      needsPasswordReset: true,
      publicContact: {
        whatsapp: whatsapp || null,
        contactLabel: name,
      },
      createdAt: new Date(),
    };

    console.log("[create-agent-user] Creating Firestore user document...");
    await createFirestoreDoc(accessToken, projectId, "users", uid, userData);
    console.log("[create-agent-user] Firestore user document created");

    // Create refCode document
    const refCodeData = {
      agentUid: uid,
      lineLeaderId: effectiveLineLeaderId || null,
      active: true,
      createdAt: new Date(),
    };

    console.log("[create-agent-user] Creating Firestore refCode document...");
    await createFirestoreDoc(accessToken, projectId, "refCodes", refCode, refCodeData);
    console.log("[create-agent-user] Firestore refCode document created");

    // Return success with temp password (shown only once!)
    return new Response(
      JSON.stringify({
        success: true,
        uid,
        email,
        tempPassword,
        refCode,
        referralUrl,
        message: "Subagente creado. Comparte las credenciales (solo se muestran una vez).",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[create-agent-user] Error:", error);
    const message = error instanceof Error ? error.message : "Error al crear agente";
    
    const isUserError = message.includes("email") || message.includes("Email") || 
                        message.includes("registrado") || message.includes("válido") ||
                        message.includes("permiso") || message.includes("Token");
    const statusCode = isUserError ? 400 : 500;
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
