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
    answer: 'No es obligatorio. Te damos capacitación completa y soporte continuo para que aprendas rápido. Lo importante es tu compromiso y disponibilidad.',
  },
  {
    question: '¿En qué países funciona?',
    answer: 'Operamos en toda Latinoamérica. Buscamos agentes en cada país para atender a personas en su moneda local y con métodos de pago conocidos.',
  },
  {
    question: '¿Cuánto tiempo toma empezar?',
    answer: 'El proceso es rápido: postulás en 2 minutos, te contactamos en 24-48 horas para el onboarding, y podés comenzar a operar el mismo día que recibas tus accesos.',
  },
  {
    question: '¿Qué es la banca operativa?',
    answer: 'Es el capital de trabajo que usás para operar. Recomendamos $300 USD aproximadamente. No es un pago a nosotros, es tu herramienta para atender a tus contactos y lo recuperás con las operaciones.',
  },
  {
    question: '¿Es 100% móvil?',
    answer: 'Sí. Toda la operación se hace desde tu celular: WhatsApp, transferencias y nuestra plataforma web. No necesitás computadora ni local físico.',
  },
  {
    question: '¿Qué hago si no tengo experiencia en casinos?',
    answer: 'No hay problema. Te capacitamos en todo lo necesario. Lo más importante es tu capacidad de comunicarte y atender personas, no tu conocimiento previo del rubro.',
  },
  {
    question: '¿Hay algún costo inicial?',
    answer: 'No cobramos inscripción ni cuotas. Solo necesitás tu banca operativa (capital de trabajo propio) para comenzar a operar.',
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Dudas comunes
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Preguntas <span className="text-gradient-primary">frecuentes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
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
                className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 px-6 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <span className="text-left font-semibold text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
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
