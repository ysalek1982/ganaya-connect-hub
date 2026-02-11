import { motion } from 'framer-motion';

interface SectionDividerProps {
  variant?: 'primary' | 'gold' | 'subtle';
}

export const SectionDivider = ({ variant = 'subtle' }: SectionDividerProps) => {
  const colorMap = {
    primary: 'from-transparent via-primary/30 to-transparent',
    gold: 'from-transparent via-gold/30 to-transparent',
    subtle: 'from-transparent via-border/50 to-transparent',
  };

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="max-w-lg mx-auto px-4"
    >
      <div className={`h-px bg-gradient-to-r ${colorMap[variant]}`} />
    </motion.div>
  );
};
