import { motion } from 'framer-motion';
import { useLandingContent } from '@/hooks/useLandingContent';

interface HeroBackgroundProps {
  overlayStrength?: number;
  visualStyle?: 'roulette' | 'chips' | 'cards' | 'lights';
}

// SVG Roulette wheel
const RouletteVisual = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
    <defs>
      <linearGradient id="rouletteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(160 84% 45%)" stopOpacity="0.3" />
        <stop offset="100%" stopColor="hsl(38 92% 55%)" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <circle cx="200" cy="200" r="180" fill="none" stroke="url(#rouletteGrad)" strokeWidth="2" />
    <circle cx="200" cy="200" r="150" fill="none" stroke="url(#rouletteGrad)" strokeWidth="1.5" />
    <circle cx="200" cy="200" r="120" fill="none" stroke="url(#rouletteGrad)" strokeWidth="1" />
    {[...Array(36)].map((_, i) => (
      <line
        key={i}
        x1="200"
        y1="20"
        x2="200"
        y2="80"
        stroke="url(#rouletteGrad)"
        strokeWidth="1"
        transform={`rotate(${i * 10} 200 200)`}
        opacity="0.5"
      />
    ))}
  </svg>
);

// SVG Chips
const ChipsVisual = () => (
  <div className="relative w-full h-full">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${15 + (i % 3) * 30}%`,
          top: `${20 + Math.floor(i / 3) * 35}%`,
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-20">
          <defs>
            <linearGradient id={`chipGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={i % 2 === 0 ? "hsl(160 84% 45%)" : "hsl(38 92% 55%)"} stopOpacity="0.4" />
              <stop offset="100%" stopColor={i % 2 === 0 ? "hsl(160 84% 45%)" : "hsl(38 92% 55%)"} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="38" fill={`url(#chipGrad${i})`} stroke="currentColor" strokeWidth="2" />
          <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 4" />
          <circle cx="40" cy="40" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>
    ))}
  </div>
);

// SVG Cards
const CardsVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {['♠', '♥', '♦', '♣'].map((suit, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${25 + i * 15}%`,
          top: `${30 + (i % 2) * 20}%`,
        }}
        animate={{ rotate: [-5, 5, -5], y: [0, -8, 0] }}
        transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
      >
        <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
          <span className={`text-3xl ${suit === '♥' || suit === '♦' ? 'text-red-500/40' : 'text-white/30'}`}>
            {suit}
          </span>
        </div>
      </motion.div>
    ))}
  </div>
);

// Lights visual
const LightsVisual = () => (
  <div className="relative w-full h-full">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${10 + (i % 4) * 25}%`,
          top: `${15 + Math.floor(i / 4) * 30}%`,
          width: '120px',
          height: '120px',
          background: i % 3 === 0 
            ? 'radial-gradient(circle, hsl(160 84% 45% / 0.15) 0%, transparent 70%)'
            : i % 3 === 1
            ? 'radial-gradient(circle, hsl(38 92% 55% / 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(0 0% 100% / 0.05) 0%, transparent 70%)',
        }}
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 2 + i * 0.3, 
          delay: i * 0.2, 
          repeat: Infinity,
        }}
      />
    ))}
  </div>
);

export const HeroBackground = ({ overlayStrength, visualStyle }: HeroBackgroundProps) => {
  const { data: content } = useLandingContent();
  
  const style = visualStyle || content?.brand?.heroVisualStyle || 'roulette';
  const overlay = overlayStrength ?? content?.hero?.heroImageOverlayStrength ?? 0.55;
  
  const renderVisual = () => {
    switch (style) {
      case 'chips':
        return <ChipsVisual />;
      case 'cards':
        return <CardsVisual />;
      case 'lights':
        return <LightsVisual />;
      case 'roulette':
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute right-[-20%] top-[10%] w-[600px] h-[600px] hidden lg:block"
          >
            <RouletteVisual />
          </motion.div>
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-1))] via-background to-background" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Radial glow - primary */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[80vh]"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 0%, hsl(var(--primary) / 0.12) 0%, transparent 70%)`,
        }}
      />
      
      {/* Side glows */}
      <motion.div 
        animate={{ opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" 
      />
      <motion.div 
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[150px]" 
      />
      
      {/* Visual element based on style */}
      {renderVisual()}
      
      {/* Overlay for readability */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(to bottom, transparent 0%, hsl(var(--background) / ${overlay}) 100%)` 
        }}
      />
    </div>
  );
};
