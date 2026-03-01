import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin bootstrap email from environment or hardcoded
const ADMIN_BOOTSTRAP_EMAIL = Deno.env.get("ADMIN_BOOTSTRAP_EMAIL") || "ysalek@gmail.com";

// Generate unique refCode: AGT-XXXXXX
const generateRefCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AGT-${suffix}`;
};

const resolvePublicSiteUrl = (requestSiteUrl?: string): string => {
  if (requestSiteUrl) {
    try {
      const parsed = new URL(requestSiteUrl);
      return `${parsed.protocol}//${parsed.host}`.replace(/\/$/, "");
    } catch { /* ignore */ }
  }

  const rawUrl = Deno.env.get("PUBLIC_SITE_URL") || Deno.env.get("VITE_PUBLIC_SITE_URL") || "";
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      return `${parsed.protocol}//${parsed.host}`.replace(/\/$/, "");
    } catch { /* ignore */ }
  }

  return "https://ganaya.bet";
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
    scope: "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit"
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

// Verify Firebase ID token
const verifyIdToken = async (
  accessToken: string,
  projectId: string,
  idToken: string
): Promise<{ uid: string; email: string } | null> => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${Deno.env.get("FIREBASE_WEB_API_KEY") || ""}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  // Fallback: Use Admin SDK to verify
  if (!response.ok) {
    // Try using the token to get user info directly via REST
    const adminVerifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!adminVerifyResponse.ok) {
      console.error("[ensure-profile] Token verification failed:", await adminVerifyResponse.text());
      return null;
    }

    const data = await adminVerifyResponse.json();
    if (data.users && data.users[0]) {
      return {
        uid: data.users[0].localId,
        email: data.users[0].email || "",
      };
    }
    return null;
  }

  const data = await response.json();
  if (data.users && data.users[0]) {
    return {
      uid: data.users[0].localId,
      email: data.users[0].email || "",
    };
  }

  return null;
};

// Check if user document exists
const getUserDoc = async (
  accessToken: string,
  projectId: string,
  uid: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    {
      headers: { "Authorization": `Bearer ${accessToken}` },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error("[Firestore] Failed to get user:", await response.text());
    return null;
  }

  return await response.json();
};

// Create user document
const createUserDoc = async (
  accessToken: string,
  projectId: string,
  uid: string,
  email: string,
  role: string,
  refCode: string | null,
  referralUrl: string | null
): Promise<void> => {
  const now = new Date().toISOString();
  
  const fields: Record<string, unknown> = {
    uid: { stringValue: uid },
    email: { stringValue: email },
    name: { stringValue: email.split('@')[0] || 'Usuario' },
    role: { stringValue: role },
    country: { stringValue: '' },
    isActive: { booleanValue: true },
    lineLeaderId: { nullValue: null },
    canRecruitSubagents: { booleanValue: role === 'ADMIN' },
    refCode: refCode ? { stringValue: refCode } : { nullValue: null },
    referralUrl: referralUrl ? { stringValue: referralUrl } : { nullValue: null },
    whatsapp: { nullValue: null },
    city: { nullValue: null },
    needsPasswordReset: { booleanValue: false },
    createdAt: { timestampValue: now },
  };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?documentId=${uid}`,
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
    console.error("[Firestore] Create user failed:", error);
    throw new Error(error.error?.message || "Failed to create user document");
  }
};

// Create refCode document
const createRefCodeDoc = async (
  accessToken: string,
  projectId: string,
  refCode: string,
  agentUid: string
): Promise<void> => {
  const now = new Date().toISOString();
  
  const fields: Record<string, unknown> = {
    agentUid: { stringValue: agentUid },
    lineLeaderId: { nullValue: null },
    active: { booleanValue: true },
    createdAt: { timestampValue: now },
  };

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/refCodes?documentId=${refCode}`,
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
    console.error("[Firestore] Create refCode failed:", error);
    // Don't throw - user was created, just refCode failed
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { uid, email, siteUrl: requestSiteUrl } = body;

    if (!uid || !email) {
      return new Response(
        JSON.stringify({ error: "Missing uid or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[ensure-profile] Processing for:", { uid, email });

    // Initialize Firebase Admin
    const { accessToken, projectId } = await initFirebaseAdmin();
    console.log("[ensure-profile] Firebase Admin initialized");

    // Check if user document already exists
    const existingDoc = await getUserDoc(accessToken, projectId, uid);
    
    if (existingDoc) {
      console.log("[ensure-profile] User document already exists");
      return new Response(
        JSON.stringify({ 
          success: true, 
          created: false,
          message: "User profile already exists" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine role
    const isAdmin = email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
    const role = isAdmin ? "ADMIN" : "AGENT";

    // Generate refCode for non-admin users
    let refCode: string | null = null;
    let referralUrl: string | null = null;
    
    if (role !== "ADMIN") {
      refCode = generateRefCode();
      const siteUrl = resolvePublicSiteUrl(requestSiteUrl);
      referralUrl = `${siteUrl}/?ref=${refCode}`;
    }

    console.log("[ensure-profile] Creating user with role:", role, "refCode:", refCode);

    // Create user document
    await createUserDoc(accessToken, projectId, uid, email, role, refCode, referralUrl);
    console.log("[ensure-profile] User document created successfully");

    // Create refCode document if generated
    if (refCode) {
      await createRefCodeDoc(accessToken, projectId, refCode, uid);
      console.log("[ensure-profile] RefCode document created:", refCode);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        created: true,
        role,
        refCode,
        message: `User profile created with role: ${role}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[ensure-profile] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to ensure profile";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
