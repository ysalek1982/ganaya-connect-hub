import { motion } from 'framer-motion';
import { Zap, UserCheck, Percent, Network } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Velocidad relámpago',
    description: 'Acreditación inmediata para tus clientes',
  },
  {
    icon: UserCheck,
    title: 'Autonomía total',
    description: 'Manejás tu cartera y tus horarios',
  },
  {
    icon: Percent,
    title: 'Altas comisiones',
    description: 'Hasta 40% + cascada 7% y 5%',
  },
  {
    icon: Network,
    title: 'Modelo descentralizado',
    description: 'Sé la sucursal local de Ganaya.bet',
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            La solución: <span className="text-gradient-primary">Ganaya.bet Agents</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un modelo de negocio digital, escalable y con bajas barreras de entrada
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 group hover:border-primary/30 transition-all duration-300 card-lift"
            >
              <div className="w-14 h-14 mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
