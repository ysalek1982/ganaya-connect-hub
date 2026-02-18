import { motion, useInView } from 'framer-motion';
import { Users, Globe, TrendingUp } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const metrics = [
  { icon: Users, value: 150, suffix: '+', label: 'Agentes activos' },
  { icon: Globe, value: 7, suffix: '', label: 'Países' },
  { icon: TrendingUp, value: 40, suffix: '%', label: 'Comisión máxima' },
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

export const SocialProofStrip = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 }}
      className="relative z-10 -mt-12 mb-8"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-6 sm:gap-12 py-5 px-6 rounded-2xl bg-card/70 backdrop-blur-md border border-border/50 shadow-lg shadow-black/5">
          {metrics.map((m, i) => (
            <div key={m.label} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 hidden sm:flex items-center justify-center">
                <m.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display text-xl sm:text-2xl font-black text-primary leading-none">
                  <AnimatedNum target={m.value} inView={inView} suffix={m.suffix} />
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{m.label}</p>
              </div>
              {i < metrics.length - 1 && (
                <div className="hidden sm:block w-px h-8 bg-border/50 ml-4 sm:ml-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
