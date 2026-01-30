import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { useLandingContent, extractYouTubeId } from '@/hooks/useLandingContent';

export const VideoSection = () => {
  const { data: content } = useLandingContent();
  
  const youtubeId = extractYouTubeId(content?.vslYoutubeUrl || '');
  
  // If no video URL configured, don't render the section
  if (!youtubeId || content?.sectionsEnabled?.video === false) {
    return null;
  }

  const videoPoints = [
    'Cómo funciona el modelo de negocio',
    'Qué necesitás para empezar',
    'Cómo se calculan tus comisiones',
    'Por qué otros ya están ganando',
  ];

  return (
    <section id="video" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Video embed */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/30">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                  title="Cómo ser agente Ganaya.bet"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              
              {/* Decorative glow */}
              <div className="absolute -inset-3 bg-gradient-to-r from-primary/15 via-gold/10 to-primary/15 rounded-3xl -z-10 blur-2xl opacity-60" />
            </motion.div>

            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">90 segundos</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {content?.vslTitle || 'Mira esto antes de'} <span className="text-gradient-primary">postular</span>
              </h2>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {content?.vslSubtitle || 'En menos de 2 minutos vas a entender todo lo que necesitás saber:'}
              </p>
              
              <ul className="space-y-4 pt-2">
                {videoPoints.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground/90">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
