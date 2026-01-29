import { motion } from 'framer-motion';
import { TrendingUp, Smartphone, CreditCard, Globe } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '+25%',
    label: 'Crecimiento anual',
    sublabel: 'Mercado iGaming LATAM',
  },
  {
    icon: Smartphone,
    value: '85%',
    label: 'Operaciones móviles',
    sublabel: 'Desde smartphones',
  },
  {
    icon: CreditCard,
    value: 'Alta',
    label: 'Demanda local',
    sublabel: 'Pagos en moneda local',
  },
  {
    icon: Globe,
    value: '$8.5B',
    label: 'Mercado 2026',
    sublabel: 'Proyección USD',
  },
];

export const OpportunitySection = () => {
  return (
    <section id="oportunidad" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Oportunidad</span> LATAM
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            El mercado de apuestas online crece a ritmo acelerado en América Latina
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center group hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {stat.label}
              </h3>
              <p className="text-xs text-muted-foreground">
                {stat.sublabel}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
