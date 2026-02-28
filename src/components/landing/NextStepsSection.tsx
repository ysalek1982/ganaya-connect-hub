import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, CreditCard, ClipboardCheck, GraduationCap, ArrowRight, Rocket, Check } from 'lucide-react';
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
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  if (content?.sectionsEnabled?.nextSteps === false) return null;

  const cms = content?.nextStepsSection;
  const subtitle = cms?.subtitle || 'En 4 simples pasos podés comenzar a operar';
  const steps = cms?.steps && cms.steps.length > 0
    ? cms.steps
    : defaultSteps.map(s => ({ title: s.title, description: s.description }));
  const icons = [DollarSign, CreditCard, ClipboardCheck, GraduationCap];

  const toggleStep = (i: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const progress = (completed.size / steps.length) * 100;

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
          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Tu progreso</span>
              <span className="text-xs font-bold text-primary">{completed.size}/{steps.length} listos</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{ boxShadow: progress > 0 ? '0 0 12px hsl(var(--primary) / 0.5)' : 'none' }}
              />
            </div>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/30 to-transparent hidden md:block" />

            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = icons[index % icons.length];
                const done = completed.has(index);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                    className="flex items-start gap-5 group cursor-pointer"
                    onClick={() => toggleStep(index)}
                  >
                    <div className="relative z-10">
                      <motion.div
                        className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                          done
                            ? 'bg-primary shadow-primary/40 scale-110'
                            : 'bg-primary shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-110'
                        }`}
                        animate={done ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <AnimatePresence mode="wait">
                          {done ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                            </motion.div>
                          ) : (
                            <motion.span
                              key="num"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="font-display font-black text-primary-foreground text-lg"
                            >
                              {index + 1}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md -z-10 group-hover:bg-primary/30 transition-colors" />
                    </div>
                    <div className={`rounded-2xl p-5 border transition-all duration-500 flex-1 ${
                      done
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={`w-4 h-4 ${done ? 'text-primary' : 'text-primary'}`} />
                        <h3 className={`font-display text-lg font-bold ${done ? 'text-primary line-through' : 'text-foreground'}`}>{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Confetti-like celebration when all done */}
          <AnimatePresence>
            {completed.size === steps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/30"
              >
                <span className="text-2xl mb-2 block">🎉</span>
                <p className="font-bold text-primary">¡Estás listo para comenzar!</p>
              </motion.div>
            )}
          </AnimatePresence>

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
