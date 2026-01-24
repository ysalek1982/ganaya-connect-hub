import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRefCode } from '@/hooks/useRefCode';
import type { Database } from '@/integrations/supabase/types';

const WHATSAPP_NUMBER = '59176356972';

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
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
  tier: 'NOVATO' | 'POTENCIAL' | 'APROBABLE' | null;
  error?: string;
}

interface ConversationalData {
  reply: string;
  datos_lead_update: Record<string, unknown>;
  fin_entrevista: boolean;
  debug: DebugInfo;
}

type P2PLevel = Database['public']['Enums']['p2p_level'];
type HoursPerDay = Database['public']['Enums']['hours_per_day'];
type ScoreLabel = Database['public']['Enums']['score_label'];

const AIChatDrawer = ({ open, onOpenChange, initialMessage }: AIChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, unknown>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<'JUGADOR' | 'AGENTE' | 'SOPORTE' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const { getRefCode } = useRefCode();

  // Initialize chat with greeting
  useEffect(() => {
    if (open && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      
      // Start with a greeting
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: '¡Hola! 👋 Soy el asistente de Ganaya.bet. ¿En qué puedo ayudarte hoy?',
      };
      setMessages([greeting]);

      // If there's an initial message, send it automatically
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
      // Build conversation history for the API
      const conversationHistory = messages.map(m => ({
        role: m.role === 'bot' ? 'assistant' as const : 'user' as const,
        content: m.content,
      }));

      // Add current message
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

        // Update collected data
        if (response.datos_lead_update && Object.keys(response.datos_lead_update).length > 0) {
          setCollectedData(prev => ({ ...prev, ...response.datos_lead_update }));
        }

        // Track detected intent from debug info
        const intentFromDebug = response.debug?.intent_detected;
        if (intentFromDebug && !detectedIntent) {
          setDetectedIntent(intentFromDebug as 'JUGADOR' | 'AGENTE' | 'SOPORTE');
        }

        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: response.reply,
        };
        setMessages(prev => [...prev, botMessage]);

        // Check if interview is complete
        if (response.fin_entrevista) {
          setIsComplete(true);
          
          // Save lead to database
          await saveLead(response);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add fallback response
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

  const saveLead = async (response: ConversationalData) => {
    try {
      const data = collectedData;
      const intent = detectedIntent || response.debug?.intent_detected;
      
      // Map scoring from debug to our label system
      let etiqueta: ScoreLabel = 'CLIENTE';
      let score = 0;
      
      if (intent === 'AGENTE' && response.debug) {
        score = response.debug.score_total;
        if (response.debug.tier === 'APROBABLE') {
          etiqueta = 'AGENTE_POTENCIAL_ALTO';
        } else if (response.debug.tier === 'POTENCIAL') {
          etiqueta = 'AGENTE_POTENCIAL_MEDIO';
        } else {
          etiqueta = 'AGENTE_POTENCIAL_BAJO';
        }
      }

      // Get ref_code from session
      const refCode = getRefCode();
      const country = String(data.pais || data.country || 'No especificado');

      // Call the auto_assign_agent function to get the assigned agent
      let assignedAgentId: string | null = null;
      try {
        const { data: agentId, error: rpcError } = await supabase.rpc('auto_assign_agent', {
          p_ref_code: refCode,
          p_country: country,
        });
        if (!rpcError && agentId) {
          assignedAgentId = agentId;
        }
      } catch (e) {
        console.error('Error in auto_assign_agent:', e);
      }

      // Prepare lead data
      const leadData: Database['public']['Tables']['leads']['Insert'] = {
        tipo: intent === 'AGENTE' ? 'agente' : 'cliente',
        nombre: String(data.nombre || data.name || 'Sin nombre'),
        whatsapp: String(data.whatsapp || data.telefono || data.telegram || ''),
        pais: country,
        ciudad: data.ciudad ? String(data.ciudad) : null,
        email: data.email ? String(data.email) : null,
        binance_verificada: data.binance === true || data.binance_verificada === true || data.usdt === true,
        banca_300: data.capital === '$300-500' || data.capital === '$500+' || data.banca_300 === true,
        exp_casinos: data.experiencia_casinos === true || (typeof data.experiencia === 'string' && data.experiencia.toLowerCase().includes('casino')),
        exp_atencion: data.experiencia_atencion === true || (typeof data.experiencia === 'string' && data.experiencia.toLowerCase().includes('venta')),
        prefiere_usdt: data.usdt === true || data.prefiere_usdt === true,
        aposto_antes: data.aposto_antes === true,
        p2p_nivel: mapP2PLevel(data.p2p_nivel || data.experiencia_p2p),
        horas_dia: mapHoursPerDay(data.horas || data.disponibilidad),
        score,
        etiqueta,
        origen: 'chat_ia',
        ref_code: refCode || undefined,
        asignado_agente_id: assignedAgentId,
        estado: assignedAgentId ? 'asignado' : 'nuevo',
      };

      const { error } = await supabase.from('leads').insert(leadData);

      if (error) {
        console.error('Error saving lead:', error);
      } else {
        console.log('Lead saved successfully with agent:', assignedAgentId);
      }
    } catch (error) {
      console.error('Error in saveLead:', error);
    }
  };

  const mapP2PLevel = (value: unknown): P2PLevel | null => {
    if (!value) return null;
    const str = String(value).toLowerCase();
    if (str.includes('avanzado') || str.includes('experto')) return 'avanzado';
    if (str.includes('medio') || str.includes('intermedio')) return 'medio';
    if (str.includes('basico') || str.includes('básico') || str.includes('principiante')) return 'basico';
    return null;
  };

  const mapHoursPerDay = (value: unknown): HoursPerDay | null => {
    if (!value) return null;
    const str = String(value).toLowerCase();
    if (str.includes('6') || str.includes('más') || str.includes('full')) return '6+';
    if (str.includes('3') || str.includes('4') || str.includes('5')) return '3-5';
    if (str.includes('1') || str.includes('2')) return '1-2';
    return null;
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
    
    // Reinitialize
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
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
