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
  score_rules: number;
  score_ai: number;
  score_total: number;
  tier: "NOVATO" | "POTENCIAL" | "APROBABLE" | null;
  error?: string;
}

interface ConversationalResponse {
  reply: string;
  datos_lead_update: Record<string, unknown>;
  fin_entrevista: boolean;
  debug: DebugInfo;
}

// Required fields for each intent before fin_entrevista can be true
const REQUIRED_FIELDS = {
  JUGADOR: ["country", "contact", "player_needs", "age_confirmed_18plus"],
  AGENTE: ["country", "contact", "experience", "payment_methods_knowledge", "capital_range", "availability_hours", "age_confirmed_18plus"],
};

// Scoring rules (0-60 points) - Updated for local currency focus
const SCORING_RULES = {
  payment_methods_knowledge: { ninguno: 0, basico: 10, intermedio: 20, avanzado: 25 },
  capital_range: { "0-100": 0, "100-300": 5, "300-500": 10, "500+": 15 },
  experience: { ninguna: 0, ventas: 3, finanzas: 5, casinos: 7, multiple: 10 },
  availability_hours: { "1-2": 3, "3-5": 7, "6+": 10 },
};

const GANAYA_SYSTEM_PROMPT = `Eres el asistente conversacional oficial de Ganaya.bet.

Tu función es captar, clasificar y convertir usuarios que llegan a la landing page.

Idioma: Español neutro latinoamericano.
Tono: Humano, claro, confiable, directo.
Nunca suenes robótico ni corporativo.

IMPORTANTE - ENFOQUE EN MONEDA LOCAL:
- Ganaya opera con CAJEROS LOCALES que procesan pagos en MONEDA LOCAL de cada país.
- Los métodos de pago incluyen: transferencia bancaria, billeteras electrónicas (Mercado Pago, Nequi, Yape, etc.), depósitos.
- NO menciones USDT, Binance ni criptomonedas como método principal.
- Si el usuario pregunta por crypto, responde que también pueden orientarlo, pero la operación principal es en moneda local con cajeros.

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
- Siempre confirma que el usuario es mayor de 18 años ANTES de cerrar.
- NUNCA muestres puntajes, scores ni evaluaciones al usuario.
- SIEMPRE presenta las opciones con números (1, 2, 3) o letras (a, b, c) para que el usuario pueda responder fácilmente.
- Ejemplo: "¿Cuántas horas al día podrías dedicar? 1) 1-2 horas 2) 3-5 horas 3) 6 o más"

**FORMATO DE RESPUESTA OBLIGATORIO - SOLO JSON:**
Tu respuesta DEBE ser ÚNICAMENTE un objeto JSON válido. NO incluyas texto antes ni después del JSON.
NO uses markdown, NO uses \`\`\`json, SOLO el objeto JSON puro.

{
  "reply": "Mensaje visible para el usuario (string)",
  "datos_lead_update": {
    "intent": "JUGADOR | AGENTE | SOPORTE (solo cuando lo detectes)",
    "country": "país del usuario",
    "contact": { "whatsapp": "número" } o { "telegram": "@usuario" },
    "name": "nombre del usuario",
    "age_confirmed_18plus": true/false,
    
    // Solo para JUGADOR:
    "player_needs": { "need": "crear_cuenta | recargar | retirar | bonos | otro" },
    "preferred_payment": "transferencia | billetera | deposito | otro",
    
    // Solo para AGENTE:
    "experience": "ninguna | ventas | finanzas | casinos | multiple",
    "payment_methods_knowledge": "ninguno | basico | intermedio | avanzado",
    "capital_range": "0-100 | 100-300 | 300-500 | 500+",
    "availability_hours": "1-2 | 3-5 | 6+",
    "score_ai": 0-40 (tu evaluación cualitativa: claridad, motivación, profesionalismo)
  },
  "fin_entrevista": false,
  "debug": {
    "intent_detected": "JUGADOR | AGENTE | SOPORTE | null",
    "missing_fields": ["lista de campos que aún faltan"],
    "score_rules": 0,
    "score_ai": 0,
    "score_total": 0,
    "tier": "NOVATO | POTENCIAL | APROBABLE | null"
  }
}

DETECCIÓN DE INTENCIÓN:
- Si menciona jugar, apostar, slots, recargar, retirar, casino, bonos → intent = JUGADOR
- Si menciona trabajar, ser cajero, vender fichas, comisiones, agente → intent = AGENTE
- Si pregunta sin claridad → pide aclaración breve

FLUJO JUGADOR (campos requeridos: country, contact, player_needs.need, age_confirmed_18plus):
1. Pregunta qué necesita (crear cuenta / recargar / retirar / bonos)
2. Pregunta país
3. Pregunta: "¿Cómo prefieres recargar/retirar? 1) Transferencia bancaria 2) Billetera electrónica 3) Depósito 4) Otro"
4. Solicita WhatsApp o Telegram
5. Confirma +18
6. Solo marca fin_entrevista=true cuando tengas TODOS los campos requeridos

FLUJO AGENTE (campos requeridos: country, contact, experience, payment_methods_knowledge, capital_range, availability_hours, age_confirmed_18plus):
1. Pregunta experiencia (casinos, ventas, recargas, finanzas, ninguna)
2. Pregunta conocimiento de métodos de pago locales (ninguno, básico, intermedio, avanzado)
3. Pregunta rango de capital para operar ($0-100, $100-300, $300-500, $500+)
4. Pregunta horas diarias disponibles (1-2, 3-5, 6+)
5. Solicita nombre, país y WhatsApp/Telegram
6. Confirma +18
7. Calcula score_ai (0-40) basado en: claridad en respuestas, motivación demostrada, profesionalismo
8. Solo marca fin_entrevista=true cuando tengas TODOS los campos requeridos

SCORING (interno, NUNCA mostrar al usuario):
- score_rules: payment_methods(0-25) + capital(0-15) + experiencia(0-10) + disponibilidad(0-10) = 0-60
- score_ai: tu evaluación cualitativa 0-40
- score_total: score_rules + score_ai = 0-100
- tier: NOVATO (<60), POTENCIAL (60-79), APROBABLE (>=80)

CIERRE:
- Jugador: "¡Perfecto! Te conecto con un cajero asignado que te ayudará por WhatsApp. Podrás recargar y retirar en tu moneda local."
- Agente: "¡Excelente! Tu perfil fue registrado y será evaluado por nuestro equipo. Te contactaremos pronto."

RECUERDA: Responde SOLO con JSON válido, sin texto adicional.`;

// Extract JSON from potentially malformed response, or create one from plain text
function extractJSON(text: string): Record<string, unknown> | null {
  // Remove markdown code blocks
  let cleaned = text.trim();
  
  // Remove ```json or ``` markers
  cleaned = cleaned.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '');
  cleaned = cleaned.trim();
  
  // Try to find JSON object boundaries
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
  
  // Direct parse attempt
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Direct JSON parse failed:", e);
  }
  
  // FALLBACK: If AI responded with plain text instead of JSON, wrap it as a reply
  // This prevents "problema técnico" when AI forgets to use JSON format
  if (cleaned.length > 10 && !cleaned.startsWith('{')) {
    console.log("Creating JSON wrapper for plain text response");
    return {
      reply: cleaned,
      datos_lead_update: {},
      fin_entrevista: false,
      debug: {
        intent_detected: null,
        missing_fields: [],
        score_rules: 0,
        score_ai: 0,
        score_total: 0,
        tier: null,
        wrapped_plain_text: true
      }
    };
  }
  
  return null;
}

// Calculate rules-based score - Updated for local currency focus
function calculateRulesScore(data: Record<string, unknown>): number {
  let score = 0;
  
  // Payment methods knowledge (0-25)
  const paymentLevel = String(data.payment_methods_knowledge || '').toLowerCase();
  if (paymentLevel.includes('avanzado')) score += 25;
  else if (paymentLevel.includes('intermedio')) score += 20;
  else if (paymentLevel.includes('basico') || paymentLevel.includes('básico')) score += 10;
  
  // Capital range (0-15)
  const capital = String(data.capital_range || '');
  if (capital.includes('500+') || capital.includes('500 o más')) score += 15;
  else if (capital.includes('300-500') || capital.includes('300')) score += 10;
  else if (capital.includes('100-300')) score += 5;
  
  // Experience (0-10)
  const experience = String(data.experience || '').toLowerCase();
  if (experience.includes('multiple') || experience.includes('múltiple') || experience.includes('varias')) score += 10;
  else if (experience.includes('casino')) score += 7;
  else if (experience.includes('finanza')) score += 5;
  else if (experience.includes('venta')) score += 3;
  
  // Availability (0-10)
  const hours = String(data.availability_hours || '');
  if (hours.includes('6') || hours.includes('más') || hours.includes('full')) score += 10;
  else if (hours.includes('3') || hours.includes('4') || hours.includes('5')) score += 7;
  else if (hours.includes('1') || hours.includes('2')) score += 3;
  
  return Math.min(score, 60);
}

// Validate required fields
function validateRequiredFields(intent: string, data: Record<string, unknown>): string[] {
  const missing: string[] = [];
  const required = REQUIRED_FIELDS[intent as keyof typeof REQUIRED_FIELDS] || [];
  
  for (const field of required) {
    if (field === "contact") {
      const contact = data.contact as Record<string, unknown> | undefined;
      if (!contact || (!contact.whatsapp && !contact.telegram)) {
        missing.push("contact (whatsapp o telegram)");
      }
    } else if (field === "player_needs") {
      const playerNeeds = data.player_needs as Record<string, unknown> | undefined;
      if (!playerNeeds || !playerNeeds.need) {
        missing.push("player_needs.need");
      }
    } else if (!data[field]) {
      missing.push(field);
    }
  }
  
  return missing;
}

// Get tier from score
function getTier(score: number): "NOVATO" | "POTENCIAL" | "APROBABLE" {
  if (score >= 80) return "APROBABLE";
  if (score >= 60) return "POTENCIAL";
  return "NOVATO";
}

// Create fallback response
function createFallbackResponse(errorMsg: string): ConversationalResponse {
  return {
    reply: "Tuve un problema técnico, ¿podrías repetir tu última respuesta por favor?",
    datos_lead_update: {},
    fin_entrevista: false,
    debug: {
      intent_detected: null,
      missing_fields: [],
      score_rules: 0,
      score_ai: 0,
      score_total: 0,
      tier: null,
      error: errorMsg,
    },
  };
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
  
  // telefono/whatsapp -> contact.whatsapp
  if (!normalized.contact) {
    const whatsapp = normalized.whatsapp || normalized.telefono;
    if (whatsapp) {
      normalized.contact = { whatsapp: String(whatsapp) };
    }
  }
  
  // mayor_18/mayor_edad -> age_confirmed_18plus
  if (!normalized.age_confirmed_18plus) {
    if (normalized.mayor_18 !== undefined) {
      normalized.age_confirmed_18plus = Boolean(normalized.mayor_18);
    } else if (normalized.mayor_edad !== undefined) {
      normalized.age_confirmed_18plus = Boolean(normalized.mayor_edad);
    }
  }
  
  return normalized;
}

// Process and validate AI response
function processAIResponse(rawContent: string, collectedData: Record<string, unknown>): ConversationalResponse {
  const parsed = extractJSON(rawContent);
  
  if (!parsed) {
    console.error("Failed to extract JSON from:", rawContent);
    return createFallbackResponse("invalid_json_extraction");
  }
  
  // Validate required response fields
  if (typeof parsed.reply !== 'string' || !parsed.reply) {
    console.error("Missing or invalid 'reply' field");
    return createFallbackResponse("missing_reply_field");
  }
  
  // Merge with collected data
  const datosUpdate = (parsed.datos_lead_update || {}) as Record<string, unknown>;
  const rawMergedData = { ...collectedData, ...datosUpdate };
  
  // Normalize field aliases before validation
  const mergedData = normalizeFieldAliases(rawMergedData);
  
  // Get intent
  const intent = String(datosUpdate.intent || mergedData.intent || '').toUpperCase();
  
  // Calculate scores for agents
  let scoreRules = 0;
  let scoreAI = 0;
  let scoreTier: "NOVATO" | "POTENCIAL" | "APROBABLE" | null = null;
  
  if (intent === "AGENTE") {
    scoreRules = calculateRulesScore(mergedData);
    scoreAI = Math.min(Math.max(Number(datosUpdate.score_ai) || 0, 0), 40);
    const scoreTotal = scoreRules + scoreAI;
    scoreTier = getTier(scoreTotal);
  }
  
  // Validate required fields before allowing fin_entrevista
  let finEntrevista = Boolean(parsed.fin_entrevista);
  const missingFields = intent ? validateRequiredFields(intent, mergedData) : [];
  
  // Don't allow fin_entrevista if fields are missing
  if (finEntrevista && missingFields.length > 0) {
    console.log("Blocking fin_entrevista due to missing fields:", missingFields);
    finEntrevista = false;
  }
  
  // Build validated response
  const response: ConversationalResponse = {
    reply: String(parsed.reply),
    datos_lead_update: datosUpdate,
    fin_entrevista: finEntrevista,
    debug: {
      intent_detected: intent || null,
      missing_fields: missingFields,
      score_rules: scoreRules,
      score_ai: scoreAI,
      score_total: scoreRules + scoreAI,
      tier: scoreTier,
    },
  };
  
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
      console.error("No AI API configured");
      return new Response(
        JSON.stringify({ 
          error: "AI service not configured",
          fallback: true,
          message: "Servicio de IA no configurado."
        }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt based on request type
    let systemPrompt = "Eres un asistente de Ganaya.bet. Responde en español, sé amable y conciso.";

    if (type === "conversational") {
      const collectedInfo = collectedData && Object.keys(collectedData).length > 0 
        ? JSON.stringify(collectedData, null, 2) 
        : "Ninguno aún";
      systemPrompt = `${GANAYA_SYSTEM_PROMPT}

DATOS YA RECOPILADOS DEL USUARIO:
${collectedInfo}

RECUERDA: Tu respuesta debe ser SOLO un objeto JSON válido, sin texto adicional antes ni después.`;
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
      systemPrompt = `Genera un mensaje de WhatsApp personalizado para este lead.
Datos: ${JSON.stringify(leadData)}
Mensaje amigable, profesional, máximo 200 caracteres.`;
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

      const response = await fetch(
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
            JSON.stringify({ error: "Límite de solicitudes excedido." }), 
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Fall through to Lovable Gateway
        if (!useLovableGateway) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: createFallbackResponse("gemini_api_error") 
            }), 
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const data = await response.json();
        rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    }

    // Use Lovable AI Gateway if needed
    if (!rawContent && useLovableGateway) {
      console.log("Using Lovable AI Gateway");
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            JSON.stringify({ error: "Límite de solicitudes excedido." }), 
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Créditos de IA agotados." }), 
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("Lovable Gateway error:", response.status, errorText);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: createFallbackResponse("lovable_gateway_error") 
          }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      rawContent = data.choices?.[0]?.message?.content || "";
    }

    console.log("Raw AI content:", rawContent.substring(0, 500));

    // Process based on type
    if (type === "conversational") {
      const processed = processAIResponse(rawContent, collectedData);
      console.log("Processed response debug:", processed.debug);
      
      return new Response(
        JSON.stringify({ success: true, data: processed }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Simple response for other types
      return new Response(
        JSON.stringify({ success: true, content: rawContent }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: createFallbackResponse(String(error)) 
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
