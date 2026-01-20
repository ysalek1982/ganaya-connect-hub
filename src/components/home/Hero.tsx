import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, ArrowRight, TrendingUp, Trophy, Zap, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/hooks/useCMS';
import { LeadFormModal } from '@/components/home/LeadFormModal';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { FloatingParticles } from '@/components/home/FloatingParticles';
import { GlowingGrid } from '@/components/home/GlowingGrid';
import heroBg from '@/assets/hero-bg.jpg';

const WHATSAPP_NUMBER = '59176356972';

export const Hero = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: heroContent } = useCMS('home_hero');

  const content = heroContent as { title?: string; subtitle?: string } | null;
  const title = content?.title || "Apostá con soporte real. Recargá y retirás con un agente local.";
  const subtitle = content?.subtitle || "Apuestas deportivas y casino en vivo. Atención por WhatsApp y retiros guiados a tu banco.";

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola, quiero empezar a apostar en Ganaya.bet');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="Stadium background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
        
        {/* Floating Particles */}
        <FloatingParticles count={40} />
        
        {/* Glowing Grid */}
        <GlowingGrid />
        
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-hero opacity-60" />
        {/* Enhanced Stadium Light Overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[80vh]">
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 50% 0%, 
                    hsl(156 100% 50% / 0.2) 0%, 
                    hsl(156 100% 50% / 0.05) 40%, 
                    transparent 70%
                  )
                `,
              }}
            />
          </div>
        </div>
        
        {/* Gradient orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" 
        />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">LATAM #1 en soporte personalizado</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              {title.split('.')[0]}.
              <span className="text-gradient-primary block mt-2">
                {title.split('.')[1] || 'Recargá y retirás con un agente local.'}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              {subtitle}
            </motion.p>

            {/* Animated Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10"
            >
              <div className="text-center p-3 rounded-xl bg-card/50 backdrop-blur border border-border/50">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  <AnimatedCounter value={5000} suffix="+" label="" />
                </div>
                <div className="text-xs text-muted-foreground">Usuarios activos</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/50 backdrop-blur border border-border/50">
                <div className="flex items-center justify-center gap-1 text-gold mb-1">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  <AnimatedCounter value={98} suffix="%" label="" />
                </div>
                <div className="text-xs text-muted-foreground">Satisfacción</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/50 backdrop-blur border border-border/50">
                <div className="flex items-center justify-center gap-1 text-accent mb-1">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  <AnimatedCounter value={24} suffix="/7" label="" />
                </div>
                <div className="text-xs text-muted-foreground">Soporte</div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto"
              >
                <MessageCircle className="w-5 h-5" />
                Quiero apostar
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="glass" 
                size="xl" 
                asChild
                className="w-full sm:w-auto"
              >
                <a href="/agente">
                  <Users className="w-5 h-5" />
                  Quiero ser agente
                </a>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                </div>
                <span>Soporte 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">₿</span>
                </div>
                <span>USDT / Binance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent text-xs">🏦</span>
                </div>
                <span>Pagos locales</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      <LeadFormModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
};
