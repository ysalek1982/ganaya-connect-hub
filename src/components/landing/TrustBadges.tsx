import { motion } from 'framer-motion';
import { Shield, Smartphone, CheckCircle2, HeadphonesIcon, Wallet, AlertCircle } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

// Icon mapping for common badge texts
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'programa': Shield,
  'agente': Shield,
  'móvil': Smartphone,
  'celular': Smartphone,
  'proceso': CheckCircle2,
  'claro': CheckCircle2,
  'soporte': HeadphonesIcon,
  'ayuda': HeadphonesIcon,
  'pago': Wallet,
  'mensual': Wallet,
  '+18': AlertCircle,
  'responsable': AlertCircle,
};

const getIconForBadge = (text: string) => {
  const lowerText = text.toLowerCase();
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (lowerText.includes(key)) {
      return Icon;
    }
  }
  return CheckCircle2;
};

export const TrustBadges = () => {
  const { data: content } = useLandingContent();
  const badges = content?.brand?.trustBadges || [];
  
  if (badges.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-2 mt-8"
    >
      {badges.map((badge, index) => {
        const Icon = getIconForBadge(badge);
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm text-xs text-muted-foreground"
          >
            <Icon className="w-3 h-3 text-primary/70" />
            <span>{badge}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
