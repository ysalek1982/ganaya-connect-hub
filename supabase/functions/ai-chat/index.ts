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
  type?: "summarize" | "suggest_whatsapp" | "chat" | "conversational";
  leadData?: Record<string, unknown>;
  collectedData?: Record<string, unknown>;
}

interface ConversationalResponse {
  reply: string;
  datos_lead_update: Record<string, unknown>;
  fin_entrevista: boolean;
  intent?: "JUGADOR" | "AGENTE" | "SOPORTE";
  scoring?: {
    total: number;
    categoria: "NOVATO" | "POTENCIAL" | "APROBABLE";
  };
}

const GANAYA_SYSTEM_PROMPT = `Eres el asistente conversacional oficial de Ganaya.bet.

Tu función es captar, clasificar y convertir usuarios que llegan a la landing page.

Idioma: Español neutro latinoamericano.

Tono: Humano, claro, confiable, directo.

Nunca suenes robótico ni corporativo.

OBJETIVO PRINCIPAL:

Detectar la intención del usuario y guiarlo por el flujo correcto:

- JUGADOR (quiere jugar, recargar, retirar, crear cuenta)

- AGENTE (quiere trabajar como cajero, vender fichas, ganar comisiones)

- SOPORTE (dudas generales)

REGLAS IMPORTANTES:

- Haz solo UNA pregunta por mensaje.

- No repitas preguntas ya respondidas.

- Justifica cada pregunta de forma natural.

- No prometas ganancias ni condiciones ilegales.

- Siempre confirma que el usuario es mayor de 18 años.

- No muestres puntajes ni evaluaciones al usuario.

FORMATO DE RESPUESTA (OBLIGATORIO):

Devuelve SIEMPRE un objeto JSON con esta estructura:

{
  "reply": "Mensaje visible para el usuario",
  "datos_lead_update": { },
  "fin_entrevista": false,
  "intent": "JUGADOR" | "AGENTE" | "SOPORTE" (opcional, solo cuando detectes la intención)
}

DETECCIÓN DE INTENCIÓN:

- Si menciona jugar, apostar, slots, recargar, retirar → intent = JUGADOR

- Si menciona trabajar, ser cajero, vender fichas, comisiones → intent = AGENTE

- Si pregunta sin claridad → pide aclaración breve

FLUJO JUGADOR:

1. Pregunta qué necesita (crear cuenta / recargar / retirar / bonos)

2. Pregunta país

3. Solicita WhatsApp o Telegram

4. Pregunta si usa USDT

5. Confirma +18

6. Marca fin_entrevista = true

FLUJO AGENTE:

1. Pregunta experiencia (casinos, ventas, recargas, finanzas, ninguna)

2. Pregunta manejo de Binance y USDT

3. Pregunta rango de capital disponible ($0-100, $100-300, $300-500, $500+)

4. Pregunta horas diarias disponibles (1-2, 3-5, 6+)

5. Solicita nombre, país y WhatsApp o Telegram

6. Confirma +18

7. Calcula scoring interno (0–100)

8. Clasifica: NOVATO (0-40) / POTENCIAL (41-70) / APROBABLE (71-100)

9. Marca fin_entrevista = true e incluye scoring en la respuesta

SCORING (INTERNO, no mostrar al usuario):

- Binance/USDT verificado: hasta 25 pts
- Capital disponible: $0-100=0pts, $100-300=5pts, $300-500=10pts, $500+=15pts
- Experiencia (casinos/ventas/finanzas): hasta 10 pts
- Disponibilidad horaria: 1-2h=3pts, 3-5h=7pts, 6+=10pts
- Evaluación cualitativa: hasta 40 pts (basada en claridad, motivación, profesionalismo en respuestas)

Cuando fin_entrevista = true, incluye el campo "scoring" con total y categoria.

CIERRE:

- Jugador: En reply di "¡Perfecto! Te conecto con un cajero asignado que te ayudará por WhatsApp."

- Agente: En reply di "¡Excelente! Tu perfil fue registrado y será evaluado por nuestro equipo. Te contactaremos pronto."

Siempre sé claro, breve y profesional.

DATOS YA RECOPILADOS DEL USUARIO:`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type = "chat", leadData, collectedData } = await req.json() as RequestBody;
    
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

    if (type === "conversational") {
      // New conversational chat mode with structured JSON responses
      const collectedInfo = collectedData ? JSON.stringify(collectedData, null, 2) : "Ninguno aún";
      systemPrompt = `${GANAYA_SYSTEM_PROMPT}
${collectedInfo}

IMPORTANTE: Tu respuesta DEBE ser únicamente un objeto JSON válido. No incluyas texto adicional fuera del JSON.`;
    } else if (type === "summarize" && leadData) {
      systemPrompt = `Eres un asistente de ventas de Ganaya.bet. Analiza los datos de este lead y genera un resumen conciso.
Datos del lead: ${JSON.stringify(leadData)}

Responde con un JSON estructurado:
{
  "resumen": "resumen de 2-3 oraciones sobre el perfil",
  "objeciones": ["lista de posibles objeciones detectadas"],
  "recomendacion": "siguiente paso sugerido",
  "mensaje_whatsapp": "mensaje corto para enviar por WhatsApp"
}`;
    } else if (type === "suggest_whatsapp" && leadData) {
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
  // For conversational mode, parse and validate JSON response
  if (type === "conversational") {
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      const parsed = JSON.parse(cleanContent) as ConversationalResponse;
      
      // Validate required fields
      if (!parsed.reply) {
        throw new Error("Missing reply field");
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            reply: parsed.reply,
            datos_lead_update: parsed.datos_lead_update || {},
            fin_entrevista: parsed.fin_entrevista || false,
            intent: parsed.intent,
            scoring: parsed.scoring,
          }
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (e) {
      console.error("Failed to parse conversational response:", e, content);
      // Return the raw content as reply if parsing fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            reply: content,
            datos_lead_update: {},
            fin_entrevista: false,
          }
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

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
