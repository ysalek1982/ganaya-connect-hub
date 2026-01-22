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
    <div className="relative h-16 md:h-20 overflow-hidden">
      {/* Main gradient line */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${color}22 15%, 
            ${color}66 50%, 
            ${color}22 85%, 
            transparent 100%
          )`,
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
      />
      
      {/* Center glow - more subtle */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-[40px]"
        style={{ backgroundColor: `${color}15` }}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      />
      
      {/* Diamond shape in center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}, 0 0 24px ${color}40`,
        }}
        initial={{ scale: 0, rotate: 0 }}
        whileInView={{ scale: 1, rotate: 45 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        viewport={{ once: true }}
      />
    </div>
  );
};
