import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  type?: "summarize" | "suggest_whatsapp" | "chat";
  leadData?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type = "chat", leadData } = await req.json() as RequestBody;
    
    // Initialize Supabase client to read settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to get custom Gemini API key from settings
    let customGeminiKey: string | null = null;
    try {
      const { data: settings } = await supabase
        .from("settings")
        .select("gemini_api_key")
        .limit(1)
        .maybeSingle();
      
      customGeminiKey = settings?.gemini_api_key || null;
      console.log("Custom Gemini key configured:", !!customGeminiKey);
    } catch (err) {
      console.log("Could not read settings, using default:", err);
    }

    // Determine which API to use
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const useCustomGemini = !!customGeminiKey;
    const useLovableGateway = !useCustomGemini && !!LOVABLE_API_KEY;

    if (!useCustomGemini && !useLovableGateway) {
      console.error("No AI API configured (neither custom Gemini nor Lovable Gateway)");
      return new Response(
        JSON.stringify({ 
          error: "AI service not configured",
          fallback: true,
          message: "Usando modo fallback sin IA. Configura una API key de Gemini en Settings o verifica Lovable AI Gateway."
        }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt based on request type
    let systemPrompt = "Eres un asistente de Ganaya.bet, una plataforma de apuestas deportivas en LATAM. Sé amable, conciso y profesional. Responde en español.";

    if (type === "summarize" && leadData) {
      systemPrompt = `Eres un asistente de ventas de Ganaya.bet. Analiza los datos de este lead y genera un resumen conciso.
Datos del lead: ${JSON.stringify(leadData)}

Responde con un JSON estructurado:
{
  "resumen": "resumen de 2-3 oraciones sobre el perfil",
  "objeciones": ["lista de posibles objeciones detectadas"],
  "recomendacion": "siguiente paso sugerido",
  "mensaje_whatsapp": "mensaje corto para enviar por WhatsApp"
}`;
    }

    if (type === "suggest_whatsapp" && leadData) {
      systemPrompt = `Eres un asistente de ventas. Genera un mensaje de WhatsApp personalizado para contactar a este lead.
Datos: ${JSON.stringify(leadData)}
El mensaje debe ser amigable, profesional y mencionar Ganaya.bet. Máximo 200 caracteres.`;
    }

    let response: Response;

    if (useCustomGemini) {
      // Use custom Gemini API directly
      console.log("Using custom Gemini API key");
      
      const geminiMessages = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      ];

      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${customGeminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Límite de solicitudes Gemini excedido. Intentá de nuevo." }), 
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Fallback to Lovable if custom Gemini fails
        if (useLovableGateway) {
          console.log("Gemini failed, falling back to Lovable AI Gateway");
        } else {
          return new Response(
            JSON.stringify({ error: "Error en Gemini API", fallback: true }), 
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return formatResponse(content, type, corsHeaders);
      }
    }

    // Use Lovable AI Gateway (default fallback)
    console.log("Using Lovable AI Gateway");
    
    response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intentá de nuevo en unos segundos." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Contactá al administrador." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error en el servicio de IA", fallback: true }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return formatResponse(content, type, corsHeaders);

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido",
        fallback: true 
      }), 
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatResponse(content: string, type: string, corsHeaders: Record<string, string>) {
  // Try to parse JSON for structured responses
  if (type === "summarize") {
    try {
      const parsed = JSON.parse(content);
      return new Response(
        JSON.stringify({ success: true, data: parsed }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch {
      return new Response(
        JSON.stringify({ success: true, data: { resumen: content } }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: true, content }), 
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}