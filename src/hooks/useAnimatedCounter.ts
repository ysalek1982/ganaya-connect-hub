import { useEffect, useState } from 'react';

interface UseAnimatedCounterOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  isVisible: boolean;
}

export const useAnimatedCounter = ({
  start = 0,
  end,
  duration = 2000,
  delay = 0,
  isVisible,
}: UseAnimatedCounterOptions) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isVisible) {
      setCount(start);
      return;
    }

    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Easing function - easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        const current = Math.floor(start + (end - start) * eased);
        setCount(current);

        if (now < endTime) {
          requestAnimationFrame(updateCount);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(updateCount);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, start, end, duration, delay]);

  return count;
};
