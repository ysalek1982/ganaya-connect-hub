import { MessageCircle, ArrowRight } from 'lucide-react';
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
      className="fixed bottom-0 left-0 right-0 p-4 pb-5 bg-gradient-to-t from-background via-background/98 to-transparent md:hidden z-30 safe-area-bottom"
    >
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <Button
        variant="hero"
        size="lg"
        className="w-full h-13 rounded-xl shadow-xl shadow-primary/25"
        onClick={onOpenChat}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-bold">Postularme ahora</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};
