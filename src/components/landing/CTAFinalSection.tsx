import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Shield, AlertTriangle, Sparkles, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';

interface CTAFinalSectionProps {
  onOpenChat: () => void;
}

export const CTAFinalSection = ({ onOpenChat }: CTAFinalSectionProps) => {
  const { data: content } = useLandingContent();
  const ctaText = content?.ctaPrimaryText || 'Postularme ahora';

  return (
    <section id="postular" className="py-32 relative overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.06] to-background" />
      
      {/* Animated glow orb */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)` }}
      />
      
      {/* Side accent orbs */}
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
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black mb-7 leading-[1.1]">
            <span className="text-gradient-primary">¿Listo para empezar?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Completá tu postulación en 2 minutos. Te contactamos por WhatsApp para coordinar los siguientes pasos.
          </p>

          {/* Urgency strip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10 px-5 py-3 rounded-xl bg-gold/10 border border-gold/20"
          >
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gold" />
              <span className="text-foreground font-medium">Cupos limitados por zona</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-gold/30" />
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-foreground font-medium">+150 agentes ya activos</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onOpenChat}
              className="min-w-[300px] shadow-2xl shadow-primary/30 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Button>
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
