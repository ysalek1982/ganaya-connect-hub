import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick?: () => void;
  isOpen?: boolean;
}

const FloatingChatButton = ({ onClick, isOpen = false }: FloatingChatButtonProps) => {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label="Abrir chat"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-pulse" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingChatButton;
