import { motion } from 'framer-motion';
import { Star, Quote, MessageCircle } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const testimonials = [
  {
    name: 'Carlos M.',
    country: '🇵🇾 Paraguay',
    avatar: 'CM',
    rating: 5,
    text: 'Excelente atención por WhatsApp, me ayudaron a hacer mi primer depósito en minutos. Muy confiable.',
    highlight: 'Atención increíble',
  },
  {
    name: 'Laura G.',
    country: '🇦🇷 Argentina',
    avatar: 'LG',
    rating: 5,
    text: 'Llevo 3 meses jugando y los retiros siempre llegan rápido. El cashback semanal es lo mejor.',
    highlight: 'Retiros rápidos',
  },
  {
    name: 'Miguel S.',
    country: '🇨🇴 Colombia',
    avatar: 'MS',
    rating: 5,
    text: 'Me gusta poder depositar con USDT. Es más seguro y rápido que otros métodos.',
    highlight: 'USDT sin problemas',
  },
  {
    name: 'Andrea P.',
    country: '🇪🇨 Ecuador',
    avatar: 'AP',
    rating: 5,
    text: 'El agente me explicó todo paso a paso. Nunca me sentí perdida. 100% recomendado.',
    highlight: 'Soporte humano',
  },
];

const avatarColors = [
  'bg-gradient-to-br from-primary to-primary/60',
  'bg-gradient-to-br from-gold to-gold/60',
  'bg-gradient-to-br from-accent to-accent/60',
  'bg-gradient-to-br from-[#25D366] to-[#25D366]/60',
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-background via-card/20 to-background">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6"
            >
              <MessageCircle className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">LO QUE DICEN NUESTROS JUGADORES</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Historias <span className="text-gradient-gold">Reales</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Miles de jugadores confían en nosotros cada día
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <motion.div
                className="relative p-6 rounded-3xl bg-card/60 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-500 group h-full"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 group-hover:text-primary/20 transition-colors" />

                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full ${avatarColors[i]} flex items-center justify-center text-sm font-bold text-background`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.country}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                {/* Highlight tag */}
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-3">
                  {testimonial.highlight}
                </div>

                {/* Text */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-primary/20 blur-[30px]" />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats row */}
        <ScrollReveal delay={400}>
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {[
              { value: '5,000+', label: 'Jugadores activos' },
              { value: '98%', label: 'Recomendarían' },
              { value: '24/7', label: 'Soporte disponible' },
              { value: '<5min', label: 'Tiempo de retiro' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};
