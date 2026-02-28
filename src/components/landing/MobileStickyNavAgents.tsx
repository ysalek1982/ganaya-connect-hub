import { useState, useEffect } from 'react';
import { MessageCircle, ArrowRight, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLandingContent } from '@/hooks/useLandingContent';

interface MobileStickyNavAgentsProps {
  onOpenChat: () => void;
}

export const MobileStickyNavAgents = ({ onOpenChat }: MobileStickyNavAgentsProps) => {
  const { data: content } = useLandingContent();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();
  
  const ctaText = content?.ctaPrimaryText || 'Postularme ahora';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > 400);
    setShowScrollTop(latest > 1500);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 p-4 pb-5 bg-gradient-to-t from-background via-background/98 to-transparent md:hidden z-30 safe-area-bottom"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="flex items-center gap-2">
            {/* Scroll to top mini button */}
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={scrollToTop}
                  className="w-13 h-13 shrink-0 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground"
                >
                  <ChevronUp className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div className="flex-1 relative">
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                  boxShadow: [
                    '0 0 0 0 hsl(var(--primary) / 0)',
                    '0 0 0 6px hsl(var(--primary) / 0.2)',
                    '0 0 0 0 hsl(var(--primary) / 0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              />
              <Button
                variant="hero"
                size="lg"
                className="w-full h-13 rounded-xl shadow-xl shadow-primary/25 relative overflow-hidden"
                onClick={onOpenChat}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-bold">{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
                {/* Shimmer */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
                />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
