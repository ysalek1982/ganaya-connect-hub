import { motion } from 'framer-motion';
import { Banknote, MessageCircle, BadgeCheck, Zap, Shield } from 'lucide-react';

const benefits = [
  {
    icon: Banknote,
    title: 'Pagos en moneda local',
    description: 'Recarga y retira en pesos, bolivianos, soles, dólares o tu moneda local. Sin complicaciones.',
  },
  {
    icon: MessageCircle,
    title: 'Atención inmediata por WhatsApp',
    description: 'Escríbele directamente a tu cajero y recibe respuesta en minutos. Soporte real, no bots.',
  },
  {
    icon: BadgeCheck,
    title: 'Cajeros verificados',
    description: 'Todos nuestros cajeros pasan por un proceso de verificación. Tu dinero está seguro.',
  },
  {
    icon: Zap,
    title: 'Proceso simple',
    description: 'Sin vueltas. Escribes, recargas y juegas. Retiras cuando quieras, rápido y fácil.',
  },
  {
    icon: Shield,
    title: '+18 Juego responsable',
    description: 'Solo mayores de edad. Promovemos el juego responsable y el control de límites.',
  },
];

export const WhyGanayaSection = () => {
  return (
    <section className="py-20 relative overflow-hidden" id="por-que-ganaya">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            ¿Por qué <span className="text-gradient-primary">Ganaya.bet</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Casino online con atención humana real. Todo lo que necesitas para jugar tranquilo.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card/50 border border-white/5 backdrop-blur-sm hover:bg-card/70 hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGanayaSection;
