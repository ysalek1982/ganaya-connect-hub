import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

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
    <section id="para-quien" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--surface-1))] to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-4">
            Antes de postular
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            ¿Es para <span className="text-gradient-gold">vos</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            El programa funciona mejor para ciertos perfiles
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* For who - positive */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-primary/20"
          >
            <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
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
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Not for who - negative */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-destructive/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-destructive/20"
          >
            <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
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
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <X className="w-5 h-5 text-destructive/70 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
