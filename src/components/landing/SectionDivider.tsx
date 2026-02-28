import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface SectionDividerProps {
  variant?: 'primary' | 'gold' | 'subtle';
}

export const SectionDivider = ({ variant = 'subtle' }: SectionDividerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scaleX = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.7, 0.9], [0, 1, 1, 0]);

  const colorMap = {
    primary: 'from-transparent via-primary/40 to-transparent',
    gold: 'from-transparent via-gold/40 to-transparent',
    subtle: 'from-transparent via-border/50 to-transparent',
  };

  const glowMap = {
    primary: 'hsl(var(--primary) / 0.3)',
    gold: 'hsl(var(--gold) / 0.3)',
    subtle: 'transparent',
  };

  return (
    <div ref={ref} className="py-2 max-w-lg mx-auto px-4">
      <motion.div
        style={{ scaleX, opacity }}
        className="relative"
      >
        <div className={`h-px bg-gradient-to-r ${colorMap[variant]}`} />
        {variant !== 'subtle' && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: variant === 'primary' ? 'hsl(var(--primary))' : 'hsl(var(--gold))',
              boxShadow: `0 0 12px ${glowMap[variant]}`,
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
};
