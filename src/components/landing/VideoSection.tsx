import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { useLandingContent, extractYouTubeId } from '@/hooks/useLandingContent';

export const VideoSection = () => {
  const { data: content } = useLandingContent();
  const [playing, setPlaying] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  const youtubeUrl = content?.vslYoutubeUrl || content?.vsl?.vslYoutubeUrl || '';
  const youtubeId = extractYouTubeId(youtubeUrl);
  const isEnabled = content?.sectionsEnabled?.video !== false;
  
  if (!youtubeId || !isEnabled) return null;

  const vslTitle = content?.vslTitle || content?.vsl?.vslTitle || 'Mira esto antes de postular';
  const vslSubtitle = content?.vslSubtitle || content?.vsl?.vslSubtitle || 'En menos de 2 minutos vas a entender todo lo que necesitás saber:';
  const vslLayout = content?.vsl?.vslLayout || 'split';

  const videoPoints = [
    'Cómo funciona el modelo de negocio',
    'Qué necesitás para empezar',
    'Cómo se calculan tus comisiones',
    'Por qué otros ya están ganando',
  ];

  const VideoEmbed = () => (
    <motion.div className="relative group cursor-pointer" onClick={() => setPlaying(true)}>
      <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/30">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`}
            title="Cómo ser agente"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <motion.div
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ['0 0 0px hsl(160 84% 45% / 0.3)', '0 0 30px hsl(160 84% 45% / 0.5)', '0 0 0px hsl(160 84% 45% / 0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-0.5 sm:ml-1" fill="currentColor" />
              </motion.div>
            </div>
          </>
        )}
      </div>
      <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-primary/15 via-gold/10 to-primary/15 rounded-2xl sm:rounded-3xl -z-10 blur-2xl opacity-60" />
    </motion.div>
  );

  if (vslLayout === 'center') {
    return (
      <section id="video" ref={sectionRef} className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" style={{ y: bgY }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">90 segundos</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {vslTitle.includes('postular') ? (<>{vslTitle.split('postular')[0]}<span className="text-gradient-primary">postular</span></>) : vslTitle}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">{vslSubtitle}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}>
              <VideoEmbed />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="video" ref={sectionRef} className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      <motion.div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" style={{ y: bgY }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative order-2 lg:order-1">
              <VideoEmbed />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">90 segundos</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {vslTitle.includes('postular') ? (<>{vslTitle.split('postular')[0]}<span className="text-gradient-primary">postular</span></>) : vslTitle}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed">{vslSubtitle}</p>
              <ul className="space-y-3 sm:space-y-4 pt-2">
                {videoPoints.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2.5 sm:gap-3"
                  >
                    <motion.div
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0"
                      whileInView={{ scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </motion.div>
                    <span className="text-foreground/90 text-sm sm:text-base">{item}</span>
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
