import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageSquare, UserCheck, Link2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useRef } from 'react';

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.7', 'end 0.5'],
  });

  if (content?.sectionsEnabled?.howItWorks === false) return null;

  return (
    <section id="como-funciona" ref={sectionRef} className="py-28 relative overflow-hidden">
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

        {/* Vertical stepper */}
        <div className="max-w-2xl mx-auto relative">
          {/* Progress bar track */}
          <div className="absolute left-7 md:left-8 top-0 bottom-0 w-0.5 bg-border/30" />
          {/* Animated progress fill */}
          <motion.div
            className="absolute left-7 md:left-8 top-0 w-0.5 bg-primary origin-top rounded-full"
            style={{ scaleY: scrollYProgress, height: '100%' }}
          />

          <div className="space-y-8">
            {steps.map((item, index) => {
              const stepStart = index / steps.length;
              const stepEnd = (index + 0.5) / steps.length;

              return (
                <StepItem
                  key={item.step}
                  item={item}
                  index={index}
                  scrollProgress={scrollYProgress}
                  stepStart={stepStart}
                  stepEnd={stepEnd}
                />
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
              Comenzar postulación
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const StepItem = ({
  item,
  index,
  scrollProgress,
  stepStart,
  stepEnd,
}: {
  item: (typeof steps)[0];
  index: number;
  scrollProgress: any;
  stepStart: number;
  stepEnd: number;
}) => {
  const isActive = useTransform(scrollProgress, (v: number) => v > stepStart);
  const opacity = useTransform(scrollProgress, [stepStart, stepEnd], [0.4, 1]);
  const scale = useTransform(scrollProgress, [stepStart, stepEnd], [0.95, 1]);

  return (
    <motion.div
      style={{ opacity, scale }}
      className="relative flex items-start gap-6 pl-2"
    >
      {/* Step circle */}
      <motion.div
        className="relative z-10 shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-colors duration-500"
        style={{
          backgroundColor: useTransform(scrollProgress, (v: number) =>
            v > stepStart ? 'hsl(160, 84%, 45%)' : 'hsl(220, 15%, 10%)'
          ),
          borderColor: useTransform(scrollProgress, (v: number) =>
            v > stepStart ? 'hsl(160, 84%, 45%)' : 'hsl(220, 14%, 20%)'
          ),
        }}
      >
        <span className="font-display font-black text-lg text-primary-foreground">{item.step}</span>
        {/* Glow ring when active */}
        <motion.div
          className="absolute inset-0 rounded-2xl blur-md -z-10"
          style={{
            backgroundColor: useTransform(scrollProgress, (v: number) =>
              v > stepStart ? 'hsl(160, 84%, 45%, 0.3)' : 'transparent'
            ),
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <item.icon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed ml-12">{item.description}</p>
      </div>
    </motion.div>
  );
};
