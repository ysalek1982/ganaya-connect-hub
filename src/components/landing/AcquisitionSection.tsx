import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, CheckCircle2, Target, ChevronRight } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

interface AcquisitionMethod {
  title: string;
  description: string;
  tips: string[];
}

const defaultMethods: AcquisitionMethod[] = [
  {
    title: 'Contacto directo y referidos',
    description: 'Tu círculo cercano es tu primer mercado',
    tips: ['Pitch de 30 segundos: problema → solución → beneficio', 'Bonificación especial a primeros 10 clientes', 'Crea un grupo VIP inicial con tus mejores contactos'],
  },
  {
    title: 'Grupos de mensajería',
    description: 'WhatsApp/Telegram de deportes y pronósticos',
    tips: ['Pronósticos gratis para generar confianza', 'Canal con atención rápida y personalizada', 'Capturas de ganancias (sin prometer resultados)'],
  },
];

export const AcquisitionSection = () => {
  const { data: content } = useLandingContent();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  if (content?.sectionsEnabled?.acquisition === false) return null;

  const cms = content?.acquisitionSection;
  const subtitle = cms?.subtitle || 'Estrategias probadas para conseguir tus primeros clientes';
  const methods = cms?.methods && cms.methods.length > 0 ? cms.methods : defaultMethods;
  const icons = [Users, MessageCircle];

  return (
    <section id="captacion" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.03] to-background" />
      <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-gold/[0.04] rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6 uppercase tracking-wide">
            <Target className="w-4 h-4" />
            Estrategia
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Métodos de <span className="text-gradient-primary">captación</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {methods.map((method, index) => {
            const Icon = icons[index % icons.length];
            const isExpanded = expandedCard === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
                className="relative bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-gold/30 transition-all duration-500 overflow-hidden cursor-pointer group"
                onClick={() => setExpandedCard(isExpanded ? null : index)}
                whileHover={{ y: -4 }}
              >
                {/* Top accent */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                
                <div className="p-7 lg:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center"
                      animate={isExpanded ? { rotate: [0, -5, 5, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-6 h-6 text-gold" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-foreground">{method.title}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>

                  {/* Always show first tip, animate the rest */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-relaxed">{method.tips[0]}</span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && method.tips.slice(1).map((tip, tipIndex) => (
                        <motion.div
                          key={tipIndex}
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ delay: tipIndex * 0.08, duration: 0.3 }}
                          className="flex items-start gap-2.5 overflow-hidden"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-relaxed">{tip}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {!isExpanded && method.tips.length > 1 && (
                    <motion.p
                      className="text-xs text-gold mt-3 font-medium"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Toca para ver {method.tips.length - 1} tips más →
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
