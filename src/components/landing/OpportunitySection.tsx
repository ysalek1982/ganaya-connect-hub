import { motion } from 'framer-motion';
import { TrendingUp, Smartphone, Globe, DollarSign } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

const defaultStats = [
  { value: '+25%', label: 'Crecimiento anual', sublabel: 'Mercado iGaming LATAM', icon: TrendingUp },
  { value: '85%', label: 'Operaciones móviles', sublabel: 'Desde smartphones', icon: Smartphone },
  { value: 'Alta', label: 'Demanda local', sublabel: 'Pagos en moneda local', icon: Globe },
  { value: '$8.5B', label: 'Mercado 2026', sublabel: 'Proyección USD', icon: DollarSign },
];

export const OpportunitySection = () => {
  const { data: content } = useLandingContent();

  if (content?.sectionsEnabled?.opportunity === false) return null;

  const cms = content?.opportunitySection;
  const title = cms?.title || 'Oportunidad LATAM';
  const subtitle = cms?.subtitle || 'El mercado de apuestas online crece a ritmo acelerado en América Latina';
  const stats = cms?.stats && cms.stats.length > 0
    ? cms.stats
    : defaultStats.map(s => ({ value: s.value, label: s.label, sublabel: s.sublabel }));

  const icons = [TrendingUp, Smartphone, Globe, DollarSign];

  return (
    <section id="oportunidad" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Mercado en expansión
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {title.split(' ').map((word, i) => 
              i === word.length - 1 ? <span key={i} className="text-gradient-primary">{word} </span> : word + ' '
            )}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 text-center group"
              >
                <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </p>
                <h3 className="font-display text-sm font-semibold text-foreground mb-1">
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
