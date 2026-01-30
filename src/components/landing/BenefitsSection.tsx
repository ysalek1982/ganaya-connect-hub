import { motion } from 'framer-motion';
import { Smartphone, Clock, TrendingUp, Users, Shield, MessageCircle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';

interface BenefitsSectionProps {
  onOpenChat?: () => void;
}

const benefits = [
  {
    icon: TrendingUp,
    title: 'Hasta 40% comisión',
    description: 'Comisiones escalables según tu volumen mensual de operaciones.',
    color: 'primary',
  },
  {
    icon: Users,
    title: 'Bonos por red: 7% y 5%',
    description: 'Generá ingresos pasivos por cada sub-agente que reclutes.',
    color: 'gold',
  },
  {
    icon: Smartphone,
    title: '100% desde el celular',
    description: 'Operá desde cualquier lugar, sin necesidad de una oficina.',
    color: 'primary',
  },
  {
    icon: Clock,
    title: 'Sin horario fijo',
    description: 'Vos elegís cuándo trabajar. Tu tiempo, tus reglas.',
    color: 'gold',
  },
  {
    icon: Shield,
    title: 'Soporte continuo',
    description: 'Capacitación inicial y acompañamiento permanente.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Herramientas listas',
    description: 'Panel de gestión, links de referido y materiales de apoyo.',
    color: 'gold',
  },
];

export const BenefitsSection = ({ onOpenChat }: BenefitsSectionProps) => {
  const { data: content } = useLandingContent();
  
  // Check if section is enabled
  if (content?.sectionsEnabled?.benefits === false) {
    return null;
  }
  
  // Get CTA text and disclaimer from CMS
  const ctaText = content?.ctaPrimaryText || 'Postularme ahora';
  const disclaimerShort = content?.socialProof?.disclaimerShort || '* Resultados dependen de tu gestión y actividad. Sin ingresos garantizados.';
  return (
    <section id="beneficios" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            ¿Por qué unirte?
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Beneficios del <span className="text-gradient-primary">programa</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todo lo que necesitás para comenzar a generar ingresos
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300 group"
            >
              <div 
                className={`w-12 h-12 mb-5 rounded-xl flex items-center justify-center transition-colors ${
                  benefit.color === 'primary' 
                    ? 'bg-primary/10 group-hover:bg-primary/20' 
                    : 'bg-gold/10 group-hover:bg-gold/20'
                }`}
              >
                <benefit.icon 
                  className={`w-6 h-6 ${benefit.color === 'primary' ? 'text-primary' : 'text-gold'}`} 
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {onOpenChat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button variant="hero" size="lg" onClick={onOpenChat}>
              <MessageCircle className="w-5 h-5" />
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Disclaimer from CMS */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-sm text-muted-foreground/60"
        >
          {disclaimerShort}
        </motion.p>
      </div>
    </section>
  );
};