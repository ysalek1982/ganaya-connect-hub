import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, ArrowRight, TrendingUp, Trophy, Zap, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/hooks/useCMS';
import { LeadFormModal } from '@/components/home/LeadFormModal';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { FloatingParticles } from '@/components/home/FloatingParticles';
import heroBg from '@/assets/hero-bg.jpg';

const WHATSAPP_NUMBER = '59176356972';

export const Hero = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: heroContent } = useCMS('home_hero');

  const content = heroContent as { title?: string; subtitle?: string } | null;
  const title = content?.title || "Apostá con soporte real. Recargá y retirás con un agente local.";
  const subtitle = content?.subtitle || "Apuestas deportivas y casino en vivo. Atención por WhatsApp y retiros guiados a tu banco.";

  return (
    <>
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16 pb-24">
        {/* Hero Background Image with better visibility */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="Stadium background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
        </div>
        
        {/* Floating Particles - reduced count for performance */}
        <FloatingParticles count={25} />
        
        {/* Animated Glow Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top center spotlight */}
          <motion.div
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[50vh]"
            style={{
              background: `radial-gradient(ellipse 70% 60% at 50% 0%, hsl(var(--primary) / 0.25) 0%, transparent 70%)`,
            }}
          />
          
          {/* Left accent */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/3 -left-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px]" 
          />
          
          {/* Right accent */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/25 rounded-full blur-[100px]" 
          />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/40 mb-8 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-semibold text-primary tracking-wide">LATAM #1 en soporte personalizado</span>
            </motion.div>

            {/* Title with improved typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight"
            >
              {title.split('.')[0]}.
              <span className="text-gradient-primary block mt-3">
                {title.split('.')[1] || 'Recargá y retirás con un agente local.'}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* Animated Stats - improved visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="grid grid-cols-3 gap-3 md:gap-6 max-w-xl mx-auto mb-10"
            >
              {[
                { icon: TrendingUp, value: 5000, suffix: '+', label: 'Usuarios activos', color: 'text-primary' },
                { icon: Trophy, value: 98, suffix: '%', label: 'Satisfacción', color: 'text-gold' },
                { icon: Clock, value: 24, suffix: '/7', label: 'Soporte', color: 'text-accent' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  className="text-center p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className={`flex items-center justify-center gap-1 ${stat.color} mb-2`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} label="" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
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
                className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-primary/25"
              >
                <MessageCircle className="w-5 h-5" />
                Quiero apostar
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="glass" 
                size="xl" 
                asChild
                className="w-full sm:w-auto min-w-[200px]"
              >
                <a href="/agente">
                  <Users className="w-5 h-5" />
                  Quiero ser agente
                </a>
              </Button>
            </motion.div>

            {/* Trust badges - improved layout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8"
            >
              {[
                { icon: MessageCircle, label: 'Soporte 24/7', color: 'bg-[#25D366]/20', iconColor: 'text-[#25D366]' },
                { icon: Star, label: 'USDT / Binance', color: 'bg-primary/20', iconColor: 'text-primary' },
                { icon: Shield, label: 'Pagos seguros', color: 'bg-gold/20', iconColor: 'text-gold' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={`w-9 h-9 rounded-full ${badge.color} flex items-center justify-center`}>
                    <badge.icon className={`w-4 h-4 ${badge.iconColor}`} />
                  </div>
                  <span className="font-medium">{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-28 md:bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/40 flex justify-center pt-2">
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
