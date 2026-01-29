import { motion } from 'framer-motion';
import { MessageSquare, Banknote, Zap, Gamepad2, Calendar } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: 'Cliente solicita recarga',
    description: 'Por WhatsApp, llamada o mensaje',
    color: 'primary',
  },
  {
    icon: Banknote,
    title: 'Agente recibe fondos',
    description: 'Transferencia local / efectivo',
    color: 'gold',
  },
  {
    icon: Zap,
    title: 'Acreditación inmediata',
    description: 'El saldo aparece al instante',
    color: 'primary',
  },
  {
    icon: Gamepad2,
    title: 'Cliente juega',
    description: 'Deportes + Casino',
    color: 'accent',
  },
  {
    icon: Calendar,
    title: 'Comisión mensual',
    description: 'Pago el 1er día del mes',
    color: 'gold',
  },
];

export const FlowSection = () => {
  return (
    <section id="como-funciona" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Flujo operativo</span> simple
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Así funciona tu día a día como agente
          </p>
        </motion.div>

        {/* Timeline for desktop */}
        <div className="hidden md:block relative max-w-4xl mx-auto">
          {/* Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-gold to-accent transform -translate-y-1/2" />
          
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className={`w-14 h-14 rounded-full bg-${step.color}/20 border-2 border-${step.color} flex items-center justify-center mb-4 z-10 bg-background`}
                  style={{
                    borderColor: step.color === 'primary' ? 'hsl(var(--primary))' : step.color === 'gold' ? 'hsl(var(--gold))' : 'hsl(var(--accent))',
                    backgroundColor: 'hsl(var(--background))',
                  }}
                >
                  <step.icon className="w-6 h-6" style={{
                    color: step.color === 'primary' ? 'hsl(var(--primary))' : step.color === 'gold' ? 'hsl(var(--gold))' : 'hsl(var(--accent))',
                  }} />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cards for mobile */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: step.color === 'primary' ? 'hsl(var(--primary) / 0.1)' : step.color === 'gold' ? 'hsl(var(--gold) / 0.1)' : 'hsl(var(--accent) / 0.1)',
                }}
              >
                <step.icon className="w-6 h-6" style={{
                  color: step.color === 'primary' ? 'hsl(var(--primary))' : step.color === 'gold' ? 'hsl(var(--gold))' : 'hsl(var(--accent))',
                }} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Paso {index + 1}</span>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-sm text-primary font-medium"
        >
          💰 Tu ganancia viene del positivo generado por tus clientes
        </motion.p>
      </div>
    </section>
  );
};
