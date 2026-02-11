import { motion } from 'framer-motion';
import { Check, X, UserCheck, UserX } from 'lucide-react';

const forWho = [
  'Personas con disciplina y constancia',
  'Buen trato y comunicación con personas',
  'Ganas de crecer y construir su propia red',
  'Disponibilidad de algunas horas diarias',
  'Mentalidad emprendedora',
];

const notForWho = [
  'Busca dinero rápido sin esfuerzo',
  'No tiene tiempo para responder mensajes',
  'No quiere invertir tiempo en capacitarse',
  'Espera resultados sin gestión activa',
];

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
            El programa funciona mejor para ciertos perfiles
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* For who - positive */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="relative bg-primary/5 backdrop-blur-sm rounded-2xl p-7 lg:p-8 border border-primary/20 hover:border-primary/40 transition-all duration-500"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
            
            <h3 className="font-display text-xl font-bold text-foreground mb-7 flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </span>
              Sí es para vos si...
            </h3>
            <ul className="space-y-4">
              {forWho.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground/90 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Not for who - negative */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="relative bg-destructive/5 backdrop-blur-sm rounded-2xl p-7 lg:p-8 border border-destructive/20 hover:border-destructive/40 transition-all duration-500"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-destructive/60 via-destructive to-destructive/60" />
            
            <h3 className="font-display text-xl font-bold text-foreground mb-7 flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-destructive/20 flex items-center justify-center">
                <UserX className="w-5 h-5 text-destructive" />
              </span>
              No es para vos si...
            </h3>
            <ul className="space-y-4">
              {notForWho.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-destructive" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
