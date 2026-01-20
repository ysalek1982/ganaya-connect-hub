import { motion } from 'framer-motion';

export const StadiumLights = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main stadium glow effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[60%]"
        style={{
          background: `
            radial-gradient(ellipse at center top, 
              hsl(156 100% 50% / 0.15) 0%, 
              hsl(156 100% 50% / 0.05) 30%, 
              transparent 60%
            )
          `,
        }}
      />

      {/* Left spotlight */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-0 w-1/3 h-full"
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(156 100% 50% / 0.1) 0%, 
              transparent 50%
            )
          `,
          transformOrigin: 'top left',
        }}
      />

      {/* Right spotlight */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          rotate: [5, -5, 5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
        className="absolute top-0 right-0 w-1/3 h-full"
        style={{
          background: `
            linear-gradient(-135deg, 
              hsl(345 100% 60% / 0.08) 0%, 
              transparent 50%
            )
          `,
          transformOrigin: 'top right',
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: 0,
          }}
          animate={{
            y: [null, '-20%'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Bottom glow line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            hsl(156 100% 50% / 0.3) 30%, 
            hsl(156 100% 50% / 0.5) 50%, 
            hsl(156 100% 50% / 0.3) 70%, 
            transparent 100%
          )`,
        }}
      />
    </div>
  );
};
