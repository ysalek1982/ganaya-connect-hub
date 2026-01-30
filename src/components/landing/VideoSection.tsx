import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { useLandingContent, extractYouTubeId } from '@/hooks/useLandingContent';

export const VideoSection = () => {
  const { data: content } = useLandingContent();
  
  // Get video URL from either old or new CMS structure
  const youtubeUrl = content?.vslYoutubeUrl || content?.vsl?.vslYoutubeUrl || '';
  const youtubeId = extractYouTubeId(youtubeUrl);
  
  // Check if section is enabled
  const isEnabled = content?.sectionsEnabled?.video !== false;
  
  // If no video URL configured or section disabled, don't render
  if (!youtubeId || !isEnabled) {
    return null;
  }

  // Get content from CMS with fallbacks
  const vslTitle = content?.vslTitle || content?.vsl?.vslTitle || 'Mira esto antes de postular';
  const vslSubtitle = content?.vslSubtitle || content?.vsl?.vslSubtitle || 'En menos de 2 minutos vas a entender todo lo que necesitás saber:';
  const vslLayout = content?.vsl?.vslLayout || 'split';

  const videoPoints = [
    'Cómo funciona el modelo de negocio',
    'Qué necesitás para empezar',
    'Cómo se calculan tus comisiones',
    'Por qué otros ya están ganando',
  ];

  // Center layout
  if (vslLayout === 'center') {
    return (
      <section id="video" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">90 segundos</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {vslTitle.includes('postular') ? (
                  <>
                    {vslTitle.split('postular')[0]}
                    <span className="text-gradient-primary">postular</span>
                  </>
                ) : (
                  vslTitle
                )}
              </h2>
              
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                {vslSubtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/30">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                  title="Cómo ser agente"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="absolute -inset-3 bg-gradient-to-r from-primary/15 via-gold/10 to-primary/15 rounded-3xl -z-10 blur-2xl opacity-60" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Split layout (default)
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
                  title="Cómo ser agente"
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
                {vslTitle.includes('postular') ? (
                  <>
                    {vslTitle.split('postular')[0]}
                    <span className="text-gradient-primary">postular</span>
                  </>
                ) : (
                  vslTitle
                )}
              </h2>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {vslSubtitle}
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
