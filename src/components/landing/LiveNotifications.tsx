import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { UserPlus, MapPin } from 'lucide-react';

const notifications = [
  { name: 'Carlos M.', country: 'Paraguay', flag: '🇵🇾', time: 'hace 2 min' },
  { name: 'Ana R.', country: 'Colombia', flag: '🇨🇴', time: 'hace 5 min' },
  { name: 'Diego L.', country: 'Argentina', flag: '🇦🇷', time: 'hace 8 min' },
  { name: 'María P.', country: 'Bolivia', flag: '🇧🇴', time: 'hace 12 min' },
  { name: 'José T.', country: 'Perú', flag: '🇵🇪', time: 'hace 15 min' },
  { name: 'Valentina S.', country: 'Ecuador', flag: '🇪🇨', time: 'hace 18 min' },
  { name: 'Marco V.', country: 'Chile', flag: '🇨🇱', time: 'hace 22 min' },
  { name: 'Lucía G.', country: 'Paraguay', flag: '🇵🇾', time: 'hace 25 min' },
];

export const LiveNotifications = () => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start after 8 seconds
    const startTimeout = setTimeout(() => {
      setCurrentIndex(0);
      setVisible(true);
    }, 8000);

    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (currentIndex < 0) return;

    // Hide after 4 seconds
    const hideTimeout = setTimeout(() => {
      setVisible(false);
    }, 4000);

    // Show next after 12 seconds
    const nextTimeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
      setVisible(true);
    }, 12000);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [currentIndex]);

  const notification = currentIndex >= 0 ? notifications[currentIndex] : null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && notification && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/90 backdrop-blur-md border border-border/60 shadow-2xl shadow-black/30 pointer-events-auto max-w-[280px]"
          >
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {notification.name} se postuló
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span>{notification.flag}</span>
                <MapPin className="w-2.5 h-2.5" />
                {notification.country} · {notification.time}
              </p>
            </div>
            <motion.div
              className="w-2 h-2 rounded-full bg-primary shrink-0"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
