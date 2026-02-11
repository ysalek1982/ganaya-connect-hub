import { motion } from 'framer-motion';
import { Smartphone, Clock, TrendingUp, Users, Shield, MessageCircle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingContent } from '@/hooks/useLandingContent';

interface BenefitsSectionProps {
  onOpenChat?: () => void;
}

const benefits = [
  { icon: TrendingUp, title: 'Hasta 40% comisión', description: 'Comisiones escalables según tu volumen mensual de operaciones.', color: 'primary' as const },
  { icon: Users, title: 'Bonos por red: 7% y 5%', description: 'Generá ingresos pasivos por cada sub-agente que reclutes.', color: 'gold' as const },
  { icon: Smartphone, title: '100% desde el celular', description: 'Operá desde cualquier lugar, sin necesidad de una oficina.', color: 'primary' as const },
  { icon: Clock, title: 'Sin horario fijo', description: 'Vos elegís cuándo trabajar. Tu tiempo, tus reglas.', color: 'gold' as const },
  { icon: Shield, title: 'Soporte continuo', description: 'Capacitación inicial y acompañamiento permanente.', color: 'primary' as const },
  { icon: Zap, title: 'Herramientas listas', description: 'Panel de gestión, links de referido y materiales de apoyo.', color: 'gold' as const },
];

export const BenefitsSection = ({ onOpenChat }: BenefitsSectionProps) => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.benefits === false) return null;
  const ctaText = content?.ctaPrimaryText || 'Postularme ahora';
  const disclaimerShort = content?.socialProof?.disclaimerShort || '* Resultados dependen de tu gestión y actividad. Sin ingresos garantizados.';

  return (
    <section id="beneficios" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
      {/* Decorative orbs */}
      <div className="absolute top-20 -right-32 w-64 h-64 bg-primary/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-20 -left-32 w-64 h-64 bg-gold/[0.04] rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            ¿Por qué unirte?
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Beneficios del <span className="text-gradient-primary">programa</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Todo lo que necesitás para comenzar a generar ingresos
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto mb-14">
          {benefits.map((benefit, index) => {
            const isPrimary = benefit.color === 'primary';
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
                className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-primary/30 transition-all duration-500 group hover:-translate-y-1"
              >
                {/* Subtle top accent */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${isPrimary ? 'via-primary/30' : 'via-gold/30'} to-transparent`} />
                
                <div className={`w-14 h-14 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  isPrimary ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-gold/10 group-hover:bg-gold/20'
                }`}>
                  <benefit.icon className={`w-7 h-7 ${isPrimary ? 'text-primary' : 'text-gold'}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>

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
