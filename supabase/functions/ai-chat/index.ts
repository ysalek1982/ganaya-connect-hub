import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ TYPES ============

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface QuestionOption {
  value: string;
  label: string;
  points: number;
}

interface ScoringRule {
  condition: string;
  value?: string | number | boolean;
  points: number;
}

interface ChatQuestion {
  id: string;
  label: string;
  prompt: string;
  type: "text" | "select" | "boolean" | "number";
  required: boolean;
  options?: QuestionOption[];
  scoring?: { rules: ScoringRule[] };
  storeKey?: string;
  order: number;
}

interface ChatConfig {
  id: string;
  name: string;
  isActive: boolean;
  version: number;
  introMessage?: string;
  thresholds: {
    prometedorMin: number;
    potencialMin: number;
  };
  tone?: {
    confirmationPhrases?: string[];
    transitionPhrases?: string[];
    errorMessage?: string;
    humorEnabled?: boolean;
    humorStyle?: 'soft' | 'playful';
    humorLines?: string[];
  };
  closing: {
    successTitle: string;
    successMessage: string;
    nextSteps: string;
    ctaLabel?: string;
    ctaWhatsAppLabel?: string; // Legacy support
  };
  disqualifiedClosing?: {
    title: string;
    message: string;
    nextSteps: string;
  };
  questions: ChatQuestion[];
}

interface ChatState {
  configId: string;
  configVersion: number;
  currentQuestionId: string | null;
  answeredIds: string[];
  humorShown?: boolean;
}

interface ScoreBreakdownItem {
  key: string;
  label: string;
  value: unknown;
  pointsAwarded: number;
  maxPoints: number;
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
  debug: {
    configId: string | null;
    currentQuestionId: string | null;
    missingRequiredIds: string[];
    score_total: number;
    tier: "NOVATO" | "POTENCIAL" | "PROMETEDOR" | null;
    error?: string;
  };
}

// ============ FIREBASE ADMIN ============

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
    const error = await tokenResponse.text();
    console.error("[ai-chat] Token exchange failed:", error);
    throw new Error("Failed to get Firebase access token");
  }

  const { access_token } = await tokenResponse.json();
  
  return {
    accessToken: access_token,
    projectId: serviceAccount.project_id,
  };
};

// Parse Firestore value
function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(String(value.integerValue), 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return new Date(String(value.timestampValue));
  if (value.mapValue !== undefined) {
    const fields = (value.mapValue as Record<string, unknown>).fields as Record<string, Record<string, unknown>>;
    if (!fields) return {};
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      result[k] = parseFirestoreValue(v);
    }
    return result;
  }
  if (value.arrayValue !== undefined) {
    const values = (value.arrayValue as Record<string, unknown>).values as Array<Record<string, unknown>>;
    if (!values) return [];
    return values.map(parseFirestoreValue);
  }
  return null;
}

// ============ LOAD ACTIVE CONFIG FROM FIRESTORE ============

async function loadActiveConfig(accessToken: string, projectId: string): Promise<ChatConfig | null> {
  try {
    const query = {
      structuredQuery: {
        from: [{ collectionId: "chat_configs" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "isActive" },
            op: "EQUAL",
            value: { booleanValue: true }
          }
        },
        limit: 1
      }
    };

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${accessToken}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(query),
      }
    );

    if (!response.ok) {
      console.error("[ai-chat] Failed to query chat_configs:", await response.text());
      return null;
    }

    const results = await response.json();
    
    for (const result of results) {
      if (result.document) {
        const fields = result.document.fields as Record<string, Record<string, unknown>>;
        const docName = result.document.name as string;
        const docId = docName.split('/').pop() || '';
        
        const parsed: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          parsed[key] = parseFirestoreValue(value);
        }

        const config: ChatConfig = {
          id: docId,
          name: String(parsed.name || 'Default'),
          isActive: true,
          version: Number(parsed.version || 1),
          thresholds: (parsed.thresholds as ChatConfig['thresholds']) || { prometedorMin: 70, potencialMin: 40 },
          closing: (parsed.closing as ChatConfig['closing']) || {
            successTitle: '¡Gracias!',
            successMessage: 'Tu postulación fue recibida.',
            nextSteps: 'Te contactaremos pronto.',
            ctaWhatsAppLabel: 'Contactar por WhatsApp'
          },
          questions: ((parsed.questions as ChatQuestion[]) || []).sort((a, b) => a.order - b.order),
        };

        console.log("[ai-chat] Loaded active config:", config.id, "with", config.questions.length, "questions");
        return config;
      }
    }

    return null;
  } catch (error) {
    console.error("[ai-chat] Error loading config:", error);
    return null;
  }
}

// ============ LOAD GEMINI API KEY FROM FIRESTORE ============

async function loadGeminiApiKey(accessToken: string, projectId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/ai`,
      { headers: { "Authorization": `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      console.log("[ai-chat] No Firestore settings/ai found");
      return null;
    }

    const doc = await response.json();
    if (doc.fields?.gemini_api_key?.stringValue) {
      console.log("[ai-chat] Loaded Gemini API key from Firestore");
      return doc.fields.gemini_api_key.stringValue;
    }
    
    return null;
  } catch (error) {
    console.error("[ai-chat] Error loading Gemini API key:", error);
    return null;
  }
}

// ============ DEFAULT CONFIG (FALLBACK) ============

const DEFAULT_CONFIG: ChatConfig = {
  id: 'default',
  name: 'Default Config',
  isActive: true,
  version: 2,
  introMessage: '¡Hola! 👋 Soy tu Project Manager del Programa de Agentes de Ganaya.bet.\n\nTe haré unas preguntas rápidas (2 minutos) para evaluar tu perfil y ayudarte a iniciar. ¿Listo/a?',
  thresholds: { prometedorMin: 70, potencialMin: 45 },
  tone: {
    confirmationPhrases: ['Perfecto, gracias 🙌', 'Buenísimo, anotado ✅', 'Genial, seguimos…', 'Muy bien 👍'],
    transitionPhrases: ['Vamos bien. Falta poco.', 'Súper. Ahora una más y terminamos.', 'Ya casi terminamos…'],
    errorMessage: 'Perdón, no lo entendí bien. ¿Puedes responder con 1 o 2?',
    humorEnabled: true,
    humorStyle: 'soft',
    humorLines: [
      'Dato divertido 😄: a veces nos dicen "no será tan difícil"… tranqui, aquí es fácil.',
      'Promesa: nada de "examen sorpresa" 😅 Vamos paso a paso.',
    ],
  },
  closing: {
    successTitle: '¡Listo! Recibimos tu postulación 🙌',
    successMessage: 'Gracias por tu tiempo. Un Project Manager te escribirá por WhatsApp para coordinar los siguientes pasos.',
    nextSteps: '📌 Mantén tu WhatsApp disponible.\n📌 Si tu perfil encaja, coordinamos un onboarding corto y te activamos tu enlace.',
    ctaLabel: 'Entendido'
  },
  disqualifiedClosing: {
    title: 'Gracias por tu interés 🙏',
    message: 'Para continuar con el programa de agentes, es necesario ser mayor de 18 años.',
    nextSteps: 'Si te equivocaste al responder, vuelve a intentarlo.',
  },
  questions: [
    { id: 'name', label: 'Nombre', prompt: '¿Cuál es tu nombre completo?', type: 'text', required: true, storeKey: 'name', order: 1 },
    { 
      id: 'country', label: 'País', prompt: '¿En qué país te encuentras?', type: 'select', required: true, storeKey: 'country',
      options: [
        { value: 'Paraguay', label: 'Paraguay', points: 10 },
        { value: 'Argentina', label: 'Argentina', points: 10 },
        { value: 'Chile', label: 'Chile', points: 10 },
        { value: 'Colombia', label: 'Colombia', points: 10 },
        { value: 'Ecuador', label: 'Ecuador', points: 10 },
        { value: 'México', label: 'México', points: 10 },
        { value: 'USA', label: 'USA', points: 10 },
        { value: 'España', label: 'España', points: 10 },
        { value: 'Otro', label: 'Otro país', points: 5 },
      ],
      order: 2
    },
    { id: 'whatsapp', label: 'WhatsApp', prompt: '¿Cuál es tu número de WhatsApp con código de país? (ej: +595981123456)', type: 'text', required: true, storeKey: 'whatsapp', order: 3 },
    { id: 'age18', label: 'Mayor de 18', prompt: '¿Eres mayor de 18 años?\n1) Sí\n2) No', type: 'boolean', required: true, storeKey: 'age18', scoring: { rules: [{ condition: '==', value: true, points: 10 }] }, order: 4 },
    { 
      id: 'hours_per_day', label: 'Disponibilidad', prompt: '¿Cuántas horas al día podrías dedicar?\n1) 6 o más horas\n2) 4-6 horas\n3) 2-4 horas\n4) Menos de 2 horas', 
      type: 'select', required: true, storeKey: 'hours_per_day',
      options: [
        { value: '6+', label: '6+ horas', points: 30 },
        { value: '4-6', label: '4-6 horas', points: 25 },
        { value: '2-4', label: '2-4 horas', points: 15 },
        { value: '0-2', label: '<2 horas', points: 5 },
      ],
      order: 5 
    },
    { 
      id: 'has_sales_experience', label: 'Experiencia ventas', prompt: '¿Tienes experiencia en ventas o atención al cliente?\n1) Sí\n2) No', 
      type: 'boolean', required: true, storeKey: 'has_sales_experience',
      scoring: { rules: [{ condition: '==', value: true, points: 20 }] },
      order: 6 
    },
    { 
      id: 'knows_casino_players', label: 'Conoce jugadores', prompt: '¿Conoces personas que jueguen en casinos en línea?\n1) Sí\n2) No', 
      type: 'select', required: true, storeKey: 'knows_casino_players',
      options: [
        { value: 'yes', label: 'Sí', points: 20 },
        { value: 'no', label: 'No', points: 0 },
      ],
      order: 7 
    },
    { 
      id: 'wants_to_recruit', label: 'Interés reclutar', prompt: '¿Te interesaría reclutar sub-agentes para hacer crecer tu red?\n1) Sí, me interesa\n2) Tal vez más adelante\n3) No por ahora', 
      type: 'select', required: true, storeKey: 'wants_to_recruit',
      options: [
        { value: 'yes', label: 'Sí, me interesa', points: 20 },
        { value: 'maybe', label: 'Tal vez', points: 10 },
        { value: 'no', label: 'No por ahora', points: 5 },
      ],
      order: 8 
    },
    { 
      id: 'wallet_knowledge', label: 'Wallet / Binance', prompt: '¿Cuál es tu nivel de conocimiento realizando transacciones en Binance u otra wallet? (Es solo para saber si necesitas capacitación)\n1) Experto\n2) Intermedio\n3) Básico\n4) No sé qué es eso', 
      type: 'select', required: true, storeKey: 'wallet_knowledge',
      options: [
        { value: 'expert', label: 'Experto', points: 20 },
        { value: 'intermediate', label: 'Intermedio', points: 12 },
        { value: 'basic', label: 'Básico', points: 6 },
        { value: 'none', label: 'No sé qué es eso', points: 0 },
      ],
      order: 9 
    },
  ],
};

// ============ HELPER: GET RANDOM PHRASE ============

function getRandomPhrase(phrases: string[] | undefined): string {
  if (!phrases || phrases.length === 0) return '';
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// ============ SCORING LOGIC ============

function calculateScoreFromConfig(
  answers: Record<string, unknown>,
  config: ChatConfig
): { scoreTotal: number; tier: "NOVATO" | "POTENCIAL" | "PROMETEDOR"; scoreBreakdown: ScoreBreakdownItem[] } {
  const breakdown: ScoreBreakdownItem[] = [];
  let total = 0;

  for (const question of config.questions) {
    const answerValue = answers[question.id];
    let pointsAwarded = 0;
    let maxPoints = 0;

    if (question.type === 'select' && question.options) {
      maxPoints = Math.max(...question.options.map(o => o.points));
      const selectedOption = question.options.find(o => o.value === answerValue || o.label === answerValue);
      if (selectedOption) {
        pointsAwarded = selectedOption.points;
      }
    } else if (question.type === 'boolean' && question.scoring?.rules) {
      for (const rule of question.scoring.rules) {
        if (rule.condition === '==' && rule.value === true) {
          maxPoints = rule.points;
          if (answerValue === true) {
            pointsAwarded = rule.points;
          }
        }
      }
    } else if (question.type === 'number' && question.scoring?.rules) {
      const numValue = typeof answerValue === 'number' ? answerValue : parseFloat(String(answerValue || '0'));
      maxPoints = Math.max(...question.scoring.rules.map(r => r.points));
      for (const rule of question.scoring.rules) {
        const ruleValue = Number(rule.value);
        let matched = false;
        if (rule.condition === '>=' && numValue >= ruleValue) matched = true;
        if (rule.condition === '>' && numValue > ruleValue) matched = true;
        if (rule.condition === '<=' && numValue <= ruleValue) matched = true;
        if (rule.condition === '<' && numValue < ruleValue) matched = true;
        if (rule.condition === '==' && numValue === ruleValue) matched = true;
        if (matched && rule.points > pointsAwarded) {
          pointsAwarded = rule.points;
        }
      }
    }

    if (maxPoints > 0 || pointsAwarded > 0) {
      breakdown.push({
        key: question.id,
        label: question.label,
        value: answerValue ?? null,
        pointsAwarded,
        maxPoints,
      });
    }

    total += pointsAwarded;
  }

  const tier = total >= config.thresholds.prometedorMin 
    ? "PROMETEDOR" 
    : total >= config.thresholds.potencialMin 
      ? "POTENCIAL" 
      : "NOVATO";

  return { scoreTotal: total, tier, scoreBreakdown: breakdown };
}

// ============ PARSE USER ANSWER ============

function parseUserAnswer(
  userMessage: string,
  question: ChatQuestion
): { value: unknown; storeKeyValue: unknown } {
  const msg = userMessage.trim().toLowerCase();

  if (question.type === 'select' && question.options) {
    // Check for number input (1, 2, 3...)
    const numMatch = userMessage.trim().match(/^(\d+)$/);
    if (numMatch) {
      const idx = parseInt(numMatch[1]) - 1;
      if (idx >= 0 && idx < question.options.length) {
        const opt = question.options[idx];
        return { value: opt.value, storeKeyValue: opt.value };
      }
    }
    // Check for exact value or label match
    for (const opt of question.options) {
      if (msg === opt.value.toLowerCase() || msg === opt.label.toLowerCase()) {
        return { value: opt.value, storeKeyValue: opt.value };
      }
    }
    // Partial match
    for (const opt of question.options) {
      if (msg.includes(opt.value.toLowerCase()) || opt.label.toLowerCase().includes(msg)) {
        return { value: opt.value, storeKeyValue: opt.value };
      }
    }
    return { value: userMessage.trim(), storeKeyValue: userMessage.trim() };
  }

  if (question.type === 'boolean') {
    const yesPatterns = ['1', 'sí', 'si', 'yes', 'ok', 'claro', 'dale', 'listo', 'afirmativo'];
    const noPatterns = ['2', 'no', 'nope', 'negativo', 'todavia no', 'aun no'];
    
    if (yesPatterns.some(p => msg === p || msg.startsWith(p + ' ') || msg.startsWith(p + ','))) {
      return { value: true, storeKeyValue: true };
    }
    if (noPatterns.some(p => msg === p || msg.startsWith(p + ' ') || msg.startsWith(p + ','))) {
      return { value: false, storeKeyValue: false };
    }
    return { value: null, storeKeyValue: null };
  }

  if (question.type === 'number') {
    const num = parseFloat(userMessage.replace(/[^0-9.]/g, ''));
    return { value: isNaN(num) ? null : num, storeKeyValue: isNaN(num) ? null : num };
  }

  // text
  return { value: userMessage.trim(), storeKeyValue: userMessage.trim() };
}

// ============ BUILD QUESTION PROMPT ============

function buildQuestionPrompt(question: ChatQuestion): string {
  let prompt = question.prompt;
  
  // If select type and options not already in prompt, add them
  if (question.type === 'select' && question.options && !prompt.includes('1)') && !prompt.includes('1.')) {
    prompt += '\n';
    question.options.forEach((opt, i) => {
      prompt += `${i + 1}) ${opt.label}\n`;
    });
  }
  
  // If boolean and not already formatted
  if (question.type === 'boolean' && !prompt.includes('1)') && !prompt.includes('Sí') && !prompt.includes('No')) {
    prompt += '\n1) Sí\n2) No';
  }
  
  return prompt.trim();
}

// ============ RESTRICTED COUNTRIES ============
// Countries can be configured in Firestore settings/eligibility.allowedCountries
// If not configured, all countries are allowed (empty array = no restrictions)

const RESTRICTED_COUNTRIES: string[] = []; // No hardcoded restrictions - use Firestore config if needed

function isRestrictedCountry(_value: string): boolean {
  // No restrictions by default - can be enabled via Firestore settings/eligibility
  if (RESTRICTED_COUNTRIES.length === 0) return false;
  const normalized = _value.toLowerCase().trim();
  return RESTRICTED_COUNTRIES.some(c => normalized === c || normalized.includes(c));
}

// ============ CONFIG-DRIVEN CHAT HANDLER ============

async function handleConfigDrivenChat(
  userMessage: string,
  collectedData: Record<string, unknown>,
  config: ChatConfig
): Promise<ConversationalResponse> {
  const answers = (collectedData.answers || {}) as Record<string, unknown>;
  let chatState = collectedData._chatState as ChatState | undefined;
  
  // Initialize chat state if not present
  if (!chatState) {
    chatState = {
      configId: config.id,
      configVersion: config.version,
      currentQuestionId: null,
      answeredIds: [],
    };
  }

  // Get sorted questions
  const sortedQuestions = [...config.questions].sort((a, b) => a.order - b.order);

  // If this is the start message or no current question, find first unanswered
  const isStartMessage = userMessage === '__start__' || userMessage.toLowerCase().includes('quiero ser agente') || userMessage.toLowerCase().includes('comenzar');
  
  // Track if we got a valid answer (for confirmation phrase)
  let gotValidAnswer = false;
  let invalidAnswerForQuestion: ChatQuestion | null = null;

  if (!isStartMessage && chatState.currentQuestionId) {
    // Process answer to current question
    const currentQ = sortedQuestions.find(q => q.id === chatState!.currentQuestionId);
    if (currentQ) {
      const { value, storeKeyValue } = parseUserAnswer(userMessage, currentQ);
      
      // Check for restricted country if this is a country question
      const isCountryQuestion = currentQ.id === 'country' || currentQ.id === 'pais' || currentQ.storeKey === 'country' || currentQ.storeKey === 'pais';
      if (isCountryQuestion && typeof value === 'string' && isRestrictedCountry(value)) {
        return {
          reply: `⚠️ Lo sentimos, actualmente Ganaya.bet no opera en ${value}.\n\nPor el momento solo tenemos presencia en: Paraguay, Argentina, Chile, Colombia, Ecuador, México y USA.\n\n¡Esperamos poder estar disponibles en tu país pronto! 🙏`,
          datos_lead_update: {
            answers,
            _chatState: chatState,
            restricted_country: true,
            attempted_country: value,
            status: 'REJECTED',
          },
          fin_entrevista: true,
          debug: {
            configId: config.id,
            currentQuestionId: chatState.currentQuestionId,
            missingRequiredIds: [],
            score_total: 0,
            tier: null,
            error: 'restricted_country',
          },
        };
      }
      
      // Check for age18 disqualification
      const isAge18Question = currentQ.id === 'age18' || currentQ.storeKey === 'age18';
      if (isAge18Question && value === false) {
        const disq = config.disqualifiedClosing || DEFAULT_CONFIG.disqualifiedClosing!;
        return {
          reply: `${disq.title}\n\n${disq.message}\n\n${disq.nextSteps}`,
          datos_lead_update: {
            answers: { ...answers, [currentQ.id]: value, age18: false },
            _chatState: chatState,
            disqualified: true,
            disqualified_reason: 'under_18',
            status: 'DISQUALIFIED',
            tier: 'NOVATO',
            scoreTotal: 0,
          },
          fin_entrevista: true,
          debug: {
            configId: config.id,
            currentQuestionId: chatState.currentQuestionId,
            missingRequiredIds: [],
            score_total: 0,
            tier: 'NOVATO',
            error: 'disqualified_under_18',
          },
        };
      }
      
      // Check if value is valid
      if (value !== null && value !== undefined) {
        answers[currentQ.id] = value;
        if (currentQ.storeKey) {
          answers[currentQ.storeKey] = storeKeyValue;
        }
        if (!chatState.answeredIds.includes(currentQ.id)) {
          chatState.answeredIds.push(currentQ.id);
        }
        gotValidAnswer = true;
      } else if ((currentQ.type === 'boolean' || currentQ.type === 'select') && currentQ.required) {
        // Invalid answer for select/boolean - ask again with error message
        invalidAnswerForQuestion = currentQ;
      }
    }
  }

  // If invalid answer, repeat the question with error message
  if (invalidAnswerForQuestion) {
    const errorMsg = config.tone?.errorMessage || DEFAULT_CONFIG.tone?.errorMessage || 'Perdón, no lo entendí bien. ¿Puedes responder con una de las opciones?';
    return {
      reply: `${errorMsg}\n\n${buildQuestionPrompt(invalidAnswerForQuestion)}`,
      datos_lead_update: {
        answers,
        _chatState: chatState,
      },
      fin_entrevista: false,
      debug: {
        configId: config.id,
        currentQuestionId: chatState.currentQuestionId,
        missingRequiredIds: [],
        score_total: 0,
        tier: null,
        error: 'invalid_answer',
      },
    };
  }

  // Find next unanswered question
  let nextQuestion: ChatQuestion | null = null;
  const missingRequired: string[] = [];
  
  for (const q of sortedQuestions) {
    if (!chatState.answeredIds.includes(q.id) && answers[q.id] === undefined) {
      if (nextQuestion === null) {
        nextQuestion = q;
      }
      if (q.required) {
        missingRequired.push(q.id);
      }
    } else if (q.required && (answers[q.id] === undefined || answers[q.id] === null)) {
      missingRequired.push(q.id);
    }
  }

  // Calculate score
  const { scoreTotal, tier, scoreBreakdown } = calculateScoreFromConfig(answers, config);

  // Check if interview is complete
  const allRequiredAnswered = sortedQuestions
    .filter(q => q.required)
    .every(q => chatState!.answeredIds.includes(q.id) || answers[q.id] !== undefined);

  const finEntrevista = allRequiredAnswered && nextQuestion === null;

  // Build reply
  let reply: string;
  
  if (finEntrevista) {
    const name = answers.name || answers.nombre || '';
    const country = answers.country || answers.pais || '';
    const whatsapp = answers.whatsapp || '';
    
    reply = `${config.closing.successTitle}\n\n${config.closing.successMessage}\n\n`;
    reply += `📋 Resumen:\n• Nombre: ${name}\n• País: ${country}\n• WhatsApp: ${whatsapp}\n\n`;
    reply += `${config.closing.nextSteps}`;
  } else if (nextQuestion) {
    chatState.currentQuestionId = nextQuestion.id;
    
    if (isStartMessage) {
      // Use intro message from config
      const intro = config.introMessage || DEFAULT_CONFIG.introMessage || '¡Hola! 👋 Soy el asistente de reclutamiento de Ganaya.bet.';
      reply = `${intro}\n\n${buildQuestionPrompt(nextQuestion)}`;
    } else {
      // Add confirmation phrase if we got a valid answer
      let prefix = '';
      if (gotValidAnswer) {
        // Decide: use confirmation or transition phrase
        const answeredCount = chatState.answeredIds.length;
        const totalQuestions = sortedQuestions.length;
        const progress = answeredCount / totalQuestions;
        
        if (progress >= 0.7) {
          // Near the end, use transition phrase
          prefix = getRandomPhrase(config.tone?.transitionPhrases) || getRandomPhrase(DEFAULT_CONFIG.tone?.transitionPhrases);
        } else {
          // Use confirmation phrase
          prefix = getRandomPhrase(config.tone?.confirmationPhrases) || getRandomPhrase(DEFAULT_CONFIG.tone?.confirmationPhrases);
        }
        
        // Insert humor ONCE per conversation after 2nd valid answer
        const humorEnabled = config.tone?.humorEnabled ?? DEFAULT_CONFIG.tone?.humorEnabled ?? true;
        const humorLines = config.tone?.humorLines || DEFAULT_CONFIG.tone?.humorLines || [];
        
        if (humorEnabled && !chatState.humorShown && answeredCount === 2 && humorLines.length > 0) {
          const humorLine = getRandomPhrase(humorLines);
          if (humorLine) {
            prefix = prefix ? `${prefix}\n\n${humorLine}` : humorLine;
            chatState.humorShown = true;
          }
        }
      }
      
      reply = prefix ? `${prefix}\n\n${buildQuestionPrompt(nextQuestion)}` : buildQuestionPrompt(nextQuestion);
    }
  } else {
    reply = "¡Gracias! Hemos completado todas las preguntas.";
  }

  // Build response
  const datosUpdate: Record<string, unknown> = {
    answers,
    _chatState: chatState,
    scoreTotal,
    tier,
    scoreBreakdown,
    chatConfigId: config.id,
    chatConfigVersion: config.version,
  };

  // Also include storeKey values at top level for compatibility
  for (const q of sortedQuestions) {
    if (q.storeKey && answers[q.id] !== undefined) {
      datosUpdate[q.storeKey] = answers[q.storeKey] ?? answers[q.id];
    }
  }

  return {
    reply,
    datos_lead_update: datosUpdate,
    fin_entrevista: finEntrevista,
    debug: {
      configId: config.id,
      currentQuestionId: chatState.currentQuestionId,
      missingRequiredIds: missingRequired,
      score_total: scoreTotal,
      tier: tier,
    },
  };
}

// ============ MAIN HANDLER ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type = "chat", leadData, collectedData = {} } = await req.json() as RequestBody;
    
    console.log("[ai-chat] Request type:", type);

    // Initialize Firebase Admin for config and settings
    let firebaseAccessToken: string | null = null;
    let firebaseProjectId: string | null = null;
    
    try {
      const firebase = await initFirebaseAdmin();
      firebaseAccessToken = firebase.accessToken;
      firebaseProjectId = firebase.projectId;
    } catch (err) {
      console.error("[ai-chat] Firebase Admin init failed:", err);
    }

    // For conversational type, use config-driven approach
    if (type === "conversational") {
      // Load active config from Firestore
      let config: ChatConfig = DEFAULT_CONFIG;
      
      if (firebaseAccessToken && firebaseProjectId) {
        const activeConfig = await loadActiveConfig(firebaseAccessToken, firebaseProjectId);
        if (activeConfig && activeConfig.questions.length > 0) {
          config = activeConfig;
          console.log("[ai-chat] Using active config:", config.id);
        } else {
          console.log("[ai-chat] No active config found, using default");
        }
      }

      // Get the last user message
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '__start__';

      // Process with config-driven logic
      const response = await handleConfigDrivenChat(lastUserMessage, collectedData, config);

      return new Response(
        JSON.stringify({ success: true, data: response }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For other types (summarize, suggest_whatsapp), use AI
    // Priority: 1. Firestore settings/ai, 2. ENV GEMINI_API_KEY, 3. Lovable Gateway
    let geminiApiKey: string | null = null;
    
    if (firebaseAccessToken && firebaseProjectId) {
      geminiApiKey = await loadGeminiApiKey(firebaseAccessToken, firebaseProjectId);
    }
    
    if (!geminiApiKey) {
      geminiApiKey = Deno.env.get("GEMINI_API_KEY") || null;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const useGemini = !!geminiApiKey;
    const useLovableGateway = !useGemini && !!LOVABLE_API_KEY;

    if (!useGemini && !useLovableGateway) {
      return new Response(
        JSON.stringify({ 
          error: "IA no configurada. Configure la API Key de Gemini en Admin > Configuración.",
          fallback: true,
        }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "Eres un asistente de Ganaya.bet. Responde en español.";

    if (type === "summarize" && leadData) {
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

    if (useGemini) {
      const geminiMessages = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      ];

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      const gatewayMessages = [
        { role: "system", content: systemPrompt },
        ...messages
      ];

      const gatewayResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: gatewayMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!gatewayResponse.ok) {
        const errorText = await gatewayResponse.text();
        throw new Error(`Gateway API error: ${gatewayResponse.status} :: ${errorText}`);
      }

      const gatewayData = await gatewayResponse.json();
      rawContent = gatewayData.choices?.[0]?.message?.content || "";
    }

    return new Response(
      JSON.stringify({ content: rawContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[ai-chat] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        success: false,
        error: message,
        data: {
          reply: "Disculpá, tuve un problema técnico. ¿Podés repetir?",
          datos_lead_update: {},
          fin_entrevista: false,
          debug: { error: message, configId: null, currentQuestionId: null, missingRequiredIds: [], score_total: 0, tier: null }
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
