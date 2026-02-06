import { motion } from 'framer-motion';
import { TrendingDown, Lock, Building2, Clock } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

const defaultProblems = [
  {
    icon: TrendingDown,
    title: 'Techo salarial',
    description: 'Ingresos limitados sin importar cuánto trabajes',
  },
  {
    icon: Lock,
    title: 'Sin libertad',
    description: 'Horarios rígidos y sin movilidad geográfica',
  },
  {
    icon: Building2,
    title: 'Altos costos',
    description: 'Negocio físico requiere inventario, local y empleados',
  },
  {
    icon: Clock,
    title: 'Poco escalable',
    description: 'Solo creces por tu tiempo físico disponible',
  },
];

export const ProblemSection = () => {
  const { data: content } = useLandingContent();

  if (content?.sectionsEnabled?.problem === false) return null;

  const cms = content?.problemSection;
  const title = cms?.title || 'El problema actual';
  const subtitle = cms?.subtitle || '¿Te identificás con alguno de estos obstáculos?';
  const items = cms?.items && cms.items.length > 0
    ? cms.items
    : defaultProblems.map(p => ({ title: p.title, description: p.description }));

  const icons = [TrendingDown, Lock, Building2, Clock];

  return (
    <section id="problema" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/[0.03] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-4">
            ¿Te suena familiar?
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 border border-destructive/10 hover:border-destructive/30 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <Icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
