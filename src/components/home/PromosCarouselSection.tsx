import { motion } from 'framer-motion';
import { ArrowRight, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';
import { useCMSPromoCarousel, useCMSSections } from '@/hooks/useCMSPromos';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Import fallback promo images
import promoBienvenida from '@/assets/promo-bienvenida.jpg';
import promoCashback from '@/assets/promo-cashback.jpg';
import promoTorneo from '@/assets/promo-torneo.jpg';

const promoImages: Record<string, string> = {
  'Bono de Bienvenida 100%': promoBienvenida,
  'Cashback Semanal 10%': promoCashback,
  'Torneo de Slots $10,000': promoTorneo,
};

export const PromosCarouselSection = () => {
  const { data: sections } = useCMSSections();
  const { data: promos, isLoading } = useCMSPromoCarousel();

  const section = sections?.find(s => s.key === 'promos');
  if (section && !section.enabled) return null;

  const handleClick = (link: string | null) => {
    if (link) {
      if (link.startsWith('http') || link.startsWith('https')) {
        window.open(link, '_blank');
      } else {
        window.location.href = link;
      }
    }
  };

  if (isLoading || !promos?.length) return null;

  return (
    <section id="promos" className="py-20 md:py-28 bg-gradient-to-b from-card/40 via-background to-card/40 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gold/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6"
            >
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">OFERTAS EXCLUSIVAS</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {section?.title || 'Promociones'} <span className="text-gradient-gold">Destacadas</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {promos.map((promo, index) => (
                <CarouselItem key={promo.id} className="pl-4 md:basis-1/2 lg:basis-1/2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative h-64 md:h-72 rounded-3xl overflow-hidden group cursor-pointer border border-gold/20 hover:border-gold/50 transition-all duration-500 hover:shadow-[0_0_60px_-10px_hsl(var(--gold)/0.4)]"
                    onClick={() => handleClick(promo.cta_link)}
                  >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/30 via-gold/10 to-accent/10" />
                    
                    {/* Sparkle decorations */}
                    <Sparkles className="absolute top-4 right-4 w-6 h-6 text-gold/40 group-hover:text-gold/80 transition-colors" />
                    <Sparkles className="absolute top-8 right-10 w-4 h-4 text-gold/30 group-hover:text-gold/60 transition-colors" />
                    
                    {/* Image - use local fallback */}
                    <img
                      src={promo.image_url || promoImages[promo.title] || promoBienvenida}
                      alt={promo.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gold/20 backdrop-blur-sm flex items-center justify-center">
                          <Gift className="w-5 h-5 text-gold" />
                        </div>
                        <span className="text-xs text-gold font-semibold uppercase tracking-wide">Promoción</span>
                      </div>
                      <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
                        {promo.title}
                      </h3>
                      {promo.subtitle && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">{promo.subtitle}</p>
                      )}
                      <Button variant="hero" size="lg" className="w-fit group-hover:translate-x-2 transition-transform">
                        {promo.cta_text}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold/20 blur-[50px]" />
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-card/80 border-white/10 hover:bg-card" />
            <CarouselNext className="hidden md:flex -right-4 bg-card/80 border-white/10 hover:bg-card" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
