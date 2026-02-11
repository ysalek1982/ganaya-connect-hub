import { motion } from 'framer-motion';
import { DollarSign, CreditCard, ClipboardCheck, GraduationCap, ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';

interface NextStepsSectionProps {
  onOpenChat?: () => void;
}

const defaultSteps = [
  { title: 'Capital', description: 'Validá tu banca operativa de $300 USD', icon: DollarSign },
  { title: 'Cuenta operativa', description: 'Binance verificada + métodos locales', icon: CreditCard },
  { title: 'Registro', description: 'Completá el formulario de alta', icon: ClipboardCheck },
  { title: 'Onboarding', description: 'Capacitación 15 min y comenzás', icon: GraduationCap },
];

export const NextStepsSection = ({ onOpenChat }: NextStepsSectionProps) => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.nextSteps === false) return null;

  const cms = content?.nextStepsSection;
  const subtitle = cms?.subtitle || 'En 4 simples pasos podés comenzar a operar';
  const steps = cms?.steps && cms.steps.length > 0
    ? cms.steps
    : defaultSteps.map(s => ({ title: s.title, description: s.description }));
  const icons = [DollarSign, CreditCard, ClipboardCheck, GraduationCap];

  return (
    <section id="proximos-pasos" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.04] to-background" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-primary/[0.04] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            <Rocket className="w-4 h-4" />
            Empezá ahora
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            <span className="text-gradient-primary">Próximos</span> pasos
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Gradient vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/30 to-transparent hidden md:block" />

            <div className="space-y-5">
              {steps.map((step, index) => {
                const Icon = icons[index % icons.length];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
                    className="flex items-start gap-5 group"
                  >
                    <div className="relative z-10">
                      <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-110 transition-all duration-300">
                        <span className="font-display font-black text-primary-foreground text-lg">{index + 1}</span>
                      </div>
                      {/* Glow */}
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md -z-10 group-hover:bg-primary/30 transition-colors" />
                    </div>
                    <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all duration-500 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4 text-primary" />
                        <h3 className="font-display text-lg font-bold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {onOpenChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-14"
            >
              <Button variant="hero" size="lg" onClick={onOpenChat}>
                Comenzar ahora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
