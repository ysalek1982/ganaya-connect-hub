import { motion } from 'framer-motion';
import { MessageSquare, UserCheck, Link2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HowItWorksSectionProps {
  onOpenChat?: () => void;
}

const steps = [
  {
    icon: MessageSquare,
    step: 1,
    title: 'Postulás en 2 minutos',
    description: 'Completás una entrevista rápida por chat con nuestro asistente.',
  },
  {
    icon: UserCheck,
    step: 2,
    title: 'Te contactamos',
    description: 'Evaluamos tu perfil y coordinamos un onboarding por WhatsApp.',
  },
  {
    icon: Link2,
    step: 3,
    title: 'Empezás a operar',
    description: 'Recibís tu enlace, tu banca y comenzás a generar ingresos.',
  },
];

export const HowItWorksSection = ({ onOpenChat }: HowItWorksSectionProps) => {
  return (
    <section id="como-funciona" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--surface-1))] to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Simple y rápido
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Cómo <span className="text-gradient-primary">funciona</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            En 3 simples pasos comenzás a generar ingresos como agente
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative group"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
                  {/* Step badge */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm shadow-lg shadow-primary/20">
                      {item.step}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          {onOpenChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button variant="hero" size="lg" onClick={onOpenChat}>
                Comenzar postulación
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
