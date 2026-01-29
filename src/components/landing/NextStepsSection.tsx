import { motion } from 'framer-motion';
import { DollarSign, Wallet, ClipboardCheck, GraduationCap } from 'lucide-react';

const steps = [
  {
    icon: DollarSign,
    title: 'Capital',
    description: 'Validá tu banca operativa de $300 USD',
  },
  {
    icon: Wallet,
    title: 'Cuenta operativa',
    description: 'Binance verificada + métodos locales',
  },
  {
    icon: ClipboardCheck,
    title: 'Registro',
    description: 'Completá el formulario de alta',
  },
  {
    icon: GraduationCap,
    title: 'Onboarding',
    description: 'Capacitación 15 min y comenzás',
  },
];

export const NextStepsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Próximos <span className="text-gradient-gold">pasos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            En 4 simples pasos podés comenzar a operar
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-5 text-center relative group hover:border-gold/30 transition-all duration-300"
              >
                {/* Number badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gold flex items-center justify-center font-display font-bold text-background text-sm">
                  {index + 1}
                </div>
                
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors mt-2">
                  <step.icon className="w-6 h-6 text-gold" />
                </div>
                
                <h3 className="font-display text-base font-semibold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
