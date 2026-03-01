import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface TimeUnit {
  value: number;
  label: string;
}

const FlipDigit = ({ value, label }: TimeUnit) => {
  const formatted = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-card/80 backdrop-blur-md border border-border/60 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[44px] sm:min-w-[52px] text-center shadow-lg shadow-black/10"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <span className="font-display text-xl sm:text-2xl font-black text-primary tabular-nums">
              {formatted}
            </span>
          </motion.div>
        </AnimatePresence>
        {/* Glow underneath */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary/20 rounded-full blur-sm" />
      </div>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">{label}</span>
    </div>
  );
};

const Separator = () => (
  <motion.div
    animate={{ opacity: [1, 0.3, 1] }}
    transition={{ duration: 1, repeat: Infinity }}
    className="text-primary/50 font-display text-xl font-black self-start mt-2"
  >
    :
  </motion.div>
);

// Calculate end of current promotional period (next Monday 00:00)
const getNextDeadline = () => {
  const now = new Date();
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
};

export const CountdownTimer = ({ compact = false }: { compact?: boolean }) => {
  const [deadline] = useState(getNextDeadline);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const tick = useCallback(() => {
    const diff = Math.max(0, deadline - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    setTimeLeft({
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    });
  }, [deadline]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20"
      >
        <Clock className="w-3 h-3 text-destructive" />
        <span className="text-xs font-bold text-destructive tabular-nums">
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-3"
    >
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/25"
      >
        <Flame className="w-4 h-4 text-destructive" />
        <span className="text-sm font-bold text-destructive">Oferta de bienvenida termina en</span>
      </motion.div>

      <div className="flex items-center gap-2">
        <FlipDigit value={timeLeft.hours} label="Horas" />
        <Separator />
        <FlipDigit value={timeLeft.minutes} label="Min" />
        <Separator />
        <FlipDigit value={timeLeft.seconds} label="Seg" />
      </div>
    </motion.div>
  );
};
