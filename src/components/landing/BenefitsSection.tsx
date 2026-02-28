import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Smartphone, Clock, TrendingUp, Users, Shield, MessageCircle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useCallback, useRef, useState } from 'react';

interface BenefitsSectionProps {
  onOpenChat?: () => void;
}

const benefits = [
  { icon: TrendingUp, title: 'Hasta 40% comisión', description: 'Comisiones escalables según tu volumen mensual de operaciones.', color: 'primary' as const },
  { icon: Users, title: 'Bonos por red: 7% y 5%', description: 'Generá ingresos pasivos por cada sub-agente que reclutes.', color: 'gold' as const },
  { icon: Smartphone, title: '100% desde el celular', description: 'Operá desde cualquier lugar, sin necesidad de una oficina.', color: 'primary' as const },
  { icon: Clock, title: 'Sin horario fijo', description: 'Vos elegís cuándo trabajar. Tu tiempo, tus reglas.', color: 'gold' as const },
  { icon: Shield, title: 'Soporte continuo', description: 'Capacitación inicial y acompañamiento permanente.', color: 'primary' as const },
  { icon: Zap, title: 'Herramientas listas', description: 'Panel de gestión, links de referido y materiales de apoyo.', color: 'gold' as const },
];

const MagneticCard = ({ benefit, index }: { benefit: typeof benefits[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const glareX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(springY, [-0.5, 0.5], [0, 100]);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }, [mouseX, mouseY]);

  const isPrimary = benefit.color === 'primary';
  const Icon = benefit.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 80 }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className="relative cursor-default"
    >
      <div className={`relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border transition-all duration-500 overflow-hidden ${
        hovered
          ? isPrimary ? 'border-primary/40 shadow-xl shadow-primary/10' : 'border-gold/40 shadow-xl shadow-gold/10'
          : 'border-border/50'
      }`}>
        {/* Glare */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            opacity: hovered ? 0.08 : 0,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]: number[]) => `radial-gradient(circle at ${gx}% ${gy}%, white 0%, transparent 60%)`
            ),
          }}
        />

        {/* Animated ring on hover */}
        <motion.div
          className={`absolute inset-0 rounded-2xl pointer-events-none ${isPrimary ? 'bg-primary/5' : 'bg-gold/5'}`}
          initial={false}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${isPrimary ? 'via-primary/30' : 'via-gold/30'} to-transparent`} />

        <motion.div
          animate={hovered ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`w-14 h-14 mb-6 rounded-2xl flex items-center justify-center ${
            isPrimary ? 'bg-primary/10' : 'bg-gold/10'
          }`}
        >
          <Icon className={`w-7 h-7 ${isPrimary ? 'text-primary' : 'text-gold'}`} />
        </motion.div>

        <h3 className="font-display text-lg font-bold text-foreground mb-2" style={{ transform: 'translateZ(20px)' }}>{benefit.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed" style={{ transform: 'translateZ(10px)' }}>{benefit.description}</p>

        {/* Animated bottom bar */}
        <motion.div
          className={`absolute bottom-0 left-0 h-0.5 ${isPrimary ? 'bg-primary' : 'bg-gold'}`}
          initial={{ width: '0%' }}
          animate={{ width: hovered ? '100%' : '0%' }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  );
};

export const BenefitsSection = ({ onOpenChat }: BenefitsSectionProps) => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.benefits === false) return null;
  const ctaText = content?.ctaPrimaryText || 'Postularme ahora';
  const disclaimerShort = content?.socialProof?.disclaimerShort || '* Resultados dependen de tu gestión y actividad. Sin ingresos garantizados.';

  return (
    <section id="beneficios" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
      <div className="absolute top-20 -right-32 w-64 h-64 bg-primary/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-20 -left-32 w-64 h-64 bg-gold/[0.04] rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            ¿Por qué unirte?
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Beneficios del <span className="text-gradient-primary">programa</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Todo lo que necesitás para comenzar a generar ingresos
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto mb-14">
          {benefits.map((benefit, index) => (
            <MagneticCard key={benefit.title} benefit={benefit} index={index} />
          ))}
        </div>

        {onOpenChat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button variant="hero" size="lg" onClick={onOpenChat}>
              <MessageCircle className="w-5 h-5" />
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-sm text-muted-foreground/60"
        >
          {disclaimerShort}
        </motion.p>
      </div>
    </section>
  );
};
