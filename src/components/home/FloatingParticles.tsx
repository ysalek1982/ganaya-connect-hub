import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingParticlesProps {
  count?: number;
  color?: string;
}

export const FloatingParticles = ({ count = 30, color = 'primary' }: FloatingParticlesProps) => {
  const isMobile = useIsMobile();

  // On mobile, render nothing — the StadiumLights static glow is enough
  if (isMobile) return null;

  // Limit desktop particles too
  const effectiveCount = Math.min(count, 15);

  const particles = Array.from({ length: effectiveCount }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 10,
  }));

  const colorClass = color === 'primary' 
    ? 'bg-primary/40' 
    : color === 'gold' 
    ? 'bg-gold/40' 
    : 'bg-accent/40';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${colorClass}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: `blur(${particle.size > 4 ? 1 : 0}px)`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Only 3 glowing orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute w-32 h-32 rounded-full ${
            i % 2 === 0 ? 'bg-primary/10' : 'bg-accent/10'
          } blur-[60px]`}
          style={{
            left: `${20 + i * 25}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
