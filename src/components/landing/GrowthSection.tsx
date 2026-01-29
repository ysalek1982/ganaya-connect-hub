import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Rocket } from 'lucide-react';

const timeline = [
  {
    period: 'Mes 1–2',
    clients: '0–10 clientes',
    income: '$10–$50/mes',
    activity: 'Captación inicial',
    icon: Users,
  },
  {
    period: 'Mes 3–4',
    clients: '10–30 clientes',
    income: '$50–$150/mes',
    activity: 'Fidelización y referidos',
    icon: TrendingUp,
  },
  {
    period: 'Mes 5–6',
    clients: '30–50 clientes',
    income: '$150–$300/mes',
    activity: 'Identificar sub-agentes',
    icon: Calendar,
  },
  {
    period: 'Mes 7+',
    clients: 'Sub-agentes activos',
    income: '$300–$500+/mes',
    activity: 'Expansión multinivel',
    icon: Rocket,
  },
];

export const GrowthSection = () => {
  return (
    <section id="crecimiento" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Cronograma <span className="text-gradient-gold">realista</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Proyección de crecimiento basada en actividad constante
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {timeline.map((phase, index) => (
            <motion.div
              key={phase.period}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 relative group hover:border-gold/30 transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center font-display font-bold text-gold text-sm">
                {index + 1}
              </div>
              
              <div className="w-12 h-12 mb-4 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <phase.icon className="w-6 h-6 text-gold" />
              </div>
              
              <h3 className="font-display text-lg font-bold text-gold mb-3">
                {phase.period}
              </h3>
              
              <div className="space-y-2 text-sm">
                <p className="text-foreground">{phase.clients}</p>
                <p className="font-semibold text-primary">{phase.income}</p>
                <p className="text-muted-foreground">{phase.activity}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-xs text-muted-foreground"
        >
          * Ingresos referenciales, dependen de tu actividad y red
        </motion.p>
      </div>
    </section>
  );
};
