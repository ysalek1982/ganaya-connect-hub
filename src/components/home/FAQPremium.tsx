import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '¿Qué es un cajero?',
    answer: 'Un cajero es tu asistente personal para recargas y retiros. Te guía paso a paso por WhatsApp o Telegram para que tu experiencia sea simple y segura. Cada cajero opera en tu país y conoce las mejores formas de mover tu dinero en moneda local.',
  },
  {
    question: '¿Cómo recargo en mi país?',
    answer: 'Depende de tu ubicación. En la mayoría de países aceptamos transferencia bancaria, billeteras electrónicas locales (Mercado Pago, Nequi, Yape, etc.) y depósitos. Tu cajero te indicará las opciones disponibles según tu país. El proceso es simple: contactas, transfieres y tu saldo se acredita en minutos.',
  },
  {
    question: '¿Cómo retiro en moneda local?',
    answer: 'Contactas a tu cajero, le indicas el monto a retirar y él te envía el dinero a tu cuenta bancaria o billetera local. El proceso suele tomar entre 15 minutos y algunas horas según el método elegido.',
  },
  {
    question: '¿Cuánto tarda un retiro?',
    answer: 'Los retiros se procesan rápidamente una vez confirmados. Dependiendo del método y tu país, puede tomar desde 15 minutos hasta un par de horas. Tu cajero te notifica cuando el dinero está en camino.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos transferencia bancaria, billeteras electrónicas locales (Mercado Pago, Nequi, Yape, Plin, etc.), y otros métodos según tu país. Tu cajero te indicará las opciones específicas disponibles en tu ubicación.',
  },
  {
    question: '¿Cómo puedo ser cajero/agente?',
    answer: 'Si quieres ganar comisiones como cajero, haz clic en "Quiero ser cajero" y completa el formulario. Evaluaremos tu perfil y si cumples los requisitos, te asignaremos una línea con tu link personalizado para referir jugadores.',
  },
  {
    question: '¿Es seguro?',
    answer: 'Absolutamente. Trabajamos con cajeros verificados que operan en tu país. Tus transacciones son privadas y verificables. Además, promovemos el juego responsable y solo aceptamos mayores de 18 años.',
  },
  {
    question: '¿En qué países operan?',
    answer: 'Actualmente tenemos cajeros en Chile, Argentina, Paraguay, Colombia, Ecuador, México y USA. Cada país tiene agentes locales que conocen las particularidades de su mercado y los métodos de pago disponibles.',
  },
];

export const FAQPremium = () => {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Preguntas frecuentes</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            ¿Tienes <span className="text-gradient-primary">dudas</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Las respuestas a las preguntas más comunes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                className="glass-card rounded-xl px-6 border-white/5 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
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
