import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Rocket, ArrowRight } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

const timeline = [
  { period: 'Mes 1–2', clients: '0–10 clientes', income: '$10–$50/mes', activity: 'Captación inicial', icon: Users },
  { period: 'Mes 3–4', clients: '10–30 clientes', income: '$50–$150/mes', activity: 'Fidelización y referidos', icon: TrendingUp },
  { period: 'Mes 5–6', clients: '30–50 clientes', income: '$150–$300/mes', activity: 'Identificar sub-agentes', icon: Calendar },
  { period: 'Mes 7+', clients: 'Sub-agentes activos', income: '$300–$500+/mes', activity: 'Expansión multinivel', icon: Rocket },
];

export const GrowthSection = () => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.growth === false) return null;

  return (
    <section id="crecimiento" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.04] to-background" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gold/[0.04] rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            Tu progreso
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Cronograma <span className="text-gradient-gold">realista</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Proyección de crecimiento basada en actividad constante
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {timeline.map((phase, index) => (
            <motion.div
              key={phase.period}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
              className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-gold/30 transition-all duration-500 group hover:-translate-y-1"
            >
              {/* Step badge */}
              <div className="absolute -top-3 -right-3 w-9 h-9 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center font-display font-black text-gold text-sm shadow-lg">
                {index + 1}
              </div>

              {/* Top accent */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              
              <div className="w-14 h-14 mb-6 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                <phase.icon className="w-7 h-7 text-gold" />
              </div>
              
              <h3 className="font-display text-xl font-black text-gold mb-4">{phase.period}</h3>
              
              <div className="space-y-2.5 text-sm">
                <p className="text-foreground/90 font-medium">{phase.clients}</p>
                <p className="font-bold text-primary text-lg">{phase.income}</p>
                <p className="text-muted-foreground">{phase.activity}</p>
              </div>

              {/* Arrow connector for desktop */}
              {index < timeline.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                  <ArrowRight className="w-5 h-5 text-gold/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-sm text-muted-foreground/60"
        >
          * Ingresos referenciales. Dependen de tu actividad y tamaño de red.
        </motion.p>
      </div>
    </section>
  );
};
