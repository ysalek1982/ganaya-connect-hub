import { motion } from 'framer-motion';
import { TrendingUp, Users, Smartphone, Clock, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface BenefitsSectionProps {
  onOpenChat: () => void;
}

const benefits = [
  {
    icon: TrendingUp,
    title: 'Hasta 40% de comisión',
    description: 'Comisiones escalables según tu desempeño mensual',
    highlight: '40%',
    color: 'primary',
  },
  {
    icon: Users,
    title: 'Bonos por red',
    description: '7% de tus referidos directos + 5% de segunda línea',
    highlight: '7% + 5%',
    color: 'gold',
  },
  {
    icon: Smartphone,
    title: '100% desde tu celular',
    description: 'Operá desde cualquier lugar, sin oficina ni horario',
    highlight: 'Móvil',
    color: 'primary',
  },
  {
    icon: Clock,
    title: 'Sin horario fijo',
    description: 'Vos decidís cuándo y cuánto trabajar',
    highlight: 'Flexible',
    color: 'gold',
  },
  {
    icon: Shield,
    title: 'Soporte continuo',
    description: 'Te acompañamos en cada paso de tu crecimiento',
    highlight: '24/7',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Pagos mensuales',
    description: 'Liquidación el primer día de cada mes',
    highlight: 'Puntual',
    color: 'gold',
  },
];

export const BenefitsSection = ({ onOpenChat }: BenefitsSectionProps) => {
  return (
    <section id="beneficios" className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Beneficios</span> de ser agente
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lo que vas a obtener cuando te sumes al programa
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: benefit.color === 'primary' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--gold) / 0.1)',
                  }}
                >
                  <benefit.icon 
                    className="w-6 h-6" 
                    style={{
                      color: benefit.color === 'primary' ? 'hsl(var(--primary))' : 'hsl(var(--gold))',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-foreground">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto">
            ⚠️ Los resultados dependen de tu gestión, actividad y tamaño de red. 
            No garantizamos ingresos específicos.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Button 
            variant="hero" 
            size="lg" 
            onClick={onOpenChat}
            className="shadow-lg shadow-primary/30"
          >
            <MessageCircle className="w-5 h-5" />
            Quiero ser agente
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
