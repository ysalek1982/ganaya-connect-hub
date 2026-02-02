import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader2, MessageCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRefCode } from '@/hooks/useRefCode';
import { getTrackingData } from '@/hooks/useUTM';
import type { LeadTier } from '@/lib/firebase-types';

// Fallback WhatsApp if no agent found
const FALLBACK_WHATSAPP = '59176356972';

interface AgentInfo {
  whatsapp: string;
  contactLabel: string;
  messageTemplate?: string;
  displayName?: string;
}

interface SuggestionChip {
  label: string;
  value: string;
}

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
  suggestions?: SuggestionChip[];
}

interface AgentChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DebugInfo {
  configId: string | null;
  currentQuestionId: string | null;
  missingRequiredIds: string[];
  score_total: number;
  tier: 'NOVATO' | 'POTENCIAL' | 'PROMETEDOR' | null;
  error?: string;
}

interface ConversationalData {
  reply: string;
  datos_lead_update: Record<string, unknown>;
  fin_entrevista: boolean;
  debug: DebugInfo;
}

interface PendingLead {
  mergedData: Record<string, unknown>;
  debug?: Record<string, unknown>;
  intent: string;
  refCode: string | null;
  country: string;
  scoreTotal?: number;
  tier?: string;
  tracking?: Record<string, string>;
  timestamp: number;
}

const AgentChatDrawer = ({ open, onOpenChange }: AgentChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, unknown>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const { getRefCode, getCampaignId } = useRefCode();

  // Load agent info on mount based on refCode
  useEffect(() => {
    const loadAgentInfo = async () => {
      const refCode = getRefCode();
      const campaignId = getCampaignId();
      
      if (!refCode) {
        console.log('[Chat] No refCode, using fallback WhatsApp');
        return;
      }

      try {
        // Use query params approach for GET request
        const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-by-ref`);
        url.searchParams.set('ref', refCode);
        if (campaignId) url.searchParams.set('cid', campaignId);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.agentInfo) {
            setAgentInfo({
              whatsapp: result.agentInfo.whatsapp || FALLBACK_WHATSAPP,
              contactLabel: result.agentInfo.contactLabel || 'Tu asesor',
              messageTemplate: result.agentInfo.messageTemplate,
              displayName: result.agentInfo.displayName,
            });
            console.log('[Chat] Agent info loaded:', result.agentInfo.displayName);
          }
        }
      } catch (error) {
        console.error('[Chat] Error loading agent info:', error);
      }
    };

    loadAgentInfo();
  }, [getRefCode, getCampaignId]);

  // Retry pending leads from localStorage
  useEffect(() => {
    const retryPendingLeads = async () => {
      try {
        const pendingQueue = JSON.parse(localStorage.getItem('pendingLeadQueue') || '[]') as PendingLead[];
        if (pendingQueue.length === 0) return;

        console.log(`[Chat] Retrying ${pendingQueue.length} pending leads...`);
        const remaining: PendingLead[] = [];

        for (const item of pendingQueue) {
          try {
            const { data, error } = await supabase.functions.invoke('save-chat-lead', {
              body: {
                mergedData: item.mergedData,
                debug: item.debug,
                intent: item.intent,
                refCode: item.refCode,
                country: item.country,
                scoreTotal: item.scoreTotal,
                tier: item.tier,
                tracking: item.tracking,
              },
            });

            if (error || !data?.success) {
              remaining.push(item);
            } else {
              console.log('[Chat] Pending lead saved successfully');
            }
          } catch {
            remaining.push(item);
          }
        }

        localStorage.setItem('pendingLeadQueue', JSON.stringify(remaining));
        
        if (remaining.length < pendingQueue.length) {
          const saved = pendingQueue.length - remaining.length;
          toast.success(`${saved} postulación(es) pendiente(s) guardada(s)`);
        }
      } catch (error) {
        console.error('[Chat] Error retrying pending leads:', error);
      }
    };

    // Retry on mount and when online
    retryPendingLeads();
    window.addEventListener('online', retryPendingLeads);
    return () => window.removeEventListener('online', retryPendingLeads);
  }, []);

  // Extract numbered options from bot message for suggestion chips
  const extractSuggestions = (text: string): SuggestionChip[] => {
    const suggestions: SuggestionChip[] = [];
    const patterns = [
      /(\d+)\)\s*([^\n\d]+?)(?=\d+\)|$|\n)/g,
      /(\d+)\.\s*([^\n\d]+?)(?=\d+\.|$|\n)/g,
    ];
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const num = match[1];
        const label = match[2].trim().substring(0, 40);
        if (label.length > 2) {
          suggestions.push({ label: `${num}) ${label}`, value: num });
        }
      }
      if (suggestions.length > 0) break;
    }
    
    return suggestions.slice(0, 5);
  };

  // Initialize chat with greeting (no API call yet)
  useEffect(() => {
    if (open && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: '¡Hola! 👋 Gracias por tu interés en ser agente Ganaya.bet.\n\nTe haré unas preguntas rápidas (2 minutos) para conocerte mejor. ¿Empezamos?',
      };
      setMessages([greeting]);
    }
  }, [open, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (interviewStarted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, interviewStarted]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      hasInitialized.current = false;
    }
  }, [open]);

  const startInterview = async () => {
    setInterviewStarted(true);
    setIsLoading(true);
    
    try {
      // Send __start__ to get the first question from config
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: '__start__' }],
          type: 'conversational',
          collectedData: {},
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.success && data?.data) {
        const response = data.data as ConversationalData;
        setCollectedData(response.datos_lead_update);
        
        const suggestions = extractSuggestions(response.reply);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: response.reply,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('[Chat] Start interview error:', error);
      
      // Fallback first question
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '¡Empecemos! ¿Cuál es tu nombre completo?',
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === 'bot' ? 'assistant' as const : 'user' as const,
        content: m.content,
      }));

      conversationHistory.push({
        role: 'user' as const,
        content: content.trim(),
      });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: conversationHistory,
          type: 'conversational',
          collectedData,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.success && data?.data) {
        const response = data.data as ConversationalData;
        const mergedData = { ...collectedData, ...response.datos_lead_update };
        setCollectedData(mergedData);

        const suggestions = extractSuggestions(response.reply);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: response.reply,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
        setMessages(prev => [...prev, botMessage]);

        if (response.fin_entrevista) {
          setIsComplete(true);
          await saveLead(mergedData, response);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Disculpá, hubo un problema técnico. ¿Podés repetir tu mensaje?',
      };
      setMessages(prev => [...prev, fallbackMessage]);
      toast.error('Error al procesar el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLead = async (mergedData: Record<string, unknown>, response: ConversationalData) => {
    try {
      let tier: LeadTier = 'NOVATO';
      let scoreTotal = 0;
      
      if (response.debug) {
        scoreTotal = response.debug.score_total;
        const tierVal = response.debug.tier;
        if (tierVal === 'PROMETEDOR') tier = 'PROMETEDOR';
        else if (tierVal === 'POTENCIAL') tier = 'POTENCIAL';
        else tier = 'NOVATO';
      }

      const refCode = getRefCode();
      const campaignId = getCampaignId();
      const answers = mergedData.answers as Record<string, unknown> || mergedData;
      const country = String(answers.country || answers.pais || mergedData.country || mergedData.pais || 'No especificado');

      // Capture UTM tracking data
      const tracking = getTrackingData();

      const { data: saveResult, error: saveError } = await supabase.functions.invoke('save-chat-lead', {
        body: {
          mergedData,
          debug: response.debug,
          intent: 'AGENTE',
          refCode,
          campaignId,
          country,
          scoreTotal,
          tier,
          tracking, // Include UTM params
        },
      });

      if (saveError) throw new Error(saveError.message || 'Error al guardar');
      if (!saveResult?.success) throw new Error(saveResult?.error || 'No se pudo guardar el lead');

      console.log('[Chat] Lead saved:', saveResult);
      toast.success('¡Postulación registrada correctamente!');

    } catch (error) {
      console.error('[Chat] Error saving lead:', error);
      
      try {
        const pendingQueue = JSON.parse(localStorage.getItem('pendingLeadQueue') || '[]') as PendingLead[];
        pendingQueue.push({
          mergedData,
          debug: response.debug as unknown as Record<string, unknown>,
          intent: 'AGENTE',
          refCode: getRefCode(),
          country: String(mergedData.pais || mergedData.country || ''),
          scoreTotal: response.debug?.score_total,
          tier: response.debug?.tier || undefined,
          tracking: getTrackingData(),
          timestamp: Date.now(),
        });
        localStorage.setItem('pendingLeadQueue', JSON.stringify(pendingQueue));
        toast.warning('Guardado en cola. Se enviará cuando haya conexión.');
      } catch (localError) {
        console.error('[Chat] LocalStorage fallback failed:', localError);
        toast.error('Error al guardar. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const resetChat = () => {
    setMessages([]);
    setCollectedData({});
    setInputValue('');
    setIsComplete(false);
    setInterviewStarted(false);
    hasInitialized.current = false;
    
    setTimeout(() => {
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: '¡Hola! 👋 Gracias por tu interés en ser agente Ganaya.bet.\n\nTe haré unas preguntas rápidas (2 minutos) para conocerte mejor. ¿Empezamos?',
      };
      setMessages([greeting]);
      hasInitialized.current = true;
    }, 100);
  };

  const getWhatsAppNumber = (): string => {
    return agentInfo?.whatsapp || FALLBACK_WHATSAPP;
  };

  const getWhatsAppMessage = (): string => {
    const answers = collectedData.answers as Record<string, unknown> || collectedData;
    const name = String(answers.name || collectedData.nombre || '');
    const country = String(answers.country || answers.pais || collectedData.pais || 'LATAM');
    const tier = String(collectedData.tier || 'NOVATO');

    // Use agent's message template if available
    if (agentInfo?.messageTemplate) {
      return agentInfo.messageTemplate
        .replace('{name}', name)
        .replace('{country}', country)
        .replace('{tier}', tier)
        .replace('{agentName}', agentInfo.displayName || 'Tu asesor');
    }

    // Default message
    return `Hola, quiero postular para ser agente de Ganaya.bet. Soy ${name} de ${country}. Ya completé el formulario del chat.`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Bottom sheet drawer for mobile, side drawer for desktop */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-md h-[85vh] md:h-full bg-background border-t md:border-t-0 md:border-l border-border z-50 flex flex-col rounded-t-3xl md:rounded-none"
          >
            {/* Handle bar for mobile */}
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Postulación Agente</h3>
                  <p className="text-xs text-muted-foreground">
                    {agentInfo?.contactLabel || '💼 Evaluación de perfil'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={resetChat} title="Nueva conversación">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-md' 
                        : 'glass-card rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-line text-sm">{msg.content}</p>
                    </div>
                  </div>
                  
                  {/* Suggestion chips */}
                  {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && 
                   index === messages.length - 1 && !isLoading && !isComplete && interviewStarted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-wrap gap-2 mt-2 max-w-[90%]"
                    >
                      {msg.suggestions.map((chip, chipIndex) => (
                        <Button
                          key={chipIndex}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(chip.value)}
                          className="text-xs bg-background/80 hover:bg-primary/10 hover:border-primary border-border/50 transition-all"
                        >
                          {chip.label}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Escribiendo...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Start interview button */}
            {!interviewStarted && !isComplete && (
              <div className="px-4 pb-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={startInterview}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      Comenzar entrevista
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Input */}
            {interviewStarted && !isComplete && (
              <form onSubmit={handleSubmit} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribí tu respuesta..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" variant="hero" size="icon" disabled={isLoading || !inputValue.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Complete actions */}
            {isComplete && (
              <div className="p-4 border-t border-border space-y-2">
                <Button variant="whatsapp" className="w-full" asChild>
                  <a 
                    href={`https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(getWhatsAppMessage())}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Continuar por WhatsApp
                  </a>
                </Button>
                <Button variant="outline" className="w-full" onClick={resetChat}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nueva postulación
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AgentChatDrawer;
