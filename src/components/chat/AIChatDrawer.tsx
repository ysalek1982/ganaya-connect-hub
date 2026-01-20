import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { calculateScore, getLabelText, getLabelColor } from '@/lib/scoring';
import { countries } from '@/lib/countries';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
  options?: { label: string; value: string }[];
}

interface AIChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'cliente' | 'agente' | 'auto';
}

type P2PLevel = Database['public']['Enums']['p2p_level'];
type HoursPerDay = Database['public']['Enums']['hours_per_day'];

const agentQuestions = [
  { key: 'pais', question: '¿En qué país estás?', options: countries.map(c => ({ label: c.name, value: c.name })) },
  { key: 'ciudad', question: '¿En qué ciudad?', type: 'text' },
  { key: 'nombre', question: '¿Cuál es tu nombre completo?', type: 'text' },
  { key: 'edad', question: '¿Cuántos años tenés?', type: 'number' },
  { key: 'whatsapp', question: '¿Cuál es tu número de WhatsApp? (con código de país)', type: 'text', placeholder: '+595981123456' },
  { key: 'binance_verificada', question: '¿Tenés cuenta Binance verificada?', options: [{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }] },
  { key: 'p2p_nivel', question: '¿Cuál es tu nivel de experiencia en P2P?', options: [{ label: 'Básico', value: 'basico' }, { label: 'Medio', value: 'medio' }, { label: 'Avanzado', value: 'avanzado' }] },
  { key: 'horas_dia', question: '¿Cuántas horas por día podés dedicar?', options: [{ label: '1-2 horas', value: '1-2' }, { label: '3-5 horas', value: '3-5' }, { label: '6+ horas', value: '6+' }] },
  { key: 'exp_casinos', question: '¿Tenés experiencia en casinos o apuestas?', options: [{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }] },
  { key: 'exp_atencion', question: '¿Tenés experiencia atendiendo clientes por WhatsApp?', options: [{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }] },
  { key: 'banca_300', question: '¿Tenés banca mínima de $300 disponible?', options: [{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }] },
  { key: 'quiere_empezar', question: '¿Querés empezar esta semana?', options: [{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }] },
];

const clientQuestions = [
  { key: 'pais', question: '¿En qué país estás?', options: countries.map(c => ({ label: c.name, value: c.name })) },
  { key: 'nombre', question: '¿Cuál es tu nombre?', type: 'text' },
  { key: 'whatsapp', question: '¿Cuál es tu WhatsApp? (con código de país)', type: 'text', placeholder: '+595981123456' },
  { key: 'prefiere_usdt', question: '¿Preferís operar con USDT/Binance?', options: [{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }] },
  { key: 'aposto_antes', question: '¿Ya apostaste online antes?', options: [{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }] },
];

const AIChatDrawer = ({ open, onOpenChange, mode = 'auto' }: AIChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [chatMode, setChatMode] = useState<'cliente' | 'agente' | null>(mode === 'auto' ? null : mode);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = chatMode === 'agente' ? agentQuestions : clientQuestions;

  useEffect(() => {
    if (open && messages.length === 0) {
      if (mode === 'auto') {
        setMessages([{
          id: '1',
          role: 'bot',
          content: '¡Hola! Soy el asistente de Ganaya.bet. ¿Qué te gustaría hacer?',
          options: [
            { label: '🎰 Quiero apostar', value: 'cliente' },
            { label: '💼 Quiero ser agente', value: 'agente' },
          ],
        }]);
      } else {
        setChatMode(mode);
        setCurrentStep(0);
        setMessages([{
          id: '1',
          role: 'bot',
          content: mode === 'agente' 
            ? '¡Excelente! Vamos a evaluar tu perfil para ser agente. Te haré algunas preguntas.' 
            : '¡Perfecto! Te voy a pedir algunos datos para conectarte con un agente.',
        }]);
        setTimeout(() => askQuestion(0, mode === 'agente' ? agentQuestions : clientQuestions), 800);
      }
    }
  }, [open, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const askQuestion = (step: number, qs: typeof agentQuestions) => {
    if (step >= qs.length) return;
    const q = qs[step];
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'bot',
      content: q.question,
      options: q.options,
    }]);
  };

  const handleModeSelect = (selectedMode: 'cliente' | 'agente') => {
    setChatMode(selectedMode);
    setCurrentStep(0);
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: selectedMode === 'agente' ? 'Quiero ser agente' : 'Quiero apostar' },
      { id: (Date.now() + 1).toString(), role: 'bot', content: selectedMode === 'agente' 
        ? '¡Excelente! Vamos a evaluar tu perfil. Te haré algunas preguntas rápidas.' 
        : '¡Perfecto! Te pido algunos datos para conectarte con un agente.' },
    ]);
    const qs = selectedMode === 'agente' ? agentQuestions : clientQuestions;
    setTimeout(() => askQuestion(0, qs), 800);
  };

  const handleAnswer = async (value: string) => {
    const q = questions[currentStep];
    setAnswers(prev => ({ ...prev, [q.key]: value }));
    
    const displayValue = q.options?.find(o => o.value === value)?.label || value;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: displayValue }]);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTimeout(() => askQuestion(currentStep + 1, questions), 600);
    } else {
      await submitLead({ ...answers, [q.key]: value });
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleAnswer(inputValue.trim());
    setInputValue('');
  };

  const submitLead = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', content: 'Procesando tu información...' }]);

    try {
      let score = 0;
      let label: string = 'CLIENTE';
      let tipo = 'cliente';

      if (chatMode === 'agente') {
        const result = calculateScore({
          binance_verificada: data.binance_verificada === 'true',
          p2p_nivel: data.p2p_nivel as P2PLevel,
          horas_dia: data.horas_dia as HoursPerDay,
          banca_300: data.banca_300 === 'true',
          exp_casinos: data.exp_casinos === 'true',
          exp_atencion: data.exp_atencion === 'true',
          quiere_empezar: data.quiere_empezar === 'true',
        });
        score = result.score;
        label = result.label;
        tipo = score >= 40 ? 'agente' : 'cliente';
      }

      const { error } = await supabase.from('leads').insert({
        tipo,
        nombre: data.nombre,
        edad: data.edad ? parseInt(data.edad) : null,
        whatsapp: data.whatsapp,
        pais: data.pais,
        ciudad: data.ciudad || null,
        binance_verificada: data.binance_verificada === 'true',
        p2p_nivel: (data.p2p_nivel as P2PLevel) || null,
        horas_dia: (data.horas_dia as HoursPerDay) || null,
        banca_300: data.banca_300 === 'true',
        exp_casinos: data.exp_casinos === 'true',
        exp_atencion: data.exp_atencion === 'true',
        quiere_empezar: data.quiere_empezar === 'true',
        prefiere_usdt: data.prefiere_usdt === 'true',
        aposto_antes: data.aposto_antes === 'true',
        score,
        etiqueta: label as Database['public']['Enums']['score_label'],
        origen: 'chat',
      });

      if (error) throw error;

      setIsComplete(true);

      const successMessage = chatMode === 'agente'
        ? `¡Listo! Tu perfil fue evaluado.\n\n📊 Score: ${score}/100\n🏷️ Clasificación: ${getLabelText(label as any)}\n\n${score >= 60 ? 'Un coordinador te contactará pronto por WhatsApp.' : 'Te recomendamos mejorar algunos requisitos y volver a postularte.'}`
        : '¡Gracias! Un agente de tu país te contactará pronto por WhatsApp.';

      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== 'Procesando tu información...');
        return [...filtered, { id: Date.now().toString(), role: 'bot', content: successMessage }];
      });

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Error al enviar. Intentá de nuevo.');
      setMessages(prev => prev.filter(m => m.content !== 'Procesando tu información...'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(-1);
    setChatMode(mode === 'auto' ? null : mode);
    setAnswers({});
    setIsComplete(false);
    setInputValue('');
  };

  const currentQuestion = questions[currentStep];
  const showInput = currentQuestion && !currentQuestion.options;

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
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Asistente Ganaya IA</h3>
                  <p className="text-xs text-muted-foreground">
                    {chatMode === 'agente' ? 'Evaluación de agentes' : chatMode === 'cliente' ? 'Registro de cliente' : 'Bienvenido'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-5 h-5" />
              </Button>
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
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    {msg.options && !isComplete && currentStep === -1 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.options.map((opt) => (
                          <Button
                            key={opt.value}
                            variant="outline"
                            size="sm"
                            onClick={() => handleModeSelect(opt.value as 'cliente' | 'agente')}
                            className="hover:bg-primary/10 hover:border-primary"
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    {msg.options && !isComplete && currentStep >= 0 && msg.id === messages[messages.length - 1].id && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.options.map((opt) => (
                          <Button
                            key={opt.value}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnswer(opt.value)}
                            className="hover:bg-primary/10 hover:border-primary"
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isSubmitting && (
                <div className="flex justify-start">
                  <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {showInput && !isComplete && (
              <form onSubmit={handleInputSubmit} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestion.placeholder || 'Escribí tu respuesta...'}
                    type={currentQuestion.type === 'number' ? 'number' : 'text'}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" variant="hero" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Complete actions */}
            {isComplete && (
              <div className="p-4 border-t border-border space-y-2">
                <Button variant="whatsapp" className="w-full" asChild>
                  <a href={`https://wa.me/${answers.whatsapp?.replace(/\D/g, '') || ''}`} target="_blank">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Abrir WhatsApp
                  </a>
                </Button>
                <Button variant="outline" className="w-full" onClick={resetChat}>
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
