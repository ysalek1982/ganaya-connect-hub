import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

const faqs = [
  { question: '¿Cuánto puedo ganar como agente?', answer: 'Tus ingresos dependen de tu actividad y el tamaño de tu red. Las comisiones escalan hasta un 40% mensual sobre el positivo de tu cartera, más bonos del 7% y 5% por los ingresos de tus sub-agentes.' },
  { question: '¿Cuándo pagan las comisiones?', answer: 'Las comisiones se liquidan mensualmente, el primer día de cada mes. Recibirás el detalle por WhatsApp y el pago directo a tu método preferido.' },
  { question: '¿Puedo reclutar sub-agentes?', answer: 'Sí. Una vez que demuestres actividad, habilitamos la función de reclutamiento y recibís bonos en cascada por cada sub-agente activo en tu red.' },
  { question: '¿Necesito experiencia previa?', answer: 'No es obligatorio. Te damos capacitación completa y soporte continuo para que aprendas rápido. Lo importante es tu compromiso y disponibilidad.' },
  { question: '¿En qué países funciona?', answer: 'Operamos en toda Latinoamérica. Buscamos agentes en cada país para atender a personas en su moneda local y con métodos de pago conocidos.' },
  { question: '¿Cuánto tiempo toma empezar?', answer: 'El proceso es rápido: postulás en 2 minutos, te contactamos en 24-48 horas para el onboarding, y podés comenzar a operar el mismo día que recibas tus accesos.' },
  { question: '¿Qué es la banca operativa?', answer: 'Es el capital de trabajo que usás para operar. Recomendamos $300 USD aproximadamente. No es un pago a nosotros, es tu herramienta para atender a tus contactos y lo recuperás con las operaciones.' },
  { question: '¿Es 100% móvil?', answer: 'Sí. Toda la operación se hace desde tu celular: WhatsApp, transferencias y nuestra plataforma web. No necesitás computadora ni local físico.' },
  { question: '¿Qué hago si no tengo experiencia en casinos?', answer: 'No hay problema. Te capacitamos en todo lo necesario. Lo más importante es tu capacidad de comunicarte y atender personas, no tu conocimiento previo del rubro.' },
  { question: '¿Hay algún costo inicial?', answer: 'No cobramos inscripción ni cuotas. Solo necesitás tu banca operativa (capital de trabajo propio) para comenzar a operar.' },
];

const FAQItem = ({ faq, index }: { faq: typeof faqs[0]; index: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 120, damping: 20 }}
    >
      <motion.button
        onClick={() => setOpen(!open)}
        className={`w-full text-left rounded-xl border px-6 py-5 transition-all duration-300 group ${
          open
            ? 'bg-card/80 border-primary/40 shadow-lg shadow-primary/5'
            : 'bg-card/40 border-border/50 hover:border-primary/20 hover:bg-card/60'
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-4">
          {/* Number badge */}
          <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            open ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground'
          }`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex-1 font-bold text-foreground text-left">{faq.question}</span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <ChevronDown className={`w-5 h-5 transition-colors ${open ? 'text-primary' : 'text-muted-foreground'}`} />
          </motion.div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-4 pl-12 text-muted-foreground leading-relaxed border-t border-border/30 mt-3">
                {faq.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
};

export const FAQSection = () => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.faq === false) return null;

  return (
    <section id="faq" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            <HelpCircle className="w-4 h-4" />
            Dudas comunes
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Preguntas <span className="text-gradient-primary">frecuentes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Resolvemos tus dudas antes de postular
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
