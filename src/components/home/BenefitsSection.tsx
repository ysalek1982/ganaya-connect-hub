import { motion } from 'framer-motion';
import { Trophy, Sparkles, Video, Timer } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { StadiumLights } from './StadiumLights';
import { useCMSSections } from '@/hooks/useCMSPromos';
import { useCMS } from '@/hooks/useCMS';

const defaultBenefits = [
  {
    icon: Trophy,
    title: 'Todo en un solo lugar',
    description: 'Deportes + Casino + En Vivo. Sin cambiar de plataforma.',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  {
    icon: Sparkles,
    title: 'Variedad sin aburrimiento',
    description: 'Slots, TV Games y juegos rápidos para todos los gustos.',
    color: 'text-gold',
    bgColor: 'bg-gold/20',
  },
  {
    icon: Video,
    title: 'Experiencia casino real',
    description: 'Live Casino con dealers reales las 24 horas.',
    color: 'text-accent',
    bgColor: 'bg-accent/20',
  },
  {
    icon: Timer,
    title: 'Apuesta a tu ritmo',
    description: 'Desde sesiones rápidas de 1 minuto hasta juegos en vivo.',
    color: 'text-[#25D366]',
    bgColor: 'bg-[#25D366]/20',
  },
];

export const BenefitsSection = () => {
  const { data: sections } = useCMSSections();
  const { data: cmsContent } = useCMS('home_benefits');

  const section = sections?.find(s => s.key === 'benefits');
  if (section && !section.enabled) return null;

  // Use default benefits - CMS can override titles through cms_content if needed
  const benefits = defaultBenefits;

  return (
    <section id="por-que" className="py-20 md:py-28 bg-card relative overflow-hidden">
      <StadiumLights />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            {section?.title || 'Por Qué'} <span className="text-gradient-primary">Jugar con Nosotros</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {section?.subtitle || 'Ventajas que solo encontrarás aquí'}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = defaultBenefits[i]?.icon || Trophy;
            const color = defaultBenefits[i]?.color || 'text-primary';
            const bgColor = defaultBenefits[i]?.bgColor || 'bg-primary/20';
            
            return (
              <ScrollReveal key={i} delay={i * 100}>
                <motion.div
                  className="glass-card p-6 md:p-8 rounded-2xl text-center group cursor-pointer h-full"
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
