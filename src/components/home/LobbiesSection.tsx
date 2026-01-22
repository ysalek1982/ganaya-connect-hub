import { motion } from 'framer-motion';
import { ArrowRight, Gamepad2, Trophy, Tv, Zap, Dice5, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './ScrollReveal';
import { StadiumLights } from './StadiumLights';
import { useCMSLobbies, useCMSSections } from '@/hooks/useCMSPromos';

// Import local fallback images
import lobbyDeportes from '@/assets/lobby-deportes.jpg';
import lobbyCasino from '@/assets/lobby-casino.jpg';
import lobbyLiveCasino from '@/assets/lobby-live-casino.jpg';
import lobbyTvGames from '@/assets/lobby-tv-games.jpg';
import lobbyRapidos from '@/assets/lobby-rapidos.jpg';

const categoryIcons: Record<string, typeof Gamepad2> = {
  deportes: Trophy,
  casino: Dice5,
  'live-casino': Gamepad2,
  'tv-games': Tv,
  rapidos: Zap,
};

const categoryImages: Record<string, string> = {
  deportes: lobbyDeportes,
  casino: lobbyCasino,
  'live-casino': lobbyLiveCasino,
  'tv-games': lobbyTvGames,
  rapidos: lobbyRapidos,
};

const categoryStyles: Record<string, { 
  gradient: string; 
  glow: string; 
  border: string;
  iconBg: string;
  accent: string;
}> = {
  deportes: {
    gradient: 'bg-gradient-to-br from-primary/50 via-primary/30 to-emerald-900/40',
    glow: 'hover:shadow-[0_0_80px_-15px_hsl(156,100%,50%)]',
    border: 'border-primary/40 hover:border-primary',
    iconBg: 'bg-primary/30',
    accent: 'text-primary',
  },
  casino: {
    gradient: 'bg-gradient-to-br from-gold/50 via-amber-600/30 to-orange-900/40',
    glow: 'hover:shadow-[0_0_80px_-15px_hsl(45,100%,50%)]',
    border: 'border-gold/40 hover:border-gold',
    iconBg: 'bg-gold/30',
    accent: 'text-gold',
  },
  'live-casino': {
    gradient: 'bg-gradient-to-br from-accent/50 via-rose-600/30 to-red-900/40',
    glow: 'hover:shadow-[0_0_80px_-15px_hsl(345,100%,60%)]',
    border: 'border-accent/40 hover:border-accent',
    iconBg: 'bg-accent/30',
    accent: 'text-accent',
  },
  'tv-games': {
    gradient: 'bg-gradient-to-br from-purple-500/50 via-violet-600/30 to-purple-900/40',
    glow: 'hover:shadow-[0_0_80px_-15px_rgba(168,85,247,0.8)]',
    border: 'border-purple-500/40 hover:border-purple-500',
    iconBg: 'bg-purple-500/30',
    accent: 'text-purple-400',
  },
  rapidos: {
    gradient: 'bg-gradient-to-br from-[#25D366]/50 via-emerald-600/30 to-teal-900/40',
    glow: 'hover:shadow-[0_0_80px_-15px_rgba(37,211,102,0.8)]',
    border: 'border-[#25D366]/40 hover:border-[#25D366]',
    iconBg: 'bg-[#25D366]/30',
    accent: 'text-[#25D366]',
  },
};

const categoryEmojis: Record<string, string> = {
  deportes: '⚽',
  casino: '🎰',
  'live-casino': '🃏',
  'tv-games': '📺',
  rapidos: '🚀',
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
    <section id="lobbies" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-background via-card/30 to-background">
      {/* Ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <Gamepad2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">EXPLORA NUESTROS JUEGOS</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {section?.title?.split(' ').slice(0, -2).join(' ') || 'Lo Mejor para'}{' '}
              <span className="text-gradient-primary">
                {section?.title?.split(' ').slice(-2).join(' ') || 'Jugar y Apostar'}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section?.subtitle || 'Elige tu categoría favorita y empieza a ganar'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lobbies?.map((lobby, i) => {
            const Icon = categoryIcons[lobby.category] || Gamepad2;
            const styles = categoryStyles[lobby.category] || categoryStyles.deportes;
            const emoji = categoryEmojis[lobby.category] || '🎮';
            const isLarge = i === 0;
            
            return (
              <ScrollReveal key={lobby.id} delay={i * 100}>
                <motion.div
                  className={`relative group cursor-pointer rounded-3xl overflow-hidden border-2 transition-all duration-500 ${styles.border} ${styles.glow} ${isLarge ? 'lg:col-span-2 h-80' : 'h-72'}`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => handleClick(lobby.cta_link)}
                >
                  {/* Rich gradient background */}
                  <div className={`absolute inset-0 ${styles.gradient}`} />
                  
                  {/* Animated pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)
                      `,
                    }} />
                  </div>
                  
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }} />
                  
                  {/* Image - use local fallback if no CMS image */}
                  <img
                    src={lobby.image_url || categoryImages[lobby.category] || categoryImages.deportes}
                    alt={lobby.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                    loading="lazy"
                  />
                  
                  {/* Bottom overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />

                  {/* Badge */}
                  {lobby.badge && (
                    <motion.div 
                      className="absolute top-4 right-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/25"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                      {lobby.badge}
                    </motion.div>
                  )}

                  {/* Large emoji decoration */}
                  <div className="absolute top-6 left-6 text-6xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500">
                    {emoji}
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl ${styles.iconBg} backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className={`w-8 h-8 ${styles.accent}`} />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2 drop-shadow-lg">
                          {lobby.title}
                        </h3>
                        {lobby.description && (
                          <p className="text-foreground/80 text-sm line-clamp-2 max-w-md">
                            {lobby.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="hero"
                      size="lg"
                      className="w-fit group-hover:translate-x-2 transition-transform shadow-xl"
                    >
                      <Play className="w-4 h-4" />
                      {lobby.cta_text}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Animated corner glow */}
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/40 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
