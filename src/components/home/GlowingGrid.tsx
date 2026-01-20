import { motion } from 'framer-motion';

export const GlowingGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {/* Horizontal lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(to right, hsl(156 100% 50% / 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(156 100% 50% / 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />
      
      {/* Animated glow lines */}
      <motion.div
        className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        style={{ top: '25%' }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        style={{ top: '50%' }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      
      <motion.div
        className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        style={{ top: '75%' }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      
      {/* Vertical accent lines */}
      <motion.div
        className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
        style={{ left: '20%' }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
        style={{ left: '80%' }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
      />
    </div>
  );
};
