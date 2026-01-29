import { motion } from 'framer-motion';
import { MessageCircle, Users, ArrowRight, Shield, Clock, Wallet, BadgeCheck, Sparkles, Banknote, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/home/FloatingParticles';
import { CasinoBackground } from '@/components/home/CasinoElements';
import heroBg from '@/assets/hero-bg.jpg';

interface HeroPremiumProps {
  onOpenChat: () => void;
}

export const HeroPremium = ({ onOpenChat }: HeroPremiumProps) => {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-24 md:pt-28 pb-20">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Casino premium" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-gold/5" />
      </div>
      
      {/* Casino decorative elements */}
      <CasinoBackground />
      
      {/* Particles */}
      <FloatingParticles count={15} />
      
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60vh]"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.25) 0%, transparent 70%)`,
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gold/10 rounded-full blur-[150px]" 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Casino Online con Atención Real</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          >
            <span className="text-foreground">Juega hoy.</span>
            <br />
            <span className="text-gradient-primary">Recarga y retira en tu moneda local</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Atención personalizada por <strong className="text-primary">cajeros</strong> · Retiros rápidos · Soporte directo
          </motion.p>

          {/* Trust Badges Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            {[
              { icon: BadgeCheck, text: '+18' },
              { icon: Clock, text: 'Soporte 24/7' },
              { icon: Sparkles, text: 'Retiros rápidos' },
              { icon: CreditCard, text: 'Moneda local' },
            ].map((badge, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="px-3 py-1.5 bg-card/50 backdrop-blur-sm border-white/10 gap-1.5"
              >
                <badge.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground/90">{badge.text}</span>
              </Badge>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onOpenChat}
              className="w-full sm:w-auto min-w-[260px] shadow-lg shadow-primary/30 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Quiero jugar ahora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="glass" 
              size="lg" 
              asChild
              className="w-full sm:w-auto opacity-80 hover:opacity-100 transition-opacity"
            >
              <a href="/agente" className="gap-2">
                <Users className="w-4 h-4" />
                Quiero ser cajero
              </a>
            </Button>
          </motion.div>

          {/* Secondary trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Cajeros verificados</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Atención por WhatsApp</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-gold" />
              <span>Transferencia bancaria</span>
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
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};
