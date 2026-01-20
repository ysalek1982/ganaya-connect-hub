import { motion } from 'framer-motion';

interface SectionDividerProps {
  variant?: 'primary' | 'accent' | 'gold';
}

export const SectionDivider = ({ variant = 'primary' }: SectionDividerProps) => {
  const colorMap = {
    primary: 'hsl(156 100% 50%)',
    accent: 'hsl(345 100% 60%)',
    gold: 'hsl(45 100% 50%)',
  };
  
  const color = colorMap[variant];
  
  return (
    <div className="relative h-24 overflow-hidden">
      {/* Main gradient line */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${color}33 20%, 
            ${color} 50%, 
            ${color}33 80%, 
            transparent 100%
          )`,
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      
      {/* Center glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[50px]"
        style={{ backgroundColor: `${color}20` }}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      
      {/* Diamond shape in center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}50`,
        }}
        initial={{ scale: 0, rotate: 0 }}
        whileInView={{ scale: 1, rotate: 45 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
      
      {/* Animated particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 w-1 h-1 rounded-full"
          style={{ 
            backgroundColor: color,
            left: `${15 + i * 14}%`,
          }}
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ 
            opacity: [0, 1, 0],
            y: [-10, 0, 10],
          }}
          transition={{ 
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      ))}
    </div>
  );
};
