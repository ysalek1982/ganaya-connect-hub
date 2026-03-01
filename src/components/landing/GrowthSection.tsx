import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Users, TrendingUp, Rocket, ArrowRight } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useRef } from 'react';

const timeline = [
  { period: 'Mes 1–2', clients: '0–10 clientes', income: '$10–$50/mes', activity: 'Captación inicial', icon: Users },
  { period: 'Mes 3–4', clients: '10–30 clientes', income: '$50–$150/mes', activity: 'Fidelización y referidos', icon: TrendingUp },
  { period: 'Mes 5–6', clients: '30–50 clientes', income: '$150–$300/mes', activity: 'Identificar sub-agentes', icon: Calendar },
  { period: 'Mes 7+', clients: 'Sub-agentes activos', income: '$300–$500+/mes', activity: 'Expansión multinivel', icon: Rocket },
];

export const GrowthSection = () => {
  const { data: content } = useLandingContent();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end 0.5'],
  });

  if (content?.sectionsEnabled?.growth === false) return null;

  return (
    <section id="crecimiento" ref={sectionRef} className="py-16 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.04] to-background" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[700px] h-[200px] sm:h-[300px] bg-gold/[0.04] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs sm:text-sm font-semibold mb-4 sm:mb-6 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            Tu progreso
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-5">
            Cronograma <span className="text-gradient-gold">realista</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Proyección de crecimiento basada en actividad constante
          </p>
        </motion.div>

        {/* Horizontal progress bar */}
        <div className="max-w-5xl mx-auto mb-8 sm:mb-10">
          <div className="relative h-1.5 sm:h-2 rounded-full bg-border/30 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold via-gold to-primary"
              style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
            />
          </div>
          <div className="flex justify-between mt-1.5 sm:mt-2">
            {timeline.map((phase, i) => {
              const pos = (i + 0.5) / timeline.length;
              return (
                <motion.span
                  key={phase.period}
                  className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium"
                  style={{
                    opacity: useTransform(scrollYProgress, [pos - 0.1, pos], [0.4, 1]),
                  }}
                >
                  {phase.period}
                </motion.span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
          {timeline.map((phase, index) => {
            const stepThreshold = (index + 0.3) / timeline.length;

            return (
              <motion.div
                key={phase.period}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
                className="relative bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-7 border border-border/50 hover:border-gold/30 transition-all duration-500 group hover:-translate-y-1"
              >
                {/* Step badge */}
                <motion.div
                  className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border flex items-center justify-center font-display font-black text-xs sm:text-sm shadow-lg"
                  style={{
                    backgroundColor: useTransform(scrollYProgress, (v: number) =>
                      v > stepThreshold ? 'hsl(38, 92%, 55%, 0.3)' : 'hsl(38, 92%, 55%, 0.1)'
                    ),
                    borderColor: useTransform(scrollYProgress, (v: number) =>
                      v > stepThreshold ? 'hsl(38, 92%, 55%, 0.6)' : 'hsl(38, 92%, 55%, 0.2)'
                    ),
                    color: 'hsl(38, 92%, 55%)',
                  }}
                >
                  {index + 1}
                </motion.div>

                <div className="absolute top-0 left-4 sm:left-6 right-4 sm:right-6 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                <motion.div
                  className="w-10 h-10 sm:w-14 sm:h-14 mb-3 sm:mb-6 rounded-xl sm:rounded-2xl bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{
                    boxShadow: useTransform(scrollYProgress, (v: number) =>
                      v > stepThreshold ? '0 0 20px hsl(38, 92%, 55%, 0.3)' : 'none'
                    ),
                  }}
                >
                  <phase.icon className="w-5 h-5 sm:w-7 sm:h-7 text-gold" />
                </motion.div>

                <h3 className="font-display text-base sm:text-xl font-black text-gold mb-2 sm:mb-4">{phase.period}</h3>

                <div className="space-y-1 sm:space-y-2.5 text-xs sm:text-sm">
                  <p className="text-foreground/90 font-medium">{phase.clients}</p>
                  <p className="font-bold text-primary text-sm sm:text-lg">{phase.income}</p>
                  <p className="text-muted-foreground text-[11px] sm:text-sm">{phase.activity}</p>
                </div>

                {index < timeline.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight className="w-5 h-5 text-gold/30" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-6 sm:mt-10 text-xs sm:text-sm text-muted-foreground/60"
        >
          * Ingresos referenciales. Dependen de tu actividad y tamaño de red.
        </motion.p>
      </div>
    </section>
  );
};
