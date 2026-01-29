import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// -----------------------------
// Firestore helpers (REST)
// -----------------------------

function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(String(value.integerValue), 10);
  if (value.doubleValue !== undefined) return Number(value.doubleValue);
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

function parseFirestoreDoc(doc: Record<string, unknown>): Record<string, unknown> | null {
  if (!doc || !doc.fields) return null;
  const fields = doc.fields as Record<string, Record<string, unknown>>;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(value);
  }
  return result;
}

function toFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

const firestoreGetDoc = async (
  accessToken: string,
  projectId: string,
  path: string,
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error('[bootstrap-admin] Firestore GET failed:', await response.text());
    return null;
  }

  return await response.json();
};

const firestorePatchDoc = async (
  accessToken: string,
  projectId: string,
  path: string,
  data: Record<string, unknown>
): Promise<void> => {
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toFirestoreValue(v)]));

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    {
      method: 'PATCH',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error('[bootstrap-admin] Firestore PATCH failed:', errText);
    throw new Error('No se pudo guardar la configuración');
  }
};

const firestoreDeleteDoc = async (
  accessToken: string,
  projectId: string,
  path: string
): Promise<void> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    {
      method: 'DELETE',
      headers: { "Authorization": `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    console.error('[bootstrap-admin] Firestore DELETE failed:', await response.text());
    throw new Error('No se pudo eliminar la configuración');
  }
};

const firestoreRunQuery = async (
  accessToken: string,
  projectId: string,
  structuredQuery: Record<string, unknown>
): Promise<Array<Record<string, unknown>>> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ structuredQuery }),
    }
  );

  if (!response.ok) {
    console.error('[bootstrap-admin] Firestore runQuery failed:', await response.text());
    throw new Error('No se pudieron cargar las configuraciones');
  }

  return await response.json();
};

// -----------------------------
// Admin verification (Firebase ID token)
// -----------------------------

const verifyFirebaseIdToken = async (
  accessToken: string,
  projectId: string,
  idToken: string,
): Promise<{ uid: string; email: string } | null> => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
    {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) {
    console.error('[bootstrap-admin] Token verification failed:', await response.text());
    return null;
  }

  const data = await response.json();
  if (data.users && data.users[0]) {
    return {
      uid: data.users[0].localId,
      email: data.users[0].email || '',
    };
  }
  return null;
};

const requireAdmin = async (
  accessToken: string,
  projectId: string,
  idToken: string
): Promise<{ uid: string; email: string }> => {
  const verified = await verifyFirebaseIdToken(accessToken, projectId, idToken);
  if (!verified) {
    throw new Error('UNAUTHORIZED');
  }

  const userDoc = await firestoreGetDoc(accessToken, projectId, `users/${verified.uid}`);
  const parsed = userDoc ? parseFirestoreDoc(userDoc) : null;
  const role = parsed?.role;
  if (role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return verified;
};

// Check if document exists in Firestore
const checkDocExists = async (
  accessToken: string,
  projectId: string,
  collection: string,
  docId: string
): Promise<boolean> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );
  return response.ok;
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[bootstrap-admin] Starting...");
    
    console.log("[bootstrap-admin] Initializing Firebase Admin...");
    const { accessToken, projectId } = await initFirebaseAdmin();
    console.log("[bootstrap-admin] Firebase Admin initialized");

    const body = await req.json().catch(() => ({}));

    // If action is provided, handle admin operations
    if (body?.action) {
      const action = String(body.action);
      const idToken = String(body.idToken || '');

      // Require admin for ALL actions
      try {
        await requireAdmin(accessToken, projectId, idToken);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'UNAUTHORIZED';
        const status = msg === 'FORBIDDEN' ? 403 : 401;
        return new Response(
          JSON.stringify({ error: status === 403 ? 'No autorizado' : 'Sesión inválida' }),
          { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // --- Chat configs CRUD ---
      if (action === 'chat_configs_list') {
        const results = await firestoreRunQuery(accessToken, projectId, {
          from: [{ collectionId: 'chat_configs' }],
          orderBy: [{ field: { fieldPath: 'updatedAt' }, direction: 'DESCENDING' }],
          limit: 100,
        });

        const configs = results
          .map((r: any) => (r.document ? { raw: r.document } : null))
          .filter(Boolean)
          .map((r: any) => {
            const parsed = parseFirestoreDoc(r.raw) || {};
            const namePath = String(r.raw.name || '');
            const id = namePath.split('/').pop() || '';
            return { id, ...parsed };
          });

        return new Response(
          JSON.stringify({ success: true, configs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'chat_configs_upsert') {
        const config = (body?.config || {}) as Record<string, unknown>;
        const id = String(config.id || '');
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Falta id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Ensure timestamps
        const now = new Date();
        const createdAt = config.createdAt instanceof Date ? config.createdAt : (config.createdAt ? new Date(String(config.createdAt)) : now);
        const updatedAt = now;

        // Keep payload minimal and consistent
        const payload = {
          ...config,
          createdAt,
          updatedAt,
        };

        // Upsert via PATCH (creates if missing? Firestore PATCH requires existing)
        const exists = await checkDocExists(accessToken, projectId, 'chat_configs', id);
        if (!exists) {
          await createFirestoreDoc(accessToken, projectId, 'chat_configs', id, payload);
        } else {
          await firestorePatchDoc(accessToken, projectId, `chat_configs/${id}`, payload);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'chat_configs_delete') {
        const id = String(body?.id || '');
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Falta id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        await firestoreDeleteDoc(accessToken, projectId, `chat_configs/${id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'chat_configs_activate') {
        const id = String(body?.id || '');
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Falta id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Load all configs, deactivate, then activate target
        const results = await firestoreRunQuery(accessToken, projectId, {
          from: [{ collectionId: 'chat_configs' }],
          limit: 200,
        });
        const allIds = results
          .map((r: any) => (r.document?.name ? String(r.document.name).split('/').pop() : null))
          .filter(Boolean) as string[];

        for (const cid of allIds) {
          const isActive = cid === id;
          const exists = await checkDocExists(accessToken, projectId, 'chat_configs', cid);
          if (exists) {
            await firestorePatchDoc(accessToken, projectId, `chat_configs/${cid}`, {
              isActive,
              updatedAt: new Date(),
            });
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Acción no soportada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default legacy behavior: bootstrap admin doc creation
    const { uid, email, name } = body || {};

    if (!uid || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: uid, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user document already exists
    const exists = await checkDocExists(accessToken, projectId, "users", uid);
    
    if (exists) {
      console.log("[bootstrap-admin] User document already exists");
      return new Response(
        JSON.stringify({ success: true, message: "User document already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin user document
    const userData = {
      uid,
      name: name || email.split('@')[0],
      email,
      role: "ADMIN",
      country: "",
      isActive: true,
      lineLeaderId: null,
      canRecruitSubagents: true,
      refCode: null,
      needsPasswordReset: false,
      createdAt: new Date(),
    };

    console.log("[bootstrap-admin] Creating admin user document...");
    await createFirestoreDoc(accessToken, projectId, "users", uid, userData);
    console.log("[bootstrap-admin] Admin user document created");

    return new Response(
      JSON.stringify({ success: true, message: "Admin user document created" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[bootstrap-admin] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to bootstrap admin";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
