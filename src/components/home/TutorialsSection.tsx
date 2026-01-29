import { motion } from 'framer-motion';
import { BookOpen, Play, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PublicTutorial } from '@/lib/firebase-types';

interface TutorialsSectionProps {
  tutorials: PublicTutorial[];
  agentName?: string;
  isGlobal?: boolean;
}

export const TutorialsSection = ({ tutorials, agentName, isGlobal = false }: TutorialsSectionProps) => {
  if (tutorials.length === 0) return null;

  return (
    <section className="py-16 relative" id="tutoriales">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {isGlobal ? 'Cómo funciona' : `Guías de ${agentName || 'tu cajero'}`}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isGlobal 
              ? 'Aprende a recargar, apostar y retirar en minutos'
              : 'Tu cajero preparó estas guías para ti'}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {tutorials.slice(0, 6).map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card h-full hover:border-primary/30 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0 group-hover:bg-primary/20 transition-colors">
                      {tutorial.videoUrl ? (
                        <Play className="w-5 h-5 text-primary" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold mb-2 line-clamp-2">{tutorial.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {tutorial.summary}
                      </p>
                    </div>
                  </div>

                  {tutorial.videoUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 gap-2"
                      asChild
                    >
                      <a 
                        href={tutorial.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Play className="w-4 h-4" />
                        Ver video
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TutorialsSection;
