import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate secure temporary password (12-16 chars)
const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const length = 12 + Math.floor(Math.random() * 5); // 12-16 chars
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
  
  // Get access token using service account
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

  // Base64url encode helper
  const base64urlEncode = (data: Uint8Array | string): string => {
    let bytes: Uint8Array;
    if (typeof data === 'string') {
      bytes = new TextEncoder().encode(data);
    } else {
      bytes = data;
    }
    
    // Convert to base64
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    // Convert to base64url
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const claimsB64 = base64urlEncode(JSON.stringify(claims));
  const unsignedToken = `${headerB64}.${claimsB64}`;
  
  // Import private key and sign
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

  // Exchange for access token
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
      body: JSON.stringify({
        email,
        password,
        emailVerified: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("[Firebase Admin] Create user failed:", error);
    throw new Error(error.error?.message || "Failed to create Firebase user");
  }

  const data = await response.json();
  return data.localId; // This is the uid
};

// Create Firestore document
const createFirestoreDoc = async (
  accessToken: string,
  projectId: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> => {
  // Convert data to Firestore format
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[create-agent-user] Starting...");
    
    const body = await req.json();
    const { name, email, country, whatsapp, city, lineLeaderId, canRecruitSubagents, role } = body;

    // Validate required fields
    if (!name || !email || !country) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, country" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-agent-user] Initializing Firebase Admin...");
    const { accessToken, projectId } = await initFirebaseAdmin();
    console.log("[create-agent-user] Firebase Admin initialized for project:", projectId);

    // Generate secure temporary password
    const tempPassword = generateTempPassword();
    console.log("[create-agent-user] Generated temp password");

    // Create Firebase Auth user
    console.log("[create-agent-user] Creating Firebase Auth user...");
    const uid = await createFirebaseUser(accessToken, projectId, email, tempPassword);
    console.log("[create-agent-user] Firebase Auth user created:", uid);

    // Generate unique refCode
    const refCode = generateRefCode();

    // Create user document in Firestore
    const userData = {
      uid,
      name,
      email,
      role: role || "AGENT",
      country,
      city: city || null,
      whatsapp: whatsapp || null,
      isActive: true,
      lineLeaderId: lineLeaderId || null,
      canRecruitSubagents: canRecruitSubagents || false,
      refCode,
      needsPasswordReset: true, // Force password change on first login
      createdAt: new Date(),
    };

    console.log("[create-agent-user] Creating Firestore user document...");
    await createFirestoreDoc(accessToken, projectId, "users", uid, userData);
    console.log("[create-agent-user] Firestore user document created");

    // Create refCode document
    const refCodeData = {
      agentUid: uid,
      lineLeaderId: lineLeaderId || null,
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
        tempPassword, // Only returned once, never stored
        refCode,
        message: "Agent created successfully. Password is temporary and must be changed on first login.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[create-agent-user] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create agent";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
