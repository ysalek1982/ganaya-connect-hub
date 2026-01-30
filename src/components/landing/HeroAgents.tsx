import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Users, Zap, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingParticles } from '@/components/home/FloatingParticles';
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
  const ctaPrimary = content?.ctaPrimaryText || 'Postularme ahora';
  const ctaSecondary = content?.ctaSecondaryText || 'Ver cómo funciona';

  const features = [
    { icon: Zap, text: 'Proceso simple + soporte' },
    { icon: Users, text: 'Crece con sub-agentes' },
    { icon: Shield, text: 'Pago mensual seguro' },
  ];

  return (
    <section id="inicio" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Radial glow - primary */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[80vh]"
          style={{
            background: `radial-gradient(ellipse 50% 50% at 50% 0%, hsl(var(--primary) / 0.12) 0%, transparent 70%)`,
          }}
        />
        
        {/* Side glows */}
        <motion.div 
          animate={{ opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[150px]" 
        />
      </div>
      
      {/* Floating particles */}
      <FloatingParticles count={10} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Programa de Agentes Activo</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          >
            <span className="text-foreground">{heroTitle.split('Agente')[0]}</span>
            <span className="text-gradient-primary">Agente</span>
            <span className="text-foreground">{heroTitle.split('Agente')[1]}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          >
            {features.map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground/90">{item.text}</span>
              </div>
            ))}
          </motion.div>

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

          {/* Trust text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-sm text-muted-foreground/70"
          >
            {content?.disclaimerText || '+18 · Programa de agentes · Juego responsable'}
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
