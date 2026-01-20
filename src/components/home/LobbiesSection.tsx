import { motion } from 'framer-motion';
import { ArrowRight, Gamepad2, Trophy, Tv, Zap, Dice5 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';
import { StadiumLights } from './StadiumLights';
import { useCMSLobbies, useCMSSections } from '@/hooks/useCMSPromos';

const categoryIcons: Record<string, typeof Gamepad2> = {
  deportes: Trophy,
  casino: Dice5,
  'live-casino': Gamepad2,
  'tv-games': Tv,
  rapidos: Zap,
};

const categoryGradients: Record<string, string> = {
  deportes: 'from-primary/30 via-primary/10 to-transparent',
  casino: 'from-gold/30 via-gold/10 to-transparent',
  'live-casino': 'from-accent/30 via-accent/10 to-transparent',
  'tv-games': 'from-purple-500/30 via-purple-500/10 to-transparent',
  rapidos: 'from-[#25D366]/30 via-[#25D366]/10 to-transparent',
};

export const LobbiesSection = () => {
  const { data: sections } = useCMSSections();
  const { data: lobbies, isLoading } = useCMSLobbies();

  const section = sections?.find(s => s.key === 'lobbies');
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

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-64 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lobbies" className="py-20 md:py-28 relative overflow-hidden">
      <StadiumLights />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            {section?.title || 'Lo Mejor para'} <span className="text-gradient-primary">Jugar y Apostar</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {section?.subtitle || 'Elige tu categoría favorita y empieza a ganar'}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lobbies?.map((lobby, i) => {
            const Icon = categoryIcons[lobby.category] || Gamepad2;
            const gradient = categoryGradients[lobby.category] || 'from-primary/30 via-primary/10 to-transparent';
            
            return (
              <ScrollReveal key={lobby.id} delay={i * 100}>
                <motion.div
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden h-72 ${i === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => handleClick(lobby.cta_link)}
                >
                  {/* Background image or gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                  {lobby.image_url && (
                    <img
                      src={lobby.image_url}
                      alt={lobby.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                  {/* Badge */}
                  {lobby.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold uppercase">
                      {lobby.badge}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-foreground">{lobby.title}</h3>
                    </div>
                    
                    {lobby.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{lobby.description}</p>
                    )}

                    <Button
                      variant="hero"
                      size="sm"
                      className="w-fit group-hover:scale-105 transition-transform"
                    >
                      {lobby.cta_text}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-primary/5" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-3xl" />
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
