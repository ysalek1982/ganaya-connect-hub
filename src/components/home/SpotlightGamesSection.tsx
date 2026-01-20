import { motion } from 'framer-motion';
import { ArrowRight, Flame, Zap, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';
import { StadiumLights } from './StadiumLights';
import { useCMSSpotlightGames, useCMSSections } from '@/hooks/useCMSPromos';

const speedIcons: Record<string, typeof Zap> = {
  'Rápido': Zap,
  'Normal': Flame,
  'En Vivo': Radio,
};

const speedColors: Record<string, string> = {
  'Rápido': 'bg-[#25D366]/20 text-[#25D366]',
  'Normal': 'bg-gold/20 text-gold',
  'En Vivo': 'bg-accent/20 text-accent',
};

export const SpotlightGamesSection = () => {
  const { data: sections } = useCMSSections();
  const { data: games, isLoading } = useCMSSpotlightGames();

  const section = sections?.find(s => s.key === 'spotlight');
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 glass-card rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!games?.length) return null;

  return (
    <section id="spotlight" className="py-20 md:py-28 relative overflow-hidden">
      <StadiumLights />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
            {section?.title || 'Juegos'} <span className="text-gradient-primary">Destacados</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {section?.subtitle || 'Los favoritos de nuestros jugadores'}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {games.map((game, i) => {
            const SpeedIcon = speedIcons[game.speed_tag] || Flame;
            const speedColor = speedColors[game.speed_tag] || 'bg-primary/20 text-primary';
            
            return (
              <ScrollReveal key={game.id} delay={i * 50}>
                <motion.div
                  className="relative group cursor-pointer rounded-xl overflow-hidden h-52 glass-card"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => handleClick(game.cta_link)}
                >
                  {/* Background */}
                  {game.image_url ? (
                    <img
                      src={game.image_url}
                      alt={game.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                  {/* Speed tag */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full ${speedColor} text-xs font-bold flex items-center gap-1`}>
                    <SpeedIcon className="w-3 h-3" />
                    {game.speed_tag}
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{game.category}</span>
                    <h3 className="font-display font-bold text-sm text-foreground mb-2 line-clamp-1">{game.name}</h3>
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {game.cta_text}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-16 bg-primary/20 blur-2xl" />
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
