import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const countries = ['🇵🇾', '🇨🇴', '🇦🇷', '🇪🇨', '🇺🇸'];
const names = ['Carlos', 'Ana', 'Diego', 'Valentina', 'Marco', 'Lucía', 'Pedro', 'Sofía', 'Mateo', 'Camila'];

const generateEarning = () => ({
  id: Date.now() + Math.random(),
  name: names[Math.floor(Math.random() * names.length)],
  flag: countries[Math.floor(Math.random() * countries.length)],
  amount: (Math.floor(Math.random() * 35) + 5) * 10, // $50 - $400
});

export const EarningsTicker = () => {
  const [earnings, setEarnings] = useState<ReturnType<typeof generateEarning>[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initial batch
    setEarnings([generateEarning(), generateEarning(), generateEarning()]);

    intervalRef.current = setInterval(() => {
      setEarnings(prev => {
        const next = [generateEarning(), ...prev.slice(0, 4)];
        return next;
      });
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="overflow-hidden h-8 relative">
      <AnimatePresence mode="popLayout">
        {earnings.slice(0, 1).map(e => (
          <motion.div
            key={e.id}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <DollarSign className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground/80">
              <span className="font-bold text-primary">{e.name}</span>
              {' '}{e.flag} ganó{' '}
              <span className="font-black text-primary">${e.amount}</span>
              {' '}esta semana
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
