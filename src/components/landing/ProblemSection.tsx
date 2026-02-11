import { motion } from 'framer-motion';
import { TrendingDown, Lock, Building2, Clock, AlertCircle } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

const defaultProblems = [
  { icon: TrendingDown, title: 'Techo salarial', description: 'Ingresos limitados sin importar cuánto trabajes' },
  { icon: Lock, title: 'Sin libertad', description: 'Horarios rígidos y sin movilidad geográfica' },
  { icon: Building2, title: 'Altos costos', description: 'Negocio físico requiere inventario, local y empleados' },
  { icon: Clock, title: 'Poco escalable', description: 'Solo creces por tu tiempo físico disponible' },
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
    <section id="problema" className="py-28 relative overflow-hidden">
      {/* Dramatic red ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/[0.04] to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-destructive/[0.06] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6"
          >
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive tracking-wide uppercase">¿Te suena familiar?</span>
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-destructive/10 hover:border-destructive/40 transition-all duration-500 text-center group hover:-translate-y-1"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />
                
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
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
