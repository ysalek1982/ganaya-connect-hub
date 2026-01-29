import { motion } from 'framer-motion';

// Casino SVG elements - chips, cards, dice
export const CasinoChip = ({ className = '', delay = 0 }: { className?: string; delay?: number }) => (
  <motion.svg
    initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
    animate={{ opacity: 0.6, rotate: 0, scale: 1 }}
    transition={{ duration: 1, delay, ease: 'easeOut' }}
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" fill="none" />
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="25" fill="currentColor" fillOpacity="0.1" />
    {/* Notches around the edge */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <rect
        key={i}
        x="47"
        y="2"
        width="6"
        height="8"
        rx="2"
        fill="currentColor"
        fillOpacity="0.8"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
  </motion.svg>
);

export const PlayingCard = ({ className = '', delay = 0, suit = '♠' }: { className?: string; delay?: number; suit?: string }) => (
  <motion.div
    initial={{ opacity: 0, rotateY: 90, y: 20 }}
    animate={{ opacity: 0.5, rotateY: 0, y: 0 }}
    transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    className={`${className} relative`}
  >
    <svg viewBox="0 0 60 84" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="2" y="2" width="56" height="80" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <text x="8" y="20" fill="currentColor" fontSize="14" fontWeight="bold">A</text>
      <text x="30" y="48" fill="currentColor" fontSize="20" textAnchor="middle">{suit}</text>
    </svg>
  </motion.div>
);

export const Dice = ({ className = '', delay = 0 }: { className?: string; delay?: number }) => (
  <motion.svg
    initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
    animate={{ opacity: 0.5, rotate: 15, scale: 1 }}
    transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    className={className}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="4" width="42" height="42" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="15" cy="15" r="3" fill="currentColor" />
    <circle cx="35" cy="15" r="3" fill="currentColor" />
    <circle cx="25" cy="25" r="3" fill="currentColor" />
    <circle cx="15" cy="35" r="3" fill="currentColor" />
    <circle cx="35" cy="35" r="3" fill="currentColor" />
  </motion.svg>
);

export const RouletteWheel = ({ className = '', delay = 0 }: { className?: string; delay?: number }) => (
  <motion.svg
    initial={{ opacity: 0, rotate: 0 }}
    animate={{ opacity: 0.4, rotate: 360 }}
    transition={{ 
      opacity: { duration: 0.5, delay },
      rotate: { duration: 30, repeat: Infinity, ease: 'linear' }
    }}
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="50" cy="50" r="5" fill="currentColor" fillOpacity="0.5" />
    {/* Wheel segments */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2={50 + 45 * Math.cos((angle * Math.PI) / 180)}
        y2={50 + 45 * Math.sin((angle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
    ))}
  </motion.svg>
);

// Animated sparkle/glimmer effect
export const Sparkle = ({ className = '', delay = 0, style }: { className?: string; delay?: number; style?: React.CSSProperties }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{ 
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 1.5,
    }}
    className={className}
    style={style}
  >
    <svg viewBox="0 0 20 20" className="w-full h-full" fill="currentColor">
      <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z" />
    </svg>
  </motion.div>
);

// Floating casino elements background
export const CasinoBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Chips */}
    <CasinoChip className="absolute top-20 left-[10%] w-20 h-20 text-primary/30" delay={0.2} />
    <CasinoChip className="absolute top-40 right-[15%] w-16 h-16 text-gold/30" delay={0.5} />
    <CasinoChip className="absolute bottom-32 left-[20%] w-12 h-12 text-primary/20" delay={0.8} />
    
    {/* Cards */}
    <PlayingCard className="absolute top-32 right-[8%] w-12 text-foreground/20 rotate-12" delay={0.3} suit="♠" />
    <PlayingCard className="absolute bottom-40 right-[25%] w-10 text-gold/30 -rotate-12" delay={0.6} suit="♥" />
    <PlayingCard className="absolute top-1/2 left-[5%] w-10 text-foreground/15 rotate-6" delay={0.9} suit="♦" />
    
    {/* Dice */}
    <Dice className="absolute bottom-24 left-[30%] w-12 h-12 text-primary/25" delay={0.4} />
    <Dice className="absolute top-24 left-[40%] w-10 h-10 text-gold/20" delay={0.7} />
    
    {/* Roulette */}
    <RouletteWheel className="absolute -bottom-20 -right-20 w-60 h-60 text-primary/10" delay={0} />
    
    {/* Sparkles */}
    {[...Array(8)].map((_, i) => (
      <Sparkle 
        key={i}
        className={`absolute w-3 h-3 text-gold/60`}
        delay={i * 0.4}
        style={{
          top: `${15 + Math.random() * 70}%`,
          left: `${10 + Math.random() * 80}%`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

export default CasinoBackground;
