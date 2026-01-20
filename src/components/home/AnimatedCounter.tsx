import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  delay?: number;
}

export const AnimatedCounter = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  label,
  delay = 0
}: AnimatedCounterProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const count = useAnimatedCounter({
    end: value,
    duration: 2000,
    delay,
    isVisible,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center"
    >
      <div className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-primary mb-2">
        <span className="counter-animate">{prefix}{count.toLocaleString()}{suffix}</span>
      </div>
      <p className="text-muted-foreground text-sm md:text-base">{label}</p>
    </motion.div>
  );
};
