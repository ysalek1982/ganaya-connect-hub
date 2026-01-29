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

interface DebugInfo {
  intent_detected: string | null;
  missing_fields: string[];
  score_total: number;
  tier: "NOVATO" | "POTENCIAL" | "PROMETEDOR" | null;
  error?: string;
}

interface ConversationalResponse {
  reply: string;
  datos_lead_update: Record<string, unknown>;
  fin_entrevista: boolean;
  debug: DebugInfo;
}

// Required fields for AGENTE before fin_entrevista can be true
// Using the new canonical agent_profile fields
const REQUIRED_AGENT_FIELDS = [
  "name",
  "country", 
  "whatsapp",
  "age18",
  "working_capital_usd",
  "hours_per_day",
  "has_local_payment_methods",
  "wants_to_start_now"
];

// Updated system prompt focused on agent recruitment with NEW fields
const GANAYA_SYSTEM_PROMPT = `Eres el asistente de reclutamiento de Ganaya.bet.

Tu ÚNICO objetivo es reclutar AGENTES (cajeros) para la red de pagos de Ganaya.bet.
NO atiendes jugadores ni solicitudes de soporte en este flujo.

Idioma: Español neutro latinoamericano.
Tono: Profesional pero amigable, directo, motivador.

ENFOQUE: MONEDA LOCAL
- Los agentes procesan pagos en MONEDA LOCAL de cada país.
- Métodos: transferencia bancaria, billeteras electrónicas (Mercado Pago, Nequi, Yape, etc.), efectivo.
- NO menciones USDT, Binance ni criptomonedas como requisito ni foco del negocio.

REGLAS:
- Haz solo UNA pregunta por mensaje.
- Presenta opciones numeradas (1, 2, 3) para respuestas fáciles.
- NUNCA muestres puntajes ni scores al usuario.
- Confirma que es mayor de 18 ANTES de cerrar.

**FORMATO DE RESPUESTA - SOLO JSON:**
Tu respuesta DEBE ser ÚNICAMENTE un objeto JSON válido. Sin markdown, sin texto extra.

{
  "reply": "Mensaje para el usuario",
  "datos_lead_update": {
    "name": "nombre completo",
    "country": "país",
    "whatsapp": "número con código de país",
    "age18": true/false,
    "working_capital_usd": "0-100 | 100-300 | 300-500 | 500+",
    "hours_per_day": "1-2 | 3-5 | 6+",
    "sales_or_customer_service_exp": true/false/null,
    "casino_or_betting_exp": true/false/null,
    "has_local_payment_methods": true/false,
    "wants_to_start_now": true/false
  },
  "fin_entrevista": false,
  "debug": {
    "intent_detected": "AGENTE",
    "missing_fields": ["lista de campos que faltan"],
    "score_total": 0,
    "tier": "NOVATO | POTENCIAL | PROMETEDOR"
  }
}

FLUJO DE PREGUNTAS (en este orden):

1. "¡Hola! Soy el asistente de reclutamiento de Ganaya.bet. ¿Cuál es tu nombre completo?"
   → Guarda en: name

2. "¿En qué país te encuentras?"
   → Guarda en: country

3. "¿Tienes experiencia en ventas, atención al cliente o trabajos similares?
   1) Sí, tengo experiencia
   2) No, pero quiero aprender"
   → Guarda en: sales_or_customer_service_exp (true/false)

4. "¿Has trabajado antes con casinos, apuestas deportivas o plataformas de juegos?
   1) Sí
   2) No"
   → Guarda en: casino_or_betting_exp (true/false)

5. "¿Conoces los métodos de pago locales de tu país (transferencias, billeteras como Mercado Pago, Nequi, Yape)?
   1) Sí, los manejo bien
   2) Conozco algunos
   3) No los conozco"
   → Guarda en: has_local_payment_methods (true si opción 1 o 2, false si 3)

6. "Para operar como agente necesitas capital de trabajo (para cubrir recargas). ¿Con qué rango podrías empezar?
   1) Menos de $100 USD
   2) Entre $100 y $300 USD
   3) Entre $300 y $500 USD
   4) Más de $500 USD"
   → Guarda en: working_capital_usd ("0-100", "100-300", "300-500", "500+")

7. "¿Cuántas horas al día podrías dedicar?
   1) 1-2 horas
   2) 3-5 horas
   3) 6 horas o más"
   → Guarda en: hours_per_day ("1-2", "3-5", "6+")

8. "¿Estás listo para empezar en los próximos días?
   1) Sí, quiero empezar cuanto antes
   2) Aún estoy evaluando"
   → Guarda en: wants_to_start_now (true/false)

9. "¿Cuál es tu número de WhatsApp? (incluye código de país, ej: +52 55 1234 5678)"
   → Guarda en: whatsapp

10. "Por último, ¿confirmas que eres mayor de 18 años?
    1) Sí, soy mayor de 18
    2) No"
    → Guarda en: age18 (true/false)

Cuando tengas TODOS los campos requeridos (name, country, whatsapp, age18, working_capital_usd, hours_per_day, has_local_payment_methods, wants_to_start_now), marca fin_entrevista=true y responde:

"¡Excelente! Tu perfil fue registrado y será evaluado por nuestro equipo. Te contactaremos pronto por WhatsApp."

SCORING (interno, NO mostrar):
- working_capital_usd >= 300 → +30 pts
- hours_per_day >= 4h → +20 pts (2-4h → +10 pts)
- has_local_payment_methods → +15 pts
- sales_or_customer_service_exp → +15 pts
- casino_or_betting_exp → +10 pts
- wants_to_start_now → +10 pts
Total posible: 100 pts

Tiers:
- PROMETEDOR: ≥70 pts
- POTENCIAL: 40-69 pts
- NOVATO: <40 pts

RECUERDA: Responde SOLO con JSON válido.`;

// Extract JSON from potentially malformed response
function extractJSON(text: string): Record<string, unknown> | null {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
    }
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Direct JSON parse failed:", e);
  }
  
  // Fallback: wrap plain text as reply
  if (cleaned.length > 10 && !cleaned.startsWith('{')) {
    console.log("Creating JSON wrapper for plain text response");
    return {
      reply: cleaned,
      datos_lead_update: {},
      fin_entrevista: false,
      debug: {
        intent_detected: "AGENTE",
        missing_fields: [],
        score_total: 0,
        tier: null,
        wrapped_plain_text: true
      }
    };
  }
  
  return null;
}

// Normalize field aliases to canonical names
function normalizeFieldAliases(data: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...data };
  
  // pais -> country
  if (normalized.pais && !normalized.country) {
    normalized.country = normalized.pais;
  }
  
  // nombre -> name
  if (normalized.nombre && !normalized.name) {
    normalized.name = normalized.nombre;
  }
  
  // Various contact aliases -> whatsapp
  if (!normalized.whatsapp) {
    if (normalized.telefono) normalized.whatsapp = normalized.telefono;
    const contact = normalized.contact as Record<string, unknown> | undefined;
    if (contact?.whatsapp) normalized.whatsapp = contact.whatsapp;
  }
  
  // mayor_18/mayor_edad/age_confirmed_18plus -> age18
  if (normalized.age18 === undefined) {
    if (normalized.age_confirmed_18plus !== undefined) {
      normalized.age18 = normalized.age_confirmed_18plus;
    } else if (normalized.mayor_18 !== undefined) {
      normalized.age18 = normalized.mayor_18;
    } else if (normalized.mayor_edad !== undefined) {
      normalized.age18 = normalized.mayor_edad;
    }
  }
  
  // capital aliases -> working_capital_usd
  if (normalized.working_capital_usd === undefined) {
    if (normalized.capital_range !== undefined) {
      normalized.working_capital_usd = normalized.capital_range;
    } else if (normalized.capital !== undefined) {
      normalized.working_capital_usd = normalized.capital;
    } else if (normalized.banca !== undefined) {
      normalized.working_capital_usd = normalized.banca;
    }
  }
  
  // hours aliases -> hours_per_day
  if (normalized.hours_per_day === undefined) {
    if (normalized.availability_hours !== undefined) {
      normalized.hours_per_day = normalized.availability_hours;
    } else if (normalized.horas !== undefined) {
      normalized.hours_per_day = normalized.horas;
    }
  }
  
  // experience aliases
  if (normalized.experience !== undefined) {
    const exp = String(normalized.experience).toLowerCase();
    if (normalized.sales_or_customer_service_exp === undefined) {
      if (exp.includes('venta') || exp.includes('atencion') || exp.includes('finanza')) {
        normalized.sales_or_customer_service_exp = true;
      }
    }
    if (normalized.casino_or_betting_exp === undefined) {
      if (exp.includes('casino') || exp.includes('apuesta') || exp.includes('plataforma') || exp.includes('juego')) {
        normalized.casino_or_betting_exp = true;
      }
    }
  }
  
  // payment_methods_knowledge -> has_local_payment_methods
  if (normalized.has_local_payment_methods === undefined && normalized.payment_methods_knowledge !== undefined) {
    const level = String(normalized.payment_methods_knowledge).toLowerCase();
    normalized.has_local_payment_methods = level !== 'ninguno' && level !== 'no';
  }
  
  // quiere_empezar -> wants_to_start_now
  if (normalized.wants_to_start_now === undefined && normalized.quiere_empezar !== undefined) {
    normalized.wants_to_start_now = normalized.quiere_empezar;
  }
  
  return normalized;
}

// Calculate score (matches agent-scoring.ts logic)
function calculateScore(data: Record<string, unknown>): { total: number; tier: "NOVATO" | "POTENCIAL" | "PROMETEDOR" } {
  let total = 0;
  
  // working_capital_usd >= 300 => +30
  const capital = String(data.working_capital_usd || '');
  if (capital.includes('500') || capital.includes('+') || capital.includes('más')) total += 30;
  else if (capital.includes('300')) total += 30;
  else if (capital.includes('100')) total += 15;
  
  // hours_per_day >= 4 => +20 (>=2 => +10)
  const hours = String(data.hours_per_day || '');
  if (hours.includes('6') || hours.includes('+') || hours.includes('más')) total += 20;
  else if (hours.includes('3') || hours.includes('4') || hours.includes('5')) total += 10;
  
  // has_local_payment_methods => +15
  if (data.has_local_payment_methods === true) total += 15;
  
  // sales_or_customer_service_exp => +15
  if (data.sales_or_customer_service_exp === true) total += 15;
  
  // casino_or_betting_exp => +10
  if (data.casino_or_betting_exp === true) total += 10;
  
  // wants_to_start_now => +10
  if (data.wants_to_start_now === true) total += 10;
  
  const tier = total >= 70 ? "PROMETEDOR" : total >= 40 ? "POTENCIAL" : "NOVATO";
  
  return { total, tier };
}

// Validate required fields
function validateRequiredFields(data: Record<string, unknown>): string[] {
  const missing: string[] = [];
  
  for (const field of REQUIRED_AGENT_FIELDS) {
    if (field === "whatsapp") {
      const contact = data.contact as Record<string, unknown> | undefined;
      if (!data.whatsapp && !contact?.whatsapp) {
        missing.push("whatsapp");
      }
    } else if (data[field] === undefined || data[field] === null) {
      missing.push(field);
    }
  }
  
  return missing;
}

// Create fallback response
function createFallbackResponse(errorMsg: string): ConversationalResponse {
  return {
    reply: "Tuve un problema técnico, ¿podrías repetir tu última respuesta por favor?",
    datos_lead_update: {},
    fin_entrevista: false,
    debug: {
      intent_detected: "AGENTE",
      missing_fields: [],
      score_total: 0,
      tier: null,
      error: errorMsg,
    },
  };
}

// Process and validate AI response
function processAIResponse(rawContent: string, collectedData: Record<string, unknown>): ConversationalResponse {
  const parsed = extractJSON(rawContent);
  
  if (!parsed) {
    console.error("Failed to extract JSON from:", rawContent.substring(0, 200));
    return createFallbackResponse("invalid_json_extraction");
  }
  
  if (typeof parsed.reply !== 'string' || !parsed.reply) {
    console.error("Missing or invalid 'reply' field");
    return createFallbackResponse("missing_reply_field");
  }
  
  // Merge with collected data
  const datosUpdate = (parsed.datos_lead_update || {}) as Record<string, unknown>;
  const rawMergedData = { ...collectedData, ...datosUpdate };
  
  // Normalize field aliases
  const mergedData = normalizeFieldAliases(rawMergedData);
  
  // Calculate scores
  const { total: scoreTotal, tier: scoreTier } = calculateScore(mergedData);
  
  // Validate required fields
  let finEntrevista = Boolean(parsed.fin_entrevista);
  const missingFields = validateRequiredFields(mergedData);
  
  // Don't allow fin_entrevista if fields are missing
  if (finEntrevista && missingFields.length > 0) {
    console.log("Blocking fin_entrevista due to missing fields:", missingFields);
    finEntrevista = false;
  }
  
  const response: ConversationalResponse = {
    reply: String(parsed.reply),
    datos_lead_update: datosUpdate,
    fin_entrevista: finEntrevista,
    debug: {
      intent_detected: "AGENTE",
      missing_fields: missingFields,
      score_total: scoreTotal,
      tier: scoreTier,
    },
  };
  
  console.log("Processed response debug:", response.debug);
  
  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type = "chat", leadData, collectedData = {} } = await req.json() as RequestBody;
    
    console.log("Request type:", type);
    console.log("Collected data:", JSON.stringify(collectedData));
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to get custom Gemini API key
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
      console.log("Could not read settings:", err);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const useCustomGemini = !!customGeminiKey;
    const useLovableGateway = !useCustomGemini && !!LOVABLE_API_KEY;

    if (!useCustomGemini && !useLovableGateway) {
      return new Response(
        JSON.stringify({ 
          error: "AI service not configured",
          fallback: true,
          message: "Servicio de IA no configurado."
        }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt
    let systemPrompt = "Eres un asistente de Ganaya.bet. Responde en español.";

    if (type === "conversational") {
      const collectedInfo = collectedData && Object.keys(collectedData).length > 0 
        ? JSON.stringify(collectedData, null, 2) 
        : "Ninguno aún";
      systemPrompt = `${GANAYA_SYSTEM_PROMPT}

DATOS YA RECOPILADOS DEL USUARIO:
${collectedInfo}

RECUERDA: Tu respuesta debe ser SOLO un objeto JSON válido.`;
    } else if (type === "summarize" && leadData) {
      systemPrompt = `Analiza este lead de agente y genera un resumen.
Datos: ${JSON.stringify(leadData)}

Responde con JSON:
{
  "resumen": "resumen de 2-3 oraciones",
  "recomendacion": "siguiente paso sugerido",
  "mensaje_whatsapp": "mensaje corto para WhatsApp"
}`;
    } else if (type === "suggest_whatsapp" && leadData) {
      systemPrompt = `Genera un mensaje de WhatsApp para este lead de agente.
Datos: ${JSON.stringify(leadData)}
Mensaje profesional, máximo 200 caracteres.`;
    }

    let rawContent = "";

    if (useCustomGemini) {
      console.log("Using custom Gemini API");
      
      const geminiMessages = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      ];

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${customGeminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!geminiResponse.ok) {
        const error = await geminiResponse.text();
        console.error("Gemini API error:", error);
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      console.log("Using Lovable AI Gateway");
      
      const gatewayMessages = [
        { role: "system", content: systemPrompt },
        ...messages
      ];

      const gatewayResponse = await fetch("https://ai.lovable.dev/v2/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: gatewayMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!gatewayResponse.ok) {
        const error = await gatewayResponse.text();
        console.error("Gateway API error:", error);
        throw new Error(`Gateway API error: ${gatewayResponse.status}`);
      }

      const gatewayData = await gatewayResponse.json();
      rawContent = gatewayData.choices?.[0]?.message?.content || "";
    }

    console.log("Raw AI content:", rawContent.substring(0, 300));

    // For conversational type, process and validate
    if (type === "conversational") {
      const processed = processAIResponse(rawContent, collectedData);
      return new Response(JSON.stringify(processed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For other types, return raw
    return new Response(JSON.stringify({ content: rawContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ai-chat:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: message,
        reply: "Lo siento, tuve un problema. ¿Podrías repetir?",
        datos_lead_update: {},
        fin_entrevista: false,
        debug: { error: message, intent_detected: null, missing_fields: [], score_total: 0, tier: null }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
