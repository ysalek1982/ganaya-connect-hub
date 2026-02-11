import { motion } from 'framer-motion';
import { Smartphone, Wallet, Users, TrendingUp, Headphones } from 'lucide-react';

const steps = [
  { icon: Smartphone, title: 'Recibís una solicitud', description: 'Tus contactos te escriben por WhatsApp', color: 'primary' as const },
  { icon: Wallet, title: 'Procesás el pago', description: 'Transferencia local o método preferido', color: 'gold' as const },
  { icon: TrendingUp, title: 'Acreditás al instante', description: 'El saldo se refleja inmediatamente', color: 'primary' as const },
  { icon: Users, title: 'Crecés tu red', description: 'Más contactos = más ingresos', color: 'gold' as const },
  { icon: Headphones, title: 'Soporte continuo', description: 'Te acompañamos en cada paso', color: 'primary' as const },
];

export const FlowSection = () => {
  return (
    <section id="flujo" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Tu <span className="text-gradient-primary">día a día</span> como agente
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Operación simple y 100% desde tu celular
          </p>
        </motion.div>

        {/* Desktop timeline */}
        <div className="hidden md:block relative max-w-4xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-gold/50 to-primary/50 transform -translate-y-1/2" />
          
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const isPrimary = step.color === 'primary';
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center mb-5 z-10 transition-all duration-300 group-hover:scale-110 ${
                      isPrimary ? 'border-primary bg-background shadow-lg shadow-primary/10' : 'border-gold bg-background shadow-lg shadow-gold/10'
                    }`}
                  >
                    <step.icon className={`w-7 h-7 ${isPrimary ? 'text-primary' : 'text-gold'}`} />
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {steps.map((step, index) => {
            const isPrimary = step.color === 'primary';
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-card/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 border border-border/50"
              >
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                  isPrimary ? 'bg-primary/10' : 'bg-gold/10'
                }`}>
                  <step.icon className={`w-6 h-6 ${isPrimary ? 'text-primary' : 'text-gold'}`} />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium">Paso {index + 1}</span>
                  <h3 className="font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-sm text-primary font-medium"
        >
          💼 Tu éxito depende de tu dedicación y el tamaño de tu red
        </motion.p>
      </div>
    </section>
  );
};
