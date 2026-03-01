import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Award, Clock, CheckCircle, Star, Lock } from 'lucide-react';

const guarantees = [
  {
    icon: Shield,
    title: 'Sin costo de inscripción',
    desc: 'Nunca te cobraremos por unirte. Tu banca es tuya.',
  },
  {
    icon: Clock,
    title: 'Respuesta en menos de 1 hora',
    desc: 'Nuestro equipo te contacta rápido.',
  },
  {
    icon: Award,
    title: 'Capacitación incluida',
    desc: 'Te entrenamos antes de que empieces a operar.',
  },
  {
    icon: Lock,
    title: 'Datos 100% protegidos',
    desc: 'Tu información es confidencial y segura.',
  },
  {
    icon: CheckCircle,
    title: 'Sin permanencia obligatoria',
    desc: 'Podés retirarte cuando quieras, sin penalidades.',
  },
  {
    icon: Star,
    title: 'Soporte dedicado 24/7',
    desc: 'Siempre hay alguien disponible para ayudarte.',
  },
];

export const GuaranteesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            <Shield className="w-4 h-4" />
            Nuestro compromiso
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Garantías para tu <span className="text-gradient-primary">tranquilidad</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-5 border border-border/40 hover:border-primary/30 transition-all duration-400 group overflow-hidden"
            >
              {/* Animated border glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, hsl(160 84% 45% / 0.08) 0%, transparent 50%, hsl(38 92% 55% / 0.08) 100%)',
                }}
              />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
                >
                  <g.icon className="w-5 h-5 text-primary" />
                </motion.div>
                <h3 className="font-display text-sm font-bold text-foreground mb-1">{g.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
