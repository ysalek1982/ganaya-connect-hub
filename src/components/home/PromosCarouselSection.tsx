import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';
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
    <section id="promos" className="py-16 md:py-24 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Gift className="w-8 h-8 text-primary" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              {section?.title || 'Promociones'} <span className="text-gradient-primary">Destacadas</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {promos.map((promo) => (
                <CarouselItem key={promo.id} className="md:basis-1/2 lg:basis-1/2">
                  <motion.div
                    className="relative h-56 md:h-64 rounded-2xl overflow-hidden group cursor-pointer mx-2"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleClick(promo.cta_link)}
                  >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10" />
                    {promo.image_url && (
                      <img
                        src={promo.image_url}
                        alt={promo.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="font-display font-bold text-xl md:text-2xl text-foreground mb-2">
                        {promo.title}
                      </h3>
                      {promo.subtitle && (
                        <p className="text-muted-foreground text-sm mb-4">{promo.subtitle}</p>
                      )}
                      <Button variant="hero" size="sm" className="w-fit">
                        {promo.cta_text}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
