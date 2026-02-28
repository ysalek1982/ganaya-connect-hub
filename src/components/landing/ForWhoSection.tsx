import { motion } from 'framer-motion';
import { Check, X, UserCheck, UserX, Sparkles, Target, Clock, Brain, Flame, Ban, BatteryLow, Snail } from 'lucide-react';
import { useState } from 'react';

const forWho = [
  { title: 'Disciplina', desc: 'Personas con disciplina y constancia para mantener su operación activa', icon: Target },
  { title: 'Comunicación', desc: 'Buen trato y comunicación con personas, clave para fidelizar jugadores', icon: Sparkles },
  { title: 'Ambición', desc: 'Ganas de crecer y construir tu propia red de sub-agentes', icon: Flame },
  { title: 'Disponibilidad', desc: 'Algunas horas diarias para gestionar tu cartera y responder consultas', icon: Clock },
  { title: 'Mentalidad', desc: 'Mentalidad emprendedora, orientada a resultados y mejora continua', icon: Brain },
];

const notForWho = [
  { title: 'Dinero fácil', desc: 'Busca dinero rápido sin esfuerzo ni gestión activa', icon: Ban },
  { title: 'Sin tiempo', desc: 'No tiene tiempo para responder mensajes ni atender a sus jugadores', icon: BatteryLow },
  { title: 'Sin aprendizaje', desc: 'No quiere invertir tiempo en capacitarse y mejorar sus resultados', icon: Snail },
  { title: 'Pasividad', desc: 'Espera resultados sin hacer nada, sin seguimiento ni dedicación', icon: X },
];

const FlipCard = ({ item, positive }: { item: { title: string; desc: string; icon: any }; positive: boolean }) => {
  const [flipped, setFlipped] = useState(false);
  const Icon = item.icon;
  const color = positive ? 'primary' : 'destructive';

  return (
    <motion.div
      className="cursor-pointer"
      style={{ perspective: 800 }}
      onClick={() => setFlipped(!flipped)}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative h-28 sm:h-32"
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-xl p-4 border flex items-center gap-3 ${
            positive
              ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
              : 'bg-destructive/5 border-destructive/20 hover:border-destructive/40'
          } transition-colors`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`w-10 h-10 rounded-xl bg-${color}/15 flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
          <div>
            <p className="font-display font-bold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tocá para ver más</p>
          </div>
          <div className={`ml-auto w-6 h-6 rounded-full bg-${color}/15 flex items-center justify-center shrink-0`}>
            {positive ? <Check className={`w-3.5 h-3.5 text-${color}`} /> : <X className={`w-3.5 h-3.5 text-${color}`} />}
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-xl p-4 border flex items-center ${
            positive
              ? 'bg-primary/10 border-primary/30'
              : 'bg-destructive/10 border-destructive/30'
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-sm text-foreground/90 leading-relaxed">{item.desc}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ForWhoSection = () => {
  return (
    <section id="para-quien" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--surface-1))] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6 uppercase tracking-wide">
            Antes de postular
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            ¿Es para <span className="text-gradient-gold">vos</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Tocá cada tarjeta para ver el detalle
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* For who */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="space-y-1"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </span>
              Sí es para vos si...
            </h3>
            <div className="space-y-3">
              {forWho.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <FlipCard item={item} positive />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Not for who */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="space-y-1"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-destructive/20 flex items-center justify-center">
                <UserX className="w-5 h-5 text-destructive" />
              </span>
              No es para vos si...
            </h3>
            <div className="space-y-3">
              {notForWho.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <FlipCard item={item} positive={false} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
