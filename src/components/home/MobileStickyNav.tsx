import { MessageCircle, Users, Gamepad2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCMSMobileCTAs } from '@/hooks/useCMSPromos';
import { motion, AnimatePresence } from 'framer-motion';

const buttonIcons: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  apostar: Gamepad2,
  agente: Users,
};

const buttonVariants: Record<string, 'whatsapp' | 'hero' | 'glass'> = {
  whatsapp: 'whatsapp',
  apostar: 'hero',
  agente: 'glass',
};

const buttonGlows: Record<string, string> = {
  whatsapp: 'shadow-[0_0_20px_-5px_rgba(37,211,102,0.6)]',
  apostar: 'shadow-[0_0_20px_-5px_hsl(var(--primary)/0.6)]',
  agente: '',
};

export const MobileStickyNav = () => {
  const { data: ctas } = useCMSMobileCTAs();

  const handleClick = (link: string) => {
    if (link.startsWith('http') || link.startsWith('https')) {
      window.open(link, '_blank');
    } else {
      window.location.href = link;
    }
  };

  if (!ctas?.length) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 p-3 pb-4 bg-gradient-to-t from-background via-background/98 to-transparent md:hidden z-30 safe-area-bottom"
      >
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="flex gap-2">
          {ctas.map((cta, i) => {
            const Icon = buttonIcons[cta.button_key] || Gamepad2;
            const variant = buttonVariants[cta.button_key] || 'hero';
            const glow = buttonGlows[cta.button_key] || '';
            const isPrimary = cta.button_key === 'apostar';
            
            return (
              <motion.div 
                key={cta.id} 
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Button
                  variant={variant}
                  size="sm"
                  className={`w-full text-xs h-12 rounded-xl ${glow} ${isPrimary ? 'relative overflow-hidden' : ''}`}
                  onClick={() => handleClick(cta.link)}
                >
                  {isPrimary && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{cta.text}</span>
                  {isPrimary && <Sparkles className="w-3 h-3 ml-1" />}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
