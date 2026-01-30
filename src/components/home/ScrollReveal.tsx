import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const getInitialPosition = (direction: string) => {
  switch (direction) {
    case 'up': return { y: 40, x: 0 };
    case 'down': return { y: -40, x: 0 };
    case 'left': return { y: 0, x: 40 };
    case 'right': return { y: 0, x: -40 };
    default: return { y: 40, x: 0 };
  }
};

export const ScrollReveal = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = ''
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });
  const initialPos = getInitialPosition(direction);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...initialPos }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initialPos }}
      transition={{ 
        duration: 0.6, 
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
