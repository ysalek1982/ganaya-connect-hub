import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Users, Zap, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingParticles } from '@/components/home/FloatingParticles';
import { HeroBackground } from '@/components/landing/HeroBackground';
import { TrustBadges } from '@/components/landing/TrustBadges';
import { useLandingContent } from '@/hooks/useLandingContent';

interface HeroAgentsProps {
  onOpenChat: () => void;
}

export const HeroAgents = ({ onOpenChat }: HeroAgentsProps) => {
  const { data: content } = useLandingContent();
  
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Use CMS content with fallbacks
  const heroTitle = content?.heroTitle || 'Genera ingresos como Agente Ganaya.bet';
  const heroSubtitle = content?.heroSubtitle || 'Comisiones escalables hasta 40% + bonos por red. 100% desde tu celular.';
  const heroBullets = content?.heroBullets || [];
  const ctaPrimary = content?.ctaPrimaryText || 'Postularme ahora';
  const ctaSecondary = content?.hero?.heroCTASecondaryText || content?.ctaSecondaryText || 'Ver cómo funciona';
  const heroEyebrow = content?.hero?.heroEyebrow || 'PROGRAMA DE AGENTES';
  const disclaimerText = content?.disclaimerText || '+18 · Programa de agentes · Juego responsable';

  // Feature icons for bullets
  const bulletIcons = [Zap, Users, Shield];

  return (
    <section id="inicio" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 pb-24 md:pb-16">
      {/* Dynamic background from CMS */}
      <HeroBackground />
      
      {/* Floating particles (respects prefers-reduced-motion) */}
      <FloatingParticles count={10} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
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

          {/* Main Title - from CMS */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-[1.08] tracking-tight"
          >
            {heroTitle.includes('Agente') ? (
              <>
                <span className="text-foreground">{heroTitle.split('Agente')[0]}</span>
                <span className="text-gradient-primary">Agente</span>
                <span className="text-foreground">{heroTitle.split('Agente')[1]}</span>
              </>
            ) : (
              <span className="text-foreground">{heroTitle}</span>
            )}
          </motion.h1>

          {/* Glow line under H1 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mb-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          {/* Subtitle - from CMS */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>

          {/* Feature pills from CMS bullets */}
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
                  <div 
                    key={i}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground/90">{bullet}</span>
                  </div>
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

          {/* Trust badges from CMS */}
          <TrustBadges />

          {/* Disclaimer text - from CMS */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-sm text-muted-foreground/70"
          >
            {disclaimerText}
          </motion.p>
        </div>
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
