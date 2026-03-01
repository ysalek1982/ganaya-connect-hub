import { motion, useInView } from 'framer-motion';
import { Users, Globe, TrendingUp, Star, Shield } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const metrics = [
  { icon: Users, value: 150, suffix: '+', label: 'Agentes activos' },
  { icon: Globe, value: 7, suffix: '', label: 'Países' },
  { icon: TrendingUp, value: 40, suffix: '%', label: 'Comisión máxima' },
  { icon: Star, value: 98, suffix: '%', label: 'Satisfacción' },
  { icon: Shield, value: 24, suffix: '/7', label: 'Soporte' },
];

const AnimatedNum = ({ target, inView, suffix }: { target: number; inView: boolean; suffix: string }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span className="tabular-nums">{val}{suffix}</span>;
};

// Double the items for seamless infinite scroll
const marqueeItems = [...metrics, ...metrics];

export const SocialProofStrip = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
      className="relative z-10 -mt-12 mb-8"
    >
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto overflow-hidden py-5 px-2 rounded-2xl bg-card/70 backdrop-blur-md border border-border/50 shadow-xl shadow-primary/5">
          {/* Glow top edge */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card/90 to-transparent z-10 pointer-events-none rounded-l-2xl" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card/90 to-transparent z-10 pointer-events-none rounded-r-2xl" />
          
          <motion.div
            className="flex gap-8 sm:gap-12 items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {marqueeItems.map((m, i) => (
              <div key={`${m.label}-${i}`} className="flex items-center gap-2.5 shrink-0">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"
                >
                  <m.icon className="w-4 h-4 text-primary" />
                </motion.div>
                <div className="text-left">
                  <p className="font-display text-xl sm:text-2xl font-black text-primary leading-none">
                    <AnimatedNum target={m.value} inView={inView} suffix={m.suffix} />
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">{m.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
