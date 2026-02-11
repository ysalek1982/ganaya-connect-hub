import { motion } from 'framer-motion';
import { MessageSquare, UserCheck, Link2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';

interface HowItWorksSectionProps {
  onOpenChat?: () => void;
}

const steps = [
  { icon: MessageSquare, step: 1, title: 'Postulás en 2 minutos', description: 'Completás una entrevista rápida por chat con nuestro asistente.' },
  { icon: UserCheck, step: 2, title: 'Te contactamos', description: 'Evaluamos tu perfil y coordinamos un onboarding por WhatsApp.' },
  { icon: Link2, step: 3, title: 'Empezás a operar', description: 'Recibís tu enlace, tu banca y comenzás a generar ingresos.' },
];

export const HowItWorksSection = ({ onOpenChat }: HowItWorksSectionProps) => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.howItWorks === false) return null;
  const ctaText = content?.ctaPrimaryText || 'Postularme ahora';

  return (
    <section id="como-funciona" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--surface-1))] to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            Simple y rápido
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Cómo <span className="text-gradient-primary">funciona</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            En 3 simples pasos comenzás a generar ingresos como agente
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connector line for desktop */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
            
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
                className="relative group"
              >
                <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-7 lg:p-8 border border-border/50 hover:border-primary/40 transition-all duration-500 h-full hover:-translate-y-1">
                  {/* Step number - large and prominent */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                        <span className="font-display font-black text-primary-foreground text-xl">{item.step}</span>
                      </div>
                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md -z-10 group-hover:bg-primary/30 transition-colors" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {onOpenChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-14"
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
