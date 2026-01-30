import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '¿Cuánto puedo ganar como agente?',
    answer: 'Tus ingresos dependen de tu actividad y el tamaño de tu red. Las comisiones escalan hasta un 40% mensual sobre el positivo de tu cartera, más bonos del 7% y 5% por los ingresos de tus sub-agentes.',
  },
  {
    question: '¿Cuándo pagan las comisiones?',
    answer: 'Las comisiones se liquidan mensualmente, el primer día de cada mes. Recibirás el detalle por WhatsApp y el pago directo a tu método preferido.',
  },
  {
    question: '¿Puedo reclutar sub-agentes?',
    answer: 'Sí. Una vez que demuestres actividad, habilitamos la función de reclutamiento y recibís bonos en cascada por cada sub-agente activo en tu red.',
  },
  {
    question: '¿Necesito experiencia previa?',
    answer: 'No es obligatorio, pero ayuda. Te damos capacitación completa y soporte continuo para que aprendas rápido. Lo importante es tu compromiso y disponibilidad.',
  },
  {
    question: '¿Cuánto capital necesito para empezar?',
    answer: 'Recomendamos una banca operativa de $300 USD para poder atender a tus contactos. Es capital de trabajo, no un gasto. Lo usás para operar y lo recuperás.',
  },
  {
    question: '¿Es 100% móvil?',
    answer: 'Sí. Toda la operación se hace desde tu celular: WhatsApp, Binance y nuestra plataforma web. No necesitás computadora ni local físico.',
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Preguntas <span className="text-gradient-primary">frecuentes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Resolvemos tus dudas antes de postular
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-xl border-border/50 px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-semibold text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
