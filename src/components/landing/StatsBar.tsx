import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Users, Globe, DollarSign, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Users, value: 150, suffix: '+', label: 'Agentes activos', prefix: '' },
  { icon: Globe, value: 5, suffix: '', label: 'Países', prefix: '' },
  { icon: DollarSign, value: 40, suffix: '%', label: 'Comisión máxima', prefix: '' },
  { icon: TrendingUp, value: 98, suffix: '%', label: 'Satisfacción', prefix: '' },
];

const AnimatedNumber = ({ value, suffix, prefix, inView }: { value: number; suffix: string; prefix: string; inView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <span className="tabular-nums font-black">
      {prefix}{count}{suffix}
    </span>
  );
};

export const StatsBar = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-gold/5 to-primary/5" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-gold/10"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-border/20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, type: 'spring' }}
              className="flex flex-col items-center justify-center py-3 group"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-2xl md:text-3xl font-display text-primary">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} inView={inView} />
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
