import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';

// Video ID can be configured - for now using a placeholder
const VIDEO_ID = 'dQw4w9WgXcQ'; // Replace with actual video ID

export const VideoSection = () => {
  return (
    <section id="video" className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Video embed */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10"
            >
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
                title="Cómo ser agente Ganaya.bet"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
              
              {/* Decorative glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-gold/20 to-primary/20 rounded-2xl -z-10 blur-xl opacity-50" />
            </motion.div>

            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">90 segundos</span>
              </div>
              
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold">
                Mira esto antes de <span className="text-gradient-primary">postular</span>
              </h2>
              
              <p className="text-muted-foreground text-lg">
                En menos de 2 minutos vas a entender:
              </p>
              
              <ul className="space-y-3">
                {[
                  'Cómo funciona el modelo de negocio',
                  'Qué necesitás para empezar',
                  'Cómo se calculan tus comisiones',
                  'Por qué otros ya están ganando',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Play className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
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
