import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          error: "AI service not configured",
          fallback: true,
          message: "Usando modo fallback sin IA"
        }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error en el servicio de IA", fallback: true }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

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
