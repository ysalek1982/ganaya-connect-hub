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
     throw new Error("Failed to get Firebase access token");
   }
 
   const { access_token } = await tokenResponse.json();
   return { accessToken: access_token, projectId: serviceAccount.project_id };
 };
 
 // Get user document
 const getUserDoc = async (accessToken: string, projectId: string, uid: string) => {
   const response = await fetch(
     `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
     { headers: { "Authorization": `Bearer ${accessToken}` } }
   );
   if (response.status === 404) return null;
   if (!response.ok) return null;
   return await response.json();
 };
 
 // Update user role to ADMIN
 const updateUserRole = async (accessToken: string, projectId: string, uid: string) => {
   const response = await fetch(
     `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=role&updateMask.fieldPaths=canRecruitSubagents`,
     {
       method: "PATCH",
       headers: {
         "Authorization": `Bearer ${accessToken}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         fields: {
           role: { stringValue: "ADMIN" },
           canRecruitSubagents: { booleanValue: true },
         },
       }),
     }
   );
 
   if (!response.ok) {
     const error = await response.text();
     console.error("[promote-admin] Update failed:", error);
     throw new Error("Failed to update user role");
   }
 
   return await response.json();
 };
 
 // Create new admin user document
 const createAdminUser = async (
   accessToken: string,
   projectId: string,
   uid: string,
   email: string,
   name: string
 ) => {
   const now = new Date().toISOString();
   const fields = {
     uid: { stringValue: uid },
     email: { stringValue: email || `user-${uid.slice(0, 8)}@admin.local` },
     name: { stringValue: name || email?.split("@")[0] || "Admin" },
     role: { stringValue: "ADMIN" },
     country: { stringValue: "" },
     isActive: { booleanValue: true },
     lineLeaderId: { nullValue: null },
     canRecruitSubagents: { booleanValue: true },
     refCode: { nullValue: null },
     referralUrl: { nullValue: null },
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
     const error = await response.text();
     console.error("[promote-admin] Create user failed:", error);
     throw new Error("Failed to create admin user document");
   }
 
   return await response.json();
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const body = await req.json();
     const { uid } = body;
 
     console.log("[promote-admin] Processing request for uid:", uid);
 
     if (!uid) {
       return new Response(
         JSON.stringify({ error: "Missing uid parameter" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     console.log("[promote-admin] Promoting user:", uid);
 
     const { accessToken, projectId } = await initFirebaseAdmin();
     
     // Check if user exists
     const userDoc = await getUserDoc(accessToken, projectId, uid);
     
     if (!userDoc) {
       console.log("[promote-admin] User not found, creating new admin document...");
       await createAdminUser(accessToken, projectId, uid, body.email || "", body.name || "");
       console.log("[promote-admin] New admin user created successfully");
       
       return new Response(
         JSON.stringify({ success: true, message: `New admin user ${uid} created` }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Update existing user role
     await updateUserRole(accessToken, projectId, uid);
 
     console.log("[promote-admin] User promoted to ADMIN successfully");
 
     return new Response(
       JSON.stringify({ success: true, message: `User ${uid} promoted to ADMIN` }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error: unknown) {
     console.error("[promote-admin] Error:", error);
     const message = error instanceof Error ? error.message : "Failed to promote user";
     return new Response(
       JSON.stringify({ error: message }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });