import { motion, useMotionValue } from 'framer-motion';
import { Star, Quote, MapPin, DollarSign, BadgeCheck } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState, useRef } from 'react';

const testimonials = [
  {
    name: 'Carlos M.',
    country: 'Paraguay',
    flag: '🇵🇾',
    role: 'Agente desde 2024',
    quote: 'En 3 meses armé mi cartera de jugadores y hoy genero ingresos constantes desde mi celular. El soporte del equipo fue clave.',
    highlight: 'Ingresos constantes en 3 meses',
    earnings: '$280/mes',
  },
  {
    name: 'Valentina R.',
    country: 'Colombia',
    flag: '🇨🇴',
    role: 'Line Leader',
    quote: 'Empecé como agente y hoy lidero un equipo de 8 sub-agentes. Los bonos en cascada hacen una diferencia enorme.',
    highlight: '8 sub-agentes en su red',
    earnings: '$520/mes',
  },
  {
    name: 'Diego L.',
    country: 'Argentina',
    flag: '🇦🇷',
    role: 'Agente desde 2024',
    quote: 'Lo mejor es la flexibilidad. Manejo todo desde WhatsApp, sin horarios fijos. El panel de gestión es muy intuitivo.',
    highlight: '100% desde WhatsApp',
    earnings: '$190/mes',
  },
  {
    name: 'Sofía G.',
    country: 'Ecuador',
    flag: '🇪🇨',
    role: 'Agente desde 2024',
    quote: 'Nunca pensé que podía generar ingresos así desde mi casa. El equipo me capacitó y hoy mi red sigue creciendo.',
    highlight: 'Crecimiento desde casa',
    earnings: '$340/mes',
  },
  {
    name: 'Marco T.',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    role: 'Agente desde 2025',
    quote: 'Las herramientas que te dan hacen todo más fácil. El dashboard es claro y siempre sé cuánto llevo ganado.',
    highlight: 'Herramientas intuitivas',
    earnings: '$150/mes',
  },
];

const TiltCard = ({ t, index }: { t: typeof testimonials[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareOpacity = useMotionValue(0);

  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(x * 15);
    rotateX.set(-y * 15);
    glareOpacity.set(0.15);
  }, [rotateX, rotateY, glareOpacity]);

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  }, [rotateX, rotateY, glareOpacity]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_33%] min-w-0 px-2.5"
    >
      <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-gold/30 transition-colors duration-500 h-full">
        {/* Glare overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            opacity: glareOpacity,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
          }}
        />
        {/* Top accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
          <Quote className="w-5 h-5 text-gold" />
        </div>

        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-gold text-gold" />
          ))}
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed mb-5 italic">
          "{t.quote}"
        </p>

        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            ✨ {t.highlight}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gold/15 border border-gold/25 text-xs font-black text-gold">
            <DollarSign className="w-3 h-3" />
            {t.earnings}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
            {t.flag}
          </div>
          <div>
            <p className="text-sm font-semibold flex items-center gap-1">
              {t.name}
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {t.country} · {t.role}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TestimonialsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Autoplay
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);

    // Pause on hover
    const root = emblaApi.rootNode();
    const pause = () => clearInterval(interval);
    root.addEventListener('mouseenter', pause);

    return () => {
      clearInterval(interval);
      root.removeEventListener('mouseenter', pause);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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

        {/* Carousel */}
        <div className="overflow-hidden max-w-5xl mx-auto" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((t, index) => (
              <TiltCard key={t.name} t={t} index={index} />
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex ? 'bg-gold w-6' : 'bg-border/50'
              }`}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-xs text-muted-foreground/60"
        >
          * Testimonios representativos. Resultados individuales pueden variar según dedicación y gestión.
        </motion.p>
      </div>
    </section>
  );
};
