import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTAFinalSectionProps {
  onOpenChat: () => void;
}

export const CTAFinalSection = ({ onOpenChat }: CTAFinalSectionProps) => {
  return (
    <section id="postular" className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.05] to-background" />
      
      {/* Centered glow effect */}
      <motion.div
        animate={{ opacity: [0.08, 0.15, 0.08], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 50%, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            Último paso
          </span>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-primary">¿Listo para empezar?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Completá tu postulación en 2 minutos. Te contactamos por WhatsApp para coordinar los siguientes pasos.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onOpenChat}
              className="min-w-[300px] shadow-xl shadow-primary/30 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Postularme ahora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary/70" />
              <span>Datos protegidos</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gold/70" />
              <span>+18 · Juego responsable</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
