import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { initializeApp, cert, getApps } from "https://esm.sh/firebase-admin@12.0.0/app";
import { getFirestore } from "https://esm.sh/firebase-admin@12.0.0/firestore";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Firebase Admin
const initFirebaseAdmin = () => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not configured');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
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
    const app = initFirebaseAdmin();
    const firestore = getFirestore(app);

    // Look up refCode mapping
    const refCodeDoc = await firestore.collection('refCodes').doc(refCode).get();
    
    if (!refCodeDoc.exists) {
      console.log(`RefCode ${refCode} not found`);
      return new Response(
        JSON.stringify({ agentInfo: null, error: 'Invalid ref code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const refCodeData = refCodeDoc.data()!;
    const agentUid = refCodeData.agentUid;

    // Get agent profile
    const userDoc = await firestore.collection('users').doc(agentUid).get();
    
    if (!userDoc.exists) {
      console.log(`Agent ${agentUid} not found`);
      return new Response(
        JSON.stringify({ agentInfo: null, error: 'Agent not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = userDoc.data()!;

    // Check if agent is active
    if (!userData.isActive) {
      return new Response(
        JSON.stringify({ agentInfo: null, error: 'Agent inactive' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default values from agent profile
    let displayName = userData.displayName || userData.name || 'Tu cajero';
    let contactLabel = userData.publicContact?.contactLabel || `Te atiende: ${displayName}`;
    let whatsapp = userData.publicContact?.whatsapp || userData.whatsapp || '';
    let messageTemplate: string | undefined = undefined;

    // If campaignId provided, check for overrides in referralLinks
    if (campaignId) {
      const linkDoc = await firestore.collection('referralLinks').doc(campaignId).get();
      
      if (linkDoc.exists) {
        const linkData = linkDoc.data()!;
        
        // Only use if link belongs to this agent and is active
        if (linkData.agentUid === agentUid && linkData.isActive) {
          if (linkData.whatsappOverride) {
            whatsapp = linkData.whatsappOverride;
          }
          if (linkData.contactLabelOverride) {
            contactLabel = linkData.contactLabelOverride;
          }
          if (linkData.messageTemplate) {
            messageTemplate = linkData.messageTemplate;
          }
        }
      }
    }

    // Fetch tutorials for this agent + global tutorials
    const tutorialsQuery = await firestore.collection('tutorials')
      .where('isPublished', '==', true)
      .orderBy('order', 'asc')
      .get();

    const tutorials = tutorialsQuery.docs
      .filter(doc => {
        const data = doc.data();
        return data.ownerType === 'GLOBAL' || data.ownerUid === agentUid;
      })
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          summary: data.summary,
          videoUrl: data.videoUrl || null,
          order: data.order || 0,
        };
      })
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
