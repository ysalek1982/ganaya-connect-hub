import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MobileStickyNavAgentsProps {
  onOpenChat: () => void;
}

export const MobileStickyNavAgents = ({ onOpenChat }: MobileStickyNavAgentsProps) => {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 p-3 pb-4 bg-gradient-to-t from-background via-background/98 to-transparent md:hidden z-30 safe-area-bottom"
    >
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <Button
        variant="hero"
        size="lg"
        className="w-full h-12 rounded-xl shadow-lg shadow-primary/30 relative overflow-hidden"
        onClick={onOpenChat}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        <MessageCircle className="w-5 h-5" />
        <span>Postularme ahora</span>
        <Sparkles className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};
