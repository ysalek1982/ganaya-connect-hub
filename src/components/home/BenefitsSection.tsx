import { motion } from 'framer-motion';
import { Trophy, Sparkles, Video, Timer, CheckCircle2, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { StadiumLights } from './StadiumLights';
import { useCMSSections } from '@/hooks/useCMSPromos';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: Trophy,
    title: 'Todo en un solo lugar',
    description: 'Deportes + Casino + En Vivo. Sin cambiar de plataforma.',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary/30 hover:border-primary/60',
    glowColor: 'hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]',
  },
  {
    icon: Sparkles,
    title: 'Variedad sin aburrimiento',
    description: 'Slots, TV Games y juegos rápidos para todos los gustos.',
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    borderColor: 'border-gold/30 hover:border-gold/60',
    glowColor: 'hover:shadow-[0_0_40px_-10px_hsl(var(--gold)/0.5)]',
  },
  {
    icon: Video,
    title: 'Experiencia casino real',
    description: 'Live Casino con dealers reales las 24 horas.',
    color: 'text-accent',
    bgColor: 'bg-accent/20',
    borderColor: 'border-accent/30 hover:border-accent/60',
    glowColor: 'hover:shadow-[0_0_40px_-10px_hsl(var(--accent)/0.5)]',
  },
  {
    icon: Timer,
    title: 'Apuesta a tu ritmo',
    description: 'Desde sesiones rápidas de 1 minuto hasta juegos en vivo.',
    color: 'text-[#25D366]',
    bgColor: 'bg-[#25D366]/20',
    borderColor: 'border-[#25D366]/30 hover:border-[#25D366]/60',
    glowColor: 'hover:shadow-[0_0_40px_-10px_rgba(37,211,102,0.5)]',
  },
];

export const BenefitsSection = () => {
  const { data: sections } = useCMSSections();

  const section = sections?.find(s => s.key === 'benefits');
  if (section && !section.enabled) return null;

  return (
    <section id="por-que" className="py-20 md:py-28 bg-card/50 relative overflow-hidden">
      <StadiumLights />
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">VENTAJAS EXCLUSIVAS</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {section?.title || 'Por Qué'} <span className="text-gradient-primary">Jugar con Nosotros</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section?.subtitle || 'Ventajas que solo encontrarás aquí'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            
            return (
              <ScrollReveal key={i} delay={i * 100}>
                <motion.div
                  className={`relative p-6 md:p-8 rounded-3xl text-center group cursor-pointer h-full border transition-all duration-500 ${benefit.borderColor} ${benefit.glowColor} bg-card/50 backdrop-blur-sm`}
                  whileHover={{ scale: 1.03, y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Number badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-muted-foreground font-mono">
                    0{i + 1}
                  </div>
                  
                  {/* Icon */}
                  <motion.div 
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${benefit.bgColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                    whileHover={{ rotate: 12 }}
                  >
                    <Icon className={`w-10 h-10 ${benefit.color}`} />
                  </motion.div>
                  
                  <h3 className="font-display font-bold text-xl mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                  
                  {/* Arrow on hover */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className={`w-5 h-5 mx-auto ${benefit.color}`} />
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA Section */}
        <ScrollReveal delay={400}>
          <div className="mt-16 text-center">
            <motion.div
              className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card/80 border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="text-left">
                <h3 className="font-display font-bold text-lg mb-1">¿Listo para empezar?</h3>
                <p className="text-muted-foreground text-sm">Únete a miles de jugadores ganando</p>
              </div>
              <Button variant="hero" size="lg" onClick={() => window.open('https://wa.me/59176356972?text=Quiero empezar a jugar', '_blank')}>
                Empezar Ahora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
