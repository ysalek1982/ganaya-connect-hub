import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Smartphone, DollarSign, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/home/FloatingParticles';
import { CasinoBackground } from '@/components/home/CasinoElements';

interface HeroAgentsProps {
  onOpenChat: () => void;
}

export const HeroAgents = ({ onOpenChat }: HeroAgentsProps) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="inicio" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 md:pt-24 pb-16">
      {/* Background with casino aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Casino decorative elements */}
      <CasinoBackground />
      
      {/* Particles */}
      <FloatingParticles count={12} />
      
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh]"
          style={{
            background: `radial-gradient(ellipse 70% 40% at 50% 0%, hsl(var(--primary) / 0.2) 0%, transparent 70%)`,
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, delay: 3 }}
          className="absolute bottom-1/3 -right-32 w-80 h-80 bg-gold/10 rounded-full blur-[120px]" 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 backdrop-blur-sm"
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
            className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-[1.1] tracking-tight"
          >
            <span className="text-gradient-primary">TU POSITIVO SUMA</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl text-foreground font-semibold mb-6"
          >
            Comisiones escalables hasta <span className="text-primary">40%</span> + bonos en cascada <span className="text-gold">7%</span> y <span className="text-gold">5%</span>
          </motion.p>

          {/* Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8"
          >
            {[
              { icon: Smartphone, text: '100% móvil' },
              { icon: DollarSign, text: 'Banca mínima: $300 USD' },
              { icon: Clock, text: 'Ingresos 24/7' },
            ].map((item, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="px-4 py-2 bg-card/50 backdrop-blur-sm border-white/10 gap-2 text-sm"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-foreground/90">{item.text}</span>
              </Badge>
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
              className="w-full sm:w-auto min-w-[240px] shadow-lg shadow-primary/30 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Postularme ahora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="glass" 
              size="lg" 
              onClick={() => scrollToSection('como-funciona')}
              className="w-full sm:w-auto opacity-90 hover:opacity-100"
            >
              Ver cómo funciona
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {/* Microcopy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            Capital de trabajo, no gasto · Tu ganancia viene del positivo de tus clientes
          </motion.p>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
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
