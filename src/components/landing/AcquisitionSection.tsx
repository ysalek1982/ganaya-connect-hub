import { motion } from 'framer-motion';
import { Users, MessageCircle, CheckCircle2 } from 'lucide-react';
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
    tips: [
      'Pitch de 30 segundos: problema → solución → beneficio',
      'Bonificación especial a primeros 10 clientes',
      'Crea un grupo VIP inicial con tus mejores contactos',
    ],
  },
  {
    title: 'Grupos de mensajería',
    description: 'WhatsApp/Telegram de deportes y pronósticos',
    tips: [
      'Pronósticos gratis para generar confianza',
      'Canal con atención rápida y personalizada',
      'Capturas de ganancias (sin prometer resultados)',
    ],
  },
];

export const AcquisitionSection = () => {
  const { data: content } = useLandingContent();

  if (content?.sectionsEnabled?.acquisition === false) return null;

  const cms = content?.acquisitionSection;
  const title = cms?.title || 'Métodos de captación';
  const subtitle = cms?.subtitle || 'Estrategias probadas para conseguir tus primeros clientes';
  const methods = cms?.methods && cms.methods.length > 0 ? cms.methods : defaultMethods;

  const icons = [Users, MessageCircle];

  return (
    <section id="captacion" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.02] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-4">
            Estrategia
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Métodos de <span className="text-gradient-primary">captación</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {methods.map((method, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-border/50 hover:border-gold/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {method.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
