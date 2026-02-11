import { motion, useInView } from 'framer-motion';
import { TrendingUp, Smartphone, Globe, DollarSign } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useRef, useState, useEffect } from 'react';

const defaultStats = [
  { value: '+25%', label: 'Crecimiento anual', sublabel: 'Mercado iGaming LATAM', icon: TrendingUp },
  { value: '85%', label: 'Operaciones móviles', sublabel: 'Desde smartphones', icon: Smartphone },
  { value: 'Alta', label: 'Demanda local', sublabel: 'Pagos en moneda local', icon: Globe },
  { value: '$8.5B', label: 'Mercado 2026', sublabel: 'Proyección USD', icon: DollarSign },
];

const AnimatedCounter = ({ value, inView }: { value: string; inView: boolean }) => {
  const numericMatch = value.match(/[\d.]+/);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || !numericMatch) return;
    const target = parseFloat(numericMatch[0]);
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView]);

  if (!numericMatch) return <span>{value}</span>;

  const prefix = value.slice(0, value.indexOf(numericMatch[0]));
  const suffix = value.slice(value.indexOf(numericMatch[0]) + numericMatch[0].length);
  const isDecimal = numericMatch[0].includes('.');

  return (
    <span className="tabular-nums">
      {prefix}{isDecimal ? count.toFixed(1) : Math.round(count)}{suffix}
    </span>
  );
};

export const OpportunitySection = () => {
  const { data: content } = useLandingContent();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  if (content?.sectionsEnabled?.opportunity === false) return null;

  const cms = content?.opportunitySection;
  const title = cms?.title || 'Oportunidad LATAM';
  const subtitle = cms?.subtitle || 'El mercado de apuestas online crece a ritmo acelerado en América Latina';
  const stats = cms?.stats && cms.stats.length > 0
    ? cms.stats
    : defaultStats.map(s => ({ value: s.value, label: s.label, sublabel: s.sublabel }));
  const icons = [TrendingUp, Smartphone, Globe, DollarSign];

  return (
    <section id="oportunidad" className="py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.04] to-background" />
      {/* Large ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/[0.05] rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            Mercado en expansión
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Oportunidad <span className="text-gradient-primary">LATAM</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
                className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-primary/40 transition-all duration-500 text-center group hover:-translate-y-1"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                
                <div className="w-12 h-12 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-display text-4xl md:text-5xl font-black text-primary mb-3">
                  <AnimatedCounter value={stat.value} inView={inView} />
                </p>
                <h3 className="font-display text-sm font-bold text-foreground mb-1 uppercase tracking-wide">
                  {stat.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {stat.sublabel}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
