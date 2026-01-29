import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Video, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGlobalTutorials } from '@/hooks/useTutorials';
import { StadiumLights } from '@/components/home/StadiumLights';

// Extract YouTube ID from URL
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const Tutoriales = () => {
  const { data: tutorials = [], isLoading } = useGlobalTutorials(true);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);

  // Sort by order, then title
  const sortedTutorials = [...tutorials].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle global ambient effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <StadiumLights />
      </div>
      
      <Header />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Tutoriales
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Aprende a recargar, jugar y retirar en minutos con nuestras guías paso a paso
            </p>
          </motion.div>

          {/* Tutorials Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedTutorials.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Próximamente agregaremos tutoriales</p>
              <p className="text-sm">Vuelve pronto para ver nuestras guías</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedTutorials.map((tutorial, index) => {
                const ytId = tutorial.videoUrl ? getYouTubeId(tutorial.videoUrl) : null;
                const thumbnail = ytId 
                  ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
                  : null;
                
                return (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="glass-card h-full overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => ytId && setSelectedVideo({ id: ytId, title: tutorial.title })}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-muted">
                        {thumbnail ? (
                          <>
                            <img 
                              src={thumbnail} 
                              alt={tutorial.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                                <Play className="w-8 h-8 text-primary-foreground ml-1" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h3>
                        {tutorial.summary && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {tutorial.summary}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            {selectedVideo && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tutoriales;
