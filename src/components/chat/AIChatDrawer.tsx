import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRefCode } from '@/hooks/useRefCode';
import type { LeadTier, LeadIntent } from '@/lib/firebase-types';

const WHATSAPP_NUMBER = '59176356972';

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

interface AIChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMessage?: string;
}

interface DebugInfo {
  intent_detected: string | null;
  missing_fields: string[];
  score_rules: number;
  score_ai: number;
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

const AIChatDrawer = ({ open, onOpenChange, initialMessage }: AIChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, unknown>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<LeadIntent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const { getRefCode } = useRefCode();

  // Extract numbered options from bot message for suggestion chips
  const extractSuggestions = (text: string): SuggestionChip[] => {
    const suggestions: SuggestionChip[] = [];
    
    // Match patterns like "1) option" or "1. option" or "1 option"
    const patterns = [
      /(\d+)\)\s*([^\n\d]+?)(?=\d+\)|$|\n)/g,
      /(\d+)\.\s*([^\n\d]+?)(?=\d+\.|$|\n)/g,
    ];
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const num = match[1];
        const label = match[2].trim().substring(0, 40); // Limit label length
        if (label.length > 2) {
          suggestions.push({ label: `${num}) ${label}`, value: num });
        }
      }
      if (suggestions.length > 0) break;
    }
    
    return suggestions.slice(0, 5); // Max 5 suggestions
  };

  // Initialize chat with greeting
  useEffect(() => {
    if (open && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: '¡Hola! 👋 Soy el asistente de Ganaya.bet. ¿En qué puedo ayudarte hoy?',
      };
      setMessages([greeting]);

      if (initialMessage) {
        setTimeout(() => {
          sendMessage(initialMessage);
        }, 500);
      }
    }
  }, [open, initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.data) {
        const response = data.data as ConversationalData;
        
        // CRITICAL: Merge data IMMEDIATELY before any state updates
        const mergedData = { ...collectedData, ...response.datos_lead_update };

        if (response.datos_lead_update && Object.keys(response.datos_lead_update).length > 0) {
          setCollectedData(mergedData);
        }

        const intentFromDebug = response.debug?.intent_detected;
        if (intentFromDebug && !detectedIntent) {
          setDetectedIntent(intentFromDebug as LeadIntent);
        }

        // Extract suggestions from the reply
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
          // Pass the MERGED data, not the stale collectedData
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
      const intent = detectedIntent || response.debug?.intent_detected as LeadIntent;
      
      // Map tier from debug
      let tier: LeadTier = 'NOVATO';
      let scoreTotal = 0;
      
      if (intent === 'AGENTE' && response.debug) {
        scoreTotal = response.debug.score_total;
        if (response.debug.tier === 'PROMETEDOR') {
          tier = 'PROMETEDOR';
        } else if (response.debug.tier === 'POTENCIAL') {
          tier = 'POTENCIAL';
        } else {
          tier = 'NOVATO';
        }
      }

      const refCode = getRefCode();
      const country = String(mergedData.pais || mergedData.country || 'No especificado');

      // Call save-chat-lead edge function (server-side save to Firestore)
      const { data: saveResult, error: saveError } = await supabase.functions.invoke('save-chat-lead', {
        body: {
          mergedData,
          debug: response.debug,
          intent,
          refCode,
          country,
          scoreTotal,
          tier,
        },
      });

      if (saveError) {
        throw new Error(saveError.message || 'Error al guardar');
      }

      if (!saveResult?.success) {
        throw new Error(saveResult?.error || 'No se pudo guardar el lead');
      }

      console.log('[Chat] Lead saved:', saveResult);
      toast.success('¡Datos registrados correctamente!');

    } catch (error) {
      console.error('[Chat] Error saving lead:', error);
      
      // Save to localStorage as fallback
      try {
        const pendingQueue = JSON.parse(localStorage.getItem('pendingLeadQueue') || '[]');
        pendingQueue.push({
          mergedData,
          debug: response.debug,
          intent: detectedIntent,
          refCode: getRefCode(),
          country: String(mergedData.pais || mergedData.country || ''),
          timestamp: Date.now(),
        });
        localStorage.setItem('pendingLeadQueue', JSON.stringify(pendingQueue));
        toast.warning('No se pudo guardar el lead. Reintentaremos más tarde.');
      } catch (localError) {
        console.error('[Chat] LocalStorage fallback also failed:', localError);
        toast.error('Error al guardar los datos. Por favor, intenta de nuevo.');
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
    setDetectedIntent(null);
    hasInitialized.current = false;
    
    setTimeout(() => {
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: '¡Hola! 👋 Soy el asistente de Ganaya.bet. ¿En qué puedo ayudarte hoy?',
      };
      setMessages([greeting]);
      hasInitialized.current = true;
    }, 100);
  };

  const getWhatsAppMessage = () => {
    const name = collectedData.nombre || '';
    const country = collectedData.pais || 'LATAM';
    
    if (detectedIntent === 'AGENTE') {
      return `Hola, quiero postular para ser agente de Ganaya.bet. Soy ${name} de ${country}. Ya completé el formulario del chat.`;
    }
    return `Hola, quiero apostar en Ganaya.bet. Soy ${name} de ${country}. ¿Me ayudás con la recarga?`;
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

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Asistente Ganaya</h3>
                  <p className="text-xs text-muted-foreground">
                    {detectedIntent === 'AGENTE' ? '💼 Evaluación de agente' : 
                     detectedIntent === 'JUGADOR' ? '🎰 Registro de jugador' : 
                     'IA Conversacional'}
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
                  
                  {/* Suggestion chips - show only for the last bot message */}
                  {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && 
                   index === messages.length - 1 && !isLoading && !isComplete && (
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

            {/* Quick actions for initial state */}
            {messages.length === 1 && !isComplete && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('Quiero apostar')}
                    className="hover:bg-primary/10 hover:border-primary"
                  >
                    🎰 Quiero apostar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('Quiero ser agente')}
                    className="hover:bg-primary/10 hover:border-primary"
                  >
                    💼 Quiero ser agente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('Tengo una duda')}
                    className="hover:bg-primary/10 hover:border-primary"
                  >
                    ❓ Tengo una duda
                  </Button>
                </div>
              </div>
            )}

            {/* Input */}
            {!isComplete ? (
              <form onSubmit={handleSubmit} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribí tu mensaje..."
                    className="flex-1"
                    disabled={isLoading}
                    autoFocus
                  />
                  <Button type="submit" variant="hero" size="icon" disabled={isLoading || !inputValue.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            ) : (
              /* Complete actions */
              <div className="p-4 border-t border-border space-y-2">
                <Button variant="whatsapp" className="w-full" asChild>
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getWhatsAppMessage())}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Continuar por WhatsApp
                  </a>
                </Button>
                <Button variant="outline" className="w-full" onClick={resetChat}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nueva consulta
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIChatDrawer;
