import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateRefCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AGT-${suffix}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, country, whatsapp, city, lineLeaderId, canRecruitSubagents, role } = body;

    if (!name || !email || !country || !whatsapp) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique refCode
    const refCode = generateRefCode();
    const referralUrl = `https://ganaya.bet/?ref=${refCode}`;

    // Return the generated data (actual Firebase creation would need Firebase Admin SDK setup)
    // For now, this returns the data that should be created
    return new Response(
      JSON.stringify({ 
        uid: `temp-${Date.now()}`,
        refCode, 
        referralUrl,
        userData: {
          name,
          email,
          role: role || "AGENT",
          country,
          city: city || null,
          whatsapp,
          isActive: true,
          lineLeaderId: lineLeaderId || null,
          canRecruitSubagents: canRecruitSubagents || false,
          refCode,
          referralUrl,
        },
        success: true,
        message: "Agent data generated. Set up FIREBASE_SERVICE_ACCOUNT secret for full Firebase integration."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create agent";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
