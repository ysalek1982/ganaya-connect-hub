import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const forWho = [
  'Personas con disciplina y constancia',
  'Con facilidad para comunicarse y atender personas',
  'Con ganas de crecer y construir un ingreso propio',
  'Que buscan una oportunidad seria y real',
  'Mayores de 18 años con celular e internet',
];

const notForWho = [
  'Quien busca dinero rápido sin esfuerzo',
  'Quien no responde mensajes ni tiene disponibilidad',
  'Quien no tiene capacidad para operar una banca',
  'Quien no puede comprometerse a mediano plazo',
];

export const ForWhoSection = () => {
  return (
    <section id="para-quien" className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            ¿Es <span className="text-gradient-primary">para vos</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sé honesto/a con vos mismo/a antes de postular
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* For who */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 border-primary/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary">
                Es para vos si...
              </h3>
            </div>
            
            <ul className="space-y-3">
              {forWho.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground/90">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Not for who */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6 border-destructive/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-display text-xl font-semibold text-destructive">
                NO es para vos si...
              </h3>
            </div>
            
            <ul className="space-y-3">
              {notForWho.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                  <span className="text-foreground/90">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-sm text-muted-foreground"
        >
          💡 Si te identificás con la columna verde, este programa es para vos.
        </motion.p>
      </div>
    </section>
  );
};
