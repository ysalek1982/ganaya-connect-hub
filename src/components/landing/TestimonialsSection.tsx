import { motion } from 'framer-motion';
import { Star, Quote, MapPin } from 'lucide-react';

const testimonials = [
  {
    name: 'Carlos M.',
    country: 'Paraguay',
    flag: '🇵🇾',
    role: 'Agente desde 2024',
    quote: 'En 3 meses armé mi cartera de jugadores y hoy genero ingresos constantes desde mi celular. El soporte del equipo fue clave.',
    highlight: 'Ingresos constantes en 3 meses',
  },
  {
    name: 'Valentina R.',
    country: 'Colombia',
    flag: '🇨🇴',
    role: 'Line Leader',
    quote: 'Empecé como agente y hoy lidero un equipo de 8 sub-agentes. Los bonos en cascada hacen una diferencia enorme.',
    highlight: '8 sub-agentes en su red',
  },
  {
    name: 'Diego L.',
    country: 'Argentina',
    flag: '🇦🇷',
    role: 'Agente desde 2024',
    quote: 'Lo mejor es la flexibilidad. Manejo todo desde WhatsApp, sin horarios fijos. El panel de gestión es muy intuitivo.',
    highlight: '100% desde WhatsApp',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.03] to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gold/[0.04] rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6 uppercase tracking-wide">
            <Star className="w-4 h-4" />
            Historias reales
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            Lo que dicen nuestros <span className="text-gradient-primary">agentes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Resultados reales de personas que ya operan con Ganaya.bet
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
              className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-gold/30 transition-all duration-500 group hover:-translate-y-1"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

              {/* Quote icon */}
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                <Quote className="w-5 h-5 text-gold" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-sm text-foreground/90 leading-relaxed mb-5 italic">
                "{t.quote}"
              </p>

              {/* Highlight badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                ✨ {t.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {t.flag}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {t.country} · {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-xs text-muted-foreground/60"
        >
          * Testimonios representativos. Resultados individuales pueden variar según dedicación y gestión.
        </motion.p>
      </div>
    </section>
  );
};
