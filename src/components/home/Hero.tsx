import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/hooks/useCMS';
import { LeadFormModal } from '@/components/home/LeadFormModal';

export const Hero = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: heroContent } = useCMS('home_hero');

  const content = heroContent as { title?: string; subtitle?: string } | null;
  const title = content?.title || "Apostá con soporte real. Recargá y retirás con un agente local.";
  const subtitle = content?.subtitle || "Apuestas deportivas y casino en vivo. Atención por WhatsApp y retiros guiados a tu banco.";

  const handleWhatsApp = () => {
    window.open('https://wa.me/595981123456?text=Hola!%20Quiero%20empezar%20a%20apostar%20en%20Ganaya.bet', '_blank');
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-hero" />
        
        {/* Stadium Light Effect */}
        <div className="absolute inset-0 stadium-glow" />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

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
