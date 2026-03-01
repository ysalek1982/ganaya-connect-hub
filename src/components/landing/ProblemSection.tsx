import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrendingDown, Lock, Building2, Clock, AlertCircle } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useCallback, useRef, useState } from 'react';

const defaultProblems = [
  { icon: TrendingDown, title: 'Techo salarial', description: 'Ingresos limitados sin importar cuánto trabajes', stat: '72%', statLabel: 'no llega a fin de mes' },
  { icon: Lock, title: 'Sin libertad', description: 'Horarios rígidos y sin movilidad geográfica', stat: '8h+', statLabel: 'jornada promedio' },
  { icon: Building2, title: 'Altos costos', description: 'Negocio físico requiere inventario, local y empleados', stat: '$5K+', statLabel: 'inversión mínima' },
  { icon: Clock, title: 'Poco escalable', description: 'Solo creces por tu tiempo físico disponible', stat: '1x', statLabel: 'techo de ingresos' },
];

const ShakeCard = ({ item, index }: { item: typeof defaultProblems[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 80 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setRevealed(!revealed)}
      className="relative cursor-pointer"
    >
      <motion.div
        animate={isHovered ? {
          x: [0, -3, 3, -2, 2, 0],
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }
        } : { x: 0 }}
        className={`relative bg-card/60 backdrop-blur-sm rounded-2xl p-5 sm:p-7 border transition-all duration-500 text-center overflow-hidden ${
          isHovered ? 'border-destructive/50 shadow-lg shadow-destructive/10' : 'border-destructive/10'
        }`}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />

        {/* Danger pulse background */}
        <motion.div
          className="absolute inset-0 bg-destructive/5 rounded-2xl"
          animate={{ opacity: isHovered ? [0, 0.5, 0] : 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        <motion.div
          animate={isHovered ? { scale: 1.2, rotate: -10 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-5 rounded-2xl bg-destructive/10 flex items-center justify-center"
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" />
        </motion.div>

        <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2">{item.title}</h3>

        {/* Flip between description and stat */}
        <motion.div
          className="h-12 sm:h-14 relative"
          animate={{ rotateX: revealed ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformStyle: 'preserve-3d', perspective: 500 }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.description}</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            <p className="font-display text-xl sm:text-2xl font-black text-destructive">{item.stat}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.statLabel}</p>
          </div>
        </motion.div>

        {/* Tap hint */}
        <motion.p
          className="text-[10px] text-muted-foreground/40 mt-1.5 sm:mt-2"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tocá para ver dato
        </motion.p>

        {/* Animated corner crack effect */}
        <motion.div
          className="absolute top-0 right-0 w-8 h-8"
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full text-destructive/30">
            <path d="M32 0 L32 12 L20 0 Z" fill="currentColor" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const ProblemSection = () => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.problem === false) return null;

  const cms = content?.problemSection;
  const title = cms?.title || 'El problema actual';
  const subtitle = cms?.subtitle || '¿Te identificás con alguno de estos obstáculos?';
  const items = cms?.items && cms.items.length > 0
    ? cms.items.map((p: any, i: number) => ({ ...defaultProblems[i], ...p }))
    : defaultProblems;

  return (
    <section id="problema" className="py-16 sm:py-28 relative overflow-hidden aurora-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/[0.04] to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] bg-destructive/[0.06] rounded-full blur-[120px] morph-blob" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-4 sm:mb-6"
          >
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs sm:text-sm font-semibold text-destructive tracking-wide uppercase">¿Te suena familiar?</span>
          </motion.div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-5">{title}</h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
          {items.map((item: any, index: number) => (
            <ShakeCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
