import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MessageCircle, ArrowRight, Users, Zap, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingParticles } from '@/components/home/FloatingParticles';
import { HeroBackground } from '@/components/landing/HeroBackground';
import { TrustBadges } from '@/components/landing/TrustBadges';
import { EarningsTicker } from '@/components/landing/EarningsTicker';
import { CountdownTimer } from '@/components/landing/CountdownTimer';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useState, useEffect, useCallback, useRef } from 'react';

interface HeroAgentsProps {
  onOpenChat: () => void;
}

const rotatingPhrases = [
  'Comisiones escalables hasta 40%',
  'Bonos por red de sub-agentes',
  '100% desde tu celular',
  'Sin inversión inicial',
  'Soporte y capacitación incluidos',
];

const useTypewriter = (text: string, speed = 40) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
};

export const HeroAgents = ({ onOpenChat }: HeroAgentsProps) => {
  const { data: content } = useLandingContent();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-10, 10]);
  const parallaxXSlow = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const parallaxYSlow = useTransform(springY, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Rotate phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const heroTitle = content?.heroTitle || 'Genera ingresos como Agente Ganaya.bet';
  const heroBullets = content?.heroBullets || [];
  const ctaPrimary = content?.ctaPrimaryText || 'Postularme ahora';
  const ctaSecondary = content?.hero?.heroCTASecondaryText || content?.ctaSecondaryText || 'Ver cómo funciona';
  const heroEyebrow = content?.hero?.heroEyebrow || 'PROGRAMA DE AGENTES';
  const disclaimerText = content?.disclaimerText || '+18 · Programa de agentes · Juego responsable';

  const { displayed, done } = useTypewriter(heroTitle, 35);
  const bulletIcons = [Zap, Users, Shield];

  // Split typed text around "Agente" for gradient
  const renderTypedTitle = () => {
    const agentIdx = displayed.indexOf('Agente');
    if (agentIdx === -1) {
      return (
        <>
          <span className="text-foreground">{displayed}</span>
          {!done && <span className="inline-block w-[3px] h-[0.85em] bg-primary ml-1 animate-pulse align-middle" />}
        </>
      );
    }
    const before = displayed.slice(0, agentIdx);
    const after = displayed.slice(agentIdx);
    return (
      <>
        <span className="text-foreground">{before}</span>
        <span className="text-gradient-primary">{after}</span>
        {!done && <span className="inline-block w-[3px] h-[0.85em] bg-primary ml-1 animate-pulse align-middle" />}
      </>
    );
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      id="inicio"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 pb-24 md:pb-16"
    >
      <HeroBackground />
      <FloatingParticles count={10} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div className="max-w-4xl mx-auto text-center" style={{ x: parallaxXSlow, y: parallaxYSlow }}>
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">{heroEyebrow}</span>
          </motion.div>

          {/* Live agents counter + urgency */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-primary"></span>
              </span>
              23 agentes conectados ahora
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
              🔥 Solo 12 cupos disponibles en tu zona
            </span>
          </motion.div>

          {/* Main Title - Typewriter */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-[1.08] tracking-tight min-h-[2.5em]"
          >
            {renderTypedTitle()}
          </motion.h1>

          {/* Glow line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: done ? 1 : 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mb-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          {/* Rotating subtitle with AnimatePresence */}
          <div className="h-10 sm:h-12 flex items-center justify-center mb-8 sm:mb-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIndex}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.4 }}
                className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                {rotatingPhrases[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Feature pills */}
          {heroBullets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10"
            >
              {heroBullets.slice(0, 3).map((bullet, i) => {
                const Icon = bulletIcons[i] || Zap;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm cursor-default"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground/90">{bullet}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              variant="hero"
              size="xl"
              onClick={onOpenChat}
              className="w-full sm:w-auto min-w-[260px] text-lg font-bold"
            >
              <MessageCircle className="w-5 h-5" />
              {ctaPrimary}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => scrollToSection('como-funciona')}
              className="w-full sm:w-auto"
            >
              {ctaSecondary}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {/* Earnings ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <EarningsTicker />
          </motion.div>

          {/* Countdown timer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-6"
          >
            <CountdownTimer />
          </motion.div>

          <TrustBadges />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-sm text-muted-foreground/70"
          >
            {disclaimerText}
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/20 flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};
