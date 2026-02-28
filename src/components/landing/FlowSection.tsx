import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Smartphone, Wallet, Users, TrendingUp, Headphones } from 'lucide-react';

const steps = [
  { icon: Smartphone, title: 'Recibís una solicitud', description: 'Tus contactos te escriben por WhatsApp', color: 'primary' as const },
  { icon: Wallet, title: 'Procesás el pago', description: 'Transferencia local o método preferido', color: 'gold' as const },
  { icon: TrendingUp, title: 'Acreditás al instante', description: 'El saldo se refleja inmediatamente', color: 'primary' as const },
  { icon: Users, title: 'Crecés tu red', description: 'Más contactos = más ingresos', color: 'gold' as const },
  { icon: Headphones, title: 'Soporte continuo', description: 'Te acompañamos en cada paso', color: 'primary' as const },
];

const StepNode = ({ step, index }: { step: typeof steps[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-20% 0px' });
  const isPrimary = step.color === 'primary';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      className="relative flex flex-col items-center text-center group"
    >
      {/* Animated pulse ring */}
      <div className="relative">
        <motion.div
          className={`absolute inset-0 rounded-2xl ${isPrimary ? 'bg-primary/20' : 'bg-gold/20'}`}
          animate={isInView ? { scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={`relative w-16 h-16 rounded-2xl border-2 flex items-center justify-center mb-5 z-10 transition-all duration-500 ${
            isPrimary ? 'border-primary bg-background' : 'border-gold bg-background'
          }`}
          animate={isInView ? { 
            boxShadow: isPrimary 
              ? ['0 0 0px hsl(160 84% 45% / 0)', '0 0 25px hsl(160 84% 45% / 0.4)', '0 0 0px hsl(160 84% 45% / 0)']
              : ['0 0 0px hsl(38 92% 55% / 0)', '0 0 25px hsl(38 92% 55% / 0.4)', '0 0 0px hsl(38 92% 55% / 0)']
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{ scale: 1.15, rotate: 5 }}
        >
          <step.icon className={`w-7 h-7 ${isPrimary ? 'text-primary' : 'text-gold'}`} />
        </motion.div>
      </div>
      <motion.h3
        className="font-bold text-sm text-foreground mb-1"
        animate={isInView ? { color: isPrimary ? 'hsl(160 84% 45%)' : 'hsl(38 92% 55%)' } : {}}
        transition={{ duration: 0.5 }}
      >
        {step.title}
      </motion.h3>
      <p className="text-xs text-muted-foreground">{step.description}</p>
    </motion.div>
  );
};

export const FlowSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.7], ['0%', '100%']);

  return (
    <section id="flujo" ref={sectionRef} className="py-24 relative overflow-hidden">
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
          {/* Background line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/30 transform -translate-y-1/2" />
          {/* Animated progress line */}
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary via-gold to-primary transform -translate-y-1/2"
            style={{ width: lineWidth }}
          />
          
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <StepNode key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {steps.map((step, index) => {
            const isPrimary = step.color === 'primary';
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 120 }}
                whileTap={{ scale: 0.97 }}
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
