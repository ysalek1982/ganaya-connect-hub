import { motion } from 'framer-motion';
import { ArrowRight, Flame, Zap, Radio, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';
import { StadiumLights } from './StadiumLights';
import { useCMSSpotlightGames, useCMSSections } from '@/hooks/useCMSPromos';

const speedConfig: Record<string, { icon: typeof Zap; color: string; bg: string; glow: string }> = {
  'Rápido': {
    icon: Zap,
    color: 'text-[#25D366]',
    bg: 'bg-[#25D366]/20',
    glow: 'shadow-[0_0_20px_-5px_rgba(37,211,102,0.5)]',
  },
  'Normal': {
    icon: Flame,
    color: 'text-gold',
    bg: 'bg-gold/20',
    glow: 'shadow-[0_0_20px_-5px_hsl(var(--gold)/0.5)]',
  },
  'En Vivo': {
    icon: Radio,
    color: 'text-accent',
    bg: 'bg-accent/20',
    glow: 'shadow-[0_0_20px_-5px_hsl(var(--accent)/0.5)]',
  },
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
              <div key={i} className="h-56 glass-card rounded-2xl animate-pulse" />
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
      
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6"
            >
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">TOP JUEGOS</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {section?.title || 'Juegos'} <span className="text-gradient-accent">Destacados</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section?.subtitle || 'Los favoritos de nuestros jugadores'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {games.map((game, i) => {
            const config = speedConfig[game.speed_tag] || speedConfig.Normal;
            const SpeedIcon = config.icon;
            
            return (
              <ScrollReveal key={game.id} delay={i * 50}>
                <motion.div
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden h-60 md:h-64 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:${config.glow}`}
                  whileHover={{ scale: 1.05, y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => handleClick(game.cta_link)}
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-card/80" />
                  
                  {game.image_url ? (
                    <img
                      src={game.image_url}
                      alt={game.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-gold/10" />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                  {/* Speed tag */}
                  <motion.div 
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full ${config.bg} ${config.color} text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <SpeedIcon className="w-3 h-3" />
                    {game.speed_tag}
                  </motion.div>

                  {/* Ranking badge for first 3 */}
                  {i < 3 && (
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gold/90 text-background flex items-center justify-center text-xs font-bold">
                      #{i + 1}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <span className={`text-[10px] ${config.color} uppercase tracking-wider mb-1 font-medium`}>
                      {game.category}
                    </span>
                    <h3 className="font-display font-bold text-base md:text-lg text-foreground mb-3 line-clamp-1">
                      {game.name}
                    </h3>
                    
                    {/* Play button - appears on hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Button
                        variant="hero"
                        size="sm"
                        className="w-full text-xs h-9"
                      >
                        {game.cta_text}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Sparkle effect on hover */}
                  <Sparkles className="absolute bottom-4 right-4 w-5 h-5 text-primary/0 group-hover:text-primary/60 transition-colors duration-300" />

                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-20 bg-primary/30 blur-[40px]" />
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
