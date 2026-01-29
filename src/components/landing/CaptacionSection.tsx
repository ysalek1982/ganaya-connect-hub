import { motion } from 'framer-motion';
import { Users, MessageCircle, Lightbulb } from 'lucide-react';

const methods = [
  {
    icon: Users,
    title: 'Contacto directo y referidos',
    description: 'Tu círculo cercano es tu primer mercado',
    tips: [
      'Pitch de 30 segundos: problema → solución → beneficio',
      'Bonificación especial a primeros 10 clientes',
      'Crea un grupo VIP inicial con tus mejores contactos',
    ],
  },
  {
    icon: MessageCircle,
    title: 'Grupos de mensajería',
    description: 'WhatsApp/Telegram de deportes y pronósticos',
    tips: [
      'Pronósticos gratis para generar confianza',
      'Canal con atención rápida y personalizada',
      'Capturas de ganancias (sin prometer resultados)',
    ],
  },
];

export const CaptacionSection = () => {
  return (
    <section id="captacion" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Métodos de <span className="text-gradient-primary">captación</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estrategias probadas para conseguir tus primeros clientes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {methods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {method.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                {method.tips.map((tip, tipIndex) => (
                  <div key={tipIndex} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border">
                    <Lightbulb className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground/80">{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
