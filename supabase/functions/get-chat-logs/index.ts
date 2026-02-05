import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type FirestoreValue = Record<string, unknown>;

const initFirebaseAdmin = async () => {
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON not configured");

  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore",
  };

  const base64urlEncode = (data: Uint8Array | string): string => {
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const claimsB64 = base64urlEncode(JSON.stringify(claims));
  const unsignedToken = `${headerB64}.${claimsB64}`;

  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = serviceAccount.private_key
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\n/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c: string) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
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
    console.error("[get-chat-logs] Token exchange failed:", await tokenResponse.text());
    throw new Error("Failed to get Firebase access token");
  }

  const { access_token } = await tokenResponse.json();
  return { accessToken: access_token as string, projectId: serviceAccount.project_id as string };
};

function parseFirestoreValue(value: FirestoreValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(String(value.integerValue), 10);
  if (value.doubleValue !== undefined) return Number(value.doubleValue);
  if (value.booleanValue !== undefined) return Boolean(value.booleanValue);
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return new Date(String(value.timestampValue));
  if (value.mapValue !== undefined) {
    const fields = (value.mapValue as Record<string, unknown>).fields as Record<string, FirestoreValue> | undefined;
    if (!fields) return {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) out[k] = parseFirestoreValue(v);
    return out;
  }
  if (value.arrayValue !== undefined) {
    const values = (value.arrayValue as Record<string, unknown>).values as FirestoreValue[] | undefined;
    if (!values) return [];
    return values.map(parseFirestoreValue);
  }
  return null;
}

function parseFirestoreDoc(doc: Record<string, unknown>): Record<string, unknown> {
  const fields = doc.fields as Record<string, FirestoreValue> | undefined;
  const out: Record<string, unknown> = {};
  if (!fields) return out;
  for (const [k, v] of Object.entries(fields)) out[k] = parseFirestoreValue(v);
  return out;
}

const verifyFirebaseIdToken = async (
  accessToken: string,
  projectId: string,
  idToken: string,
): Promise<{ uid: string; email: string } | null> => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    console.error("[get-chat-logs] Token verification failed:", await response.text());
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

const requireAdmin = async (
  accessToken: string,
  projectId: string,
  idToken: string,
): Promise<{ uid: string; email: string }> => {
  const verified = await verifyFirebaseIdToken(accessToken, projectId, idToken);
  if (!verified) throw new Error("UNAUTHORIZED");

  const userDocRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${verified.uid}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } },
  );
  if (!userDocRes.ok) throw new Error("FORBIDDEN");
  const userDoc = await userDocRes.json();
  const parsed = parseFirestoreDoc(userDoc);
  if (parsed.role !== "ADMIN") throw new Error("FORBIDDEN");

  return verified;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const leadId = String(body?.leadId || "");
    const idToken = String(body?.idToken || "");
    if (!leadId) {
      return new Response(JSON.stringify({ error: "Falta leadId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { accessToken, projectId } = await initFirebaseAdmin();

    try {
      await requireAdmin(accessToken, projectId, idToken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
      const status = msg === "FORBIDDEN" ? 403 : 401;
      return new Response(JSON.stringify({ error: status === 403 ? "No autorizado" : "Sesión inválida" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // IMPORTANT: Firestore requires a composite index for (where leadId == X) + (orderBy createdAt).
    // To avoid manual index setup, we query by leadId only and sort/limit on the server.
    const structuredQuery = {
      from: [{ collectionId: "chat_logs" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "leadId" },
          op: "EQUAL",
          value: { stringValue: leadId },
        },
      },
      // Fetch more than needed, then sort/limit locally.
      limit: 200,
    };

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ structuredQuery }),
      },
    );

    if (!response.ok) {
      console.error("[get-chat-logs] runQuery failed:", await response.text());
      throw new Error("QUERY_FAILED");
    }

    const results = await response.json();
    const logs = (results as Array<Record<string, unknown>>)
      .map((r: any) => (r.document ? r.document : null))
      .filter(Boolean)
      .map((doc: any) => {
        const parsed = parseFirestoreDoc(doc);
        const docName = String(doc.name || "");
        const id = docName.split("/").pop() || "";
        return { id, ...parsed };
      });

    const sortedLogs = logs
      .slice()
      .sort((a: any, b: any) => {
        const aTime = a?.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a?.createdAt || 0).getTime();
        const bTime = b?.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 50);

    return new Response(JSON.stringify({ success: true, logs: sortedLogs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[get-chat-logs] Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Error al cargar chat logs" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
