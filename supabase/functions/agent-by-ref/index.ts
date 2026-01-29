import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Firebase Admin SDK initialization using REST API
const initFirebaseAdmin = async () => {
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not configured');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  
  // Fix private key newlines
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  
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

// Get a single Firestore document
const getFirestoreDoc = async (
  accessToken: string,
  projectId: string,
  collection: string,
  docId: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`,
    {
      headers: { "Authorization": `Bearer ${accessToken}` },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error(`[Firestore] Failed to get ${collection}/${docId}:`, await response.text());
    return null;
  }

  return await response.json();
};

// Query Firestore collection
const queryFirestore = async (
  accessToken: string,
  projectId: string,
  collection: string,
  filters: Array<{ field: string; op: string; value: unknown }>,
  orderBy?: { field: string; direction: string }
): Promise<Array<{ id: string; data: Record<string, unknown> }>> => {
  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: collection }],
  };

  if (filters.length > 0) {
    structuredQuery.where = {
      compositeFilter: {
        op: "AND",
        filters: filters.map(f => ({
          fieldFilter: {
            field: { fieldPath: f.field },
            op: f.op,
            value: convertToFirestoreValue(f.value),
          },
        })),
      },
    };
  }

  if (orderBy) {
    structuredQuery.orderBy = [{
      field: { fieldPath: orderBy.field },
      direction: orderBy.direction,
    }];
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ structuredQuery }),
    }
  );

  if (!response.ok) {
    console.error(`[Firestore] Query failed:`, await response.text());
    return [];
  }

  const results = await response.json();
  return results
    .filter((r: Record<string, unknown>) => r.document)
    .map((r: Record<string, unknown>) => {
      const doc = r.document as Record<string, unknown>;
      const name = doc.name as string;
      const id = name.split('/').pop() || '';
      return { id, data: parseFirestoreFields(doc.fields as Record<string, unknown>) };
    });
};

// Convert JS value to Firestore value format
const convertToFirestoreValue = (value: unknown): Record<string, unknown> => {
  if (value === null) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(convertToFirestoreValue) } };
  }
  return { stringValue: String(value) };
};

// Parse Firestore fields to JS values
const parseFirestoreFields = (fields: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(value as Record<string, unknown>);
  }
  
  return result;
};

const parseFirestoreValue = (value: Record<string, unknown>): unknown => {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue as string, 10);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) {
    const arr = value.arrayValue as Record<string, unknown>;
    const values = (arr.values || []) as Array<Record<string, unknown>>;
    return values.map(parseFirestoreValue);
  }
  if ('mapValue' in value) {
    const map = value.mapValue as Record<string, unknown>;
    return parseFirestoreFields((map.fields || {}) as Record<string, unknown>);
  }
  return null;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const refCode = url.searchParams.get('ref');
    const campaignId = url.searchParams.get('cid');

    if (!refCode) {
      return new Response(
        JSON.stringify({ error: 'ref parameter required', agentInfo: null }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Firebase
    const { accessToken, projectId } = await initFirebaseAdmin();

    // Look up refCode mapping
    const refCodeDoc = await getFirestoreDoc(accessToken, projectId, 'refCodes', refCode);
    
    if (!refCodeDoc || !refCodeDoc.fields) {
      console.log(`RefCode ${refCode} not found`);
      return new Response(
        JSON.stringify({ agentInfo: null, error: 'Invalid ref code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const refCodeData = parseFirestoreFields(refCodeDoc.fields as Record<string, unknown>);
    const agentUid = refCodeData.agentUid as string;

    // Get agent profile
    const userDoc = await getFirestoreDoc(accessToken, projectId, 'users', agentUid);
    
    if (!userDoc || !userDoc.fields) {
      console.log(`Agent ${agentUid} not found`);
      return new Response(
        JSON.stringify({ agentInfo: null, error: 'Agent not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = parseFirestoreFields(userDoc.fields as Record<string, unknown>);

    // Check if agent is active
    if (!userData.isActive) {
      return new Response(
        JSON.stringify({ agentInfo: null, error: 'Agent inactive' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default values from agent profile
    const publicContact = userData.publicContact as Record<string, unknown> | undefined;
    let displayName = (userData.displayName || userData.name || 'Tu cajero') as string;
    let contactLabel = (publicContact?.contactLabel || `Te atiende: ${displayName}`) as string;
    let whatsapp = (publicContact?.whatsapp || userData.whatsapp || '') as string;
    let messageTemplate: string | undefined = undefined;

    // If campaignId provided, check for overrides in referralLinks
    if (campaignId) {
      const linkDoc = await getFirestoreDoc(accessToken, projectId, 'referralLinks', campaignId);
      
      if (linkDoc && linkDoc.fields) {
        const linkData = parseFirestoreFields(linkDoc.fields as Record<string, unknown>);
        
        // Only use if link belongs to this agent and is active
        if (linkData.agentUid === agentUid && linkData.isActive) {
          if (linkData.whatsappOverride) {
            whatsapp = linkData.whatsappOverride as string;
          }
          if (linkData.contactLabelOverride) {
            contactLabel = linkData.contactLabelOverride as string;
          }
          if (linkData.messageTemplate) {
            messageTemplate = linkData.messageTemplate as string;
          }
        }
      }
    }

    // Fetch tutorials for this agent + global tutorials
    const tutorialsResult = await queryFirestore(
      accessToken,
      projectId,
      'tutorials',
      [{ field: 'isPublished', op: 'EQUAL', value: true }],
      { field: 'order', direction: 'ASCENDING' }
    );

    const tutorials = tutorialsResult
      .filter(doc => {
        const data = doc.data;
        return data.ownerType === 'GLOBAL' || data.ownerUid === agentUid;
      })
      .map(doc => ({
        id: doc.id,
        title: doc.data.title as string,
        summary: doc.data.summary as string,
        videoUrl: (doc.data.videoUrl || null) as string | null,
        order: (doc.data.order || 0) as number,
      }))
      .sort((a, b) => a.order - b.order);

    const agentInfo = {
      displayName,
      contactLabel,
      whatsapp,
      messageTemplate,
      tutorials,
    };

    console.log(`Resolved agent for ref ${refCode}:`, { displayName, whatsapp: '***' });

    return new Response(
      JSON.stringify({ agentInfo }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in agent-by-ref:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message, agentInfo: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
