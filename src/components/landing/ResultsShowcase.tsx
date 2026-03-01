import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, Flame, Trophy, Target, Sparkles } from 'lucide-react';

const results = [
  {
    metric: '$1.35M',
    label: 'Comisiones pagadas este mes',
    change: '+34%',
    icon: Flame,
    color: 'primary' as const,
  },
  {
    metric: '1,500+',
    label: 'Agentes activos en la red',
    change: '+22%',
    icon: Trophy,
    color: 'gold' as const,
  },
  {
    metric: '< 1h',
    label: 'Tiempo de respuesta promedio',
    change: 'Récord',
    icon: Target,
    color: 'primary' as const,
  },
];

export const ResultsShowcase = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-4 sm:mb-6 uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            Resultados en tiempo real
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Números que <span className="text-gradient-primary">hablan</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Datos actualizados de nuestra red de agentes activa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
          {results.map((r, i) => {
            const isPrimary = r.color === 'primary';
            return (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-border/50 hover:border-primary/40 transition-all duration-500 overflow-hidden group cursor-default"
              >
                {/* Top glow line */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${isPrimary ? 'via-primary/50' : 'via-gold/50'} to-transparent`} />

                {/* Hover background pulse */}
                <motion.div
                  className={`absolute inset-0 ${isPrimary ? 'bg-primary/5' : 'bg-gold/5'} rounded-2xl`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${isPrimary ? 'bg-primary/10' : 'bg-gold/10'} flex items-center justify-center`}
                    >
                      <r.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isPrimary ? 'text-primary' : 'text-gold'}`} />
                    </motion.div>
                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-primary/10 text-[10px] sm:text-xs font-bold text-primary">
                      <ArrowUpRight className="w-3 h-3" />
                      {r.change}
                    </span>
                  </div>

                  <motion.p
                    className={`font-display text-3xl sm:text-4xl font-black mb-1.5 sm:mb-2 ${isPrimary ? 'text-primary' : 'text-gold'}`}
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, type: 'spring', stiffness: 200 }}
                  >
                    {r.metric}
                  </motion.p>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{r.label}</p>
                </div>

                {/* Animated corner accent */}
                <motion.div
                  className={`absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full ${isPrimary ? 'bg-primary/5' : 'bg-gold/5'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6 sm:mt-8 text-[10px] sm:text-xs text-muted-foreground/50"
        >
          * Datos referenciales basados en la actividad de la red. Actualizados periódicamente.
        </motion.p>
      </div>
    </section>
  );
};
