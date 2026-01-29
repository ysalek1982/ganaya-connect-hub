import { motion } from 'framer-motion';
import { TrendingDown, Clock, Store, Users } from 'lucide-react';

const problems = [
  {
    icon: TrendingDown,
    title: 'Techo salarial',
    description: 'Ingresos limitados sin importar cuánto trabajes',
  },
  {
    icon: Clock,
    title: 'Sin libertad',
    description: 'Horarios rígidos y sin movilidad geográfica',
  },
  {
    icon: Store,
    title: 'Altos costos',
    description: 'Negocio físico requiere inventario, local y empleados',
  },
  {
    icon: Users,
    title: 'Poco escalable',
    description: 'Solo creces por tu tiempo físico disponible',
  },
];

export const ProblemSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            El <span className="text-accent">problema</span> actual
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ¿Te identificás con alguno de estos obstáculos?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center group hover:border-accent/30 transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <problem.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
