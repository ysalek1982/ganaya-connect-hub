import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, MessageCircle, Shield, AlertTriangle, Sparkles, Clock, Users, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';
import { CountdownTimer } from '@/components/landing/CountdownTimer';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CTAFinalSectionProps {
  onOpenChat: () => void;
}

// Particle burst on click
const Particle = ({ x, y, onDone }: { x: number; y: number; onDone: () => void }) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 40 + Math.random() * 80;
  const endX = x + Math.cos(angle) * distance;
  const endY = y + Math.sin(angle) * distance;
  const size = 3 + Math.random() * 4;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: Math.random() > 0.5 ? 'hsl(160, 84%, 45%)' : 'hsl(38, 92%, 55%)',
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: endX - x, y: endY - y, scale: 0 }}
      transition={{ duration: 0.6 + Math.random() * 0.4, ease: 'easeOut' }}
      onAnimationComplete={onDone}
    />
  );
};

export const CTAFinalSection = ({ onOpenChat }: CTAFinalSectionProps) => {
  const { data: content } = useLandingContent();
  const ctaText = content?.ctaPrimaryText || 'Postularme ahora';
  const buttonRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  let particleId = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newParticles = Array.from({ length: 12 }, () => ({
      id: particleId.current++,
      x,
      y,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    onOpenChat();
  }, [onOpenChat]);

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <section id="postular" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.06] to-background" />

      {/* Animated glow orb */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)` }}
      />

      <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/[0.06] rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gold/[0.06] rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 80 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 uppercase tracking-wide"
          >
            <Sparkles className="w-4 h-4" />
            Último paso
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-[1.1]">
            <span className="text-gradient-primary">¿Listo para empezar</span>
            <br />
            <span className="text-foreground">a generar ingresos?</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
            Completá tu postulación en 2 minutos. Te contactamos por WhatsApp para coordinar los siguientes pasos.
          </p>

          {/* Urgency strip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/25 text-sm"
            >
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-destructive font-bold">Solo 12 cupos en tu zona</span>
            </motion.div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-sm">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-foreground font-medium">+150 agentes ya activos</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Respuesta en &lt;1h</span>
            </div>
          </motion.div>

          {/* Countdown timer */}
          <div className="mb-8">
            <CountdownTimer />
          </div>

          {/* CTA Button with particles and shake */}
          <motion.div
            ref={buttonRef}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-12 relative inline-block"
          >
            {/* Particle container */}
            {particles.map((p) => (
              <Particle key={p.id} x={p.x} y={p.y} onDone={() => removeParticle(p.id)} />
            ))}

            <motion.div
              animate={{
                x: [0, -2, 2, -1, 1, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 4,
                ease: 'easeInOut',
              }}
            >
              <Button
                variant="hero"
                size="xl"
                onClick={handleClick}
                className="min-w-[300px] shadow-2xl shadow-primary/30 text-lg relative overflow-hidden"
              >
                {/* Ripple shine */}
                <span className="absolute inset-0 shine-effect pointer-events-none" />
                <MessageCircle className="w-5 h-5" />
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
            <p className="mt-3 text-xs text-muted-foreground/60">Sin compromiso · 2 minutos · 100% gratis</p>
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground/70">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary/70" />
              </div>
              <span>Datos protegidos</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-border/50" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-gold/70" />
              </div>
              <span>+18 · Juego responsable</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
