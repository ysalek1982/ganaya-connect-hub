import { motion, useInView, AnimatePresence } from 'framer-motion';
import { TrendingUp, Smartphone, Globe, DollarSign, ChevronRight } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useRef, useState, useEffect } from 'react';

const defaultStats = [
  { value: '+25%', label: 'Crecimiento anual', sublabel: 'Mercado iGaming LATAM', icon: TrendingUp, detail: 'El mercado de apuestas online en LATAM crece exponencialmente cada año, superando $6B en 2025.' },
  { value: '85%', label: 'Operaciones móviles', sublabel: 'Desde smartphones', icon: Smartphone, detail: '85% de las apuestas se realizan desde celulares, haciendo el modelo de agentes móvil ideal.' },
  { value: 'Alta', label: 'Demanda local', sublabel: 'Pagos en moneda local', icon: Globe, detail: 'La demanda de agentes locales que faciliten pagos en moneda local sigue creciendo.' },
  { value: '$8.5B', label: 'Mercado 2026', sublabel: 'Proyección USD', icon: DollarSign, detail: 'Se proyecta que el mercado alcance $8.5 mil millones USD para 2026 en la región.' },
];

// Animated map dots representing LATAM presence
const MapDots = () => {
  const dots = [
    { x: 35, y: 25, label: '🇨🇴', delay: 0 },
    { x: 35, y: 42, label: '🇪🇨', delay: 0.3 },
    { x: 30, y: 85, label: '🇦🇷', delay: 0.5 },
    { x: 28, y: 90, label: '🇵🇾', delay: 0.1 },
    { x: 55, y: 15, label: '🇺🇸', delay: 0.4 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: dot.delay + 0.5, type: 'spring' }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute -inset-3 rounded-full border border-primary/40"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: dot.delay }}
          />
          <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm">{dot.label}</span>
        </motion.div>
      ))}
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {dots.slice(0, -1).map((dot, i) => {
          const next = dots[i + 1];
          return (
            <motion.line
              key={i}
              x1={`${dot.x}%`}
              y1={`${dot.y}%`}
              x2={`${next.x}%`}
              y2={`${next.y}%`}
              stroke="hsl(160, 84%, 45%)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.15, duration: 0.8 }}
            />
          );
        })}
      </svg>
    </div>
  );
};

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

const ExpandableCard = ({ stat, index, inView }: { stat: any; index: number; inView: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = [TrendingUp, Smartphone, Globe, DollarSign][index % 4];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
      onClick={() => setExpanded(!expanded)}
      className="relative bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/40 transition-all duration-500 text-center group cursor-pointer overflow-hidden"
    >
      <motion.div layout className="p-7">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <motion.div
          animate={expanded ? { scale: 0.9, y: -5 } : { scale: 1, y: 0 }}
          className="w-12 h-12 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300"
        >
          <Icon className="w-6 h-6 text-primary" />
        </motion.div>

        <p className="font-display text-4xl md:text-5xl font-black text-primary mb-3">
          <AnimatedCounter value={stat.value} inView={inView} />
        </p>
        <h3 className="font-display text-sm font-bold text-foreground mb-1 uppercase tracking-wide">{stat.label}</h3>
        <p className="text-xs text-muted-foreground">{stat.sublabel}</p>

        {/* Expand indicator */}
        <motion.div
          className="flex items-center justify-center gap-1 mt-3"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight className={`w-3 h-3 text-primary/50 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          <span className="text-[10px] text-muted-foreground/50">Más info</span>
        </motion.div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border/30">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {stat.detail || defaultStats[index]?.detail || ''}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: expanded ? 0.1 : 0 }}
        style={{ background: 'radial-gradient(circle at center, hsl(160, 84%, 45%) 0%, transparent 70%)' }}
      />
    </motion.div>
  );
};

export const OpportunitySection = () => {
  const { data: content } = useLandingContent();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  if (content?.sectionsEnabled?.opportunity === false) return null;

  const cms = content?.opportunitySection;
  const subtitle = cms?.subtitle || 'El mercado de apuestas online crece a ritmo acelerado en América Latina';
  const stats = cms?.stats && cms.stats.length > 0
    ? cms.stats
    : defaultStats.map(s => ({ value: s.value, label: s.label, sublabel: s.sublabel, detail: s.detail }));

  return (
    <section id="oportunidad" className="py-28 relative overflow-hidden aurora-bg" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.04] to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/[0.05] rounded-full blur-[150px] morph-blob" />

      <MapDots />

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
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {stats.map((stat: any, index: number) => (
            <ExpandableCard key={index} stat={stat} index={index} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};
