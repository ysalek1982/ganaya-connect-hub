import { MessageCircle, Users, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCMSMobileCTAs } from '@/hooks/useCMSPromos';

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
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background via-background/98 to-transparent md:hidden z-30">
      <div className="flex gap-2">
        {ctas.map((cta) => {
          const Icon = buttonIcons[cta.button_key] || Gamepad2;
          const variant = buttonVariants[cta.button_key] || 'hero';
          
          return (
            <Button
              key={cta.id}
              variant={variant}
              size="sm"
              className="flex-1 shadow-lg text-xs h-10"
              onClick={() => handleClick(cta.link)}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{cta.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
