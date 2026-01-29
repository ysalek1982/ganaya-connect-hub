import { motion } from 'framer-motion';
import { MessageCircle, User, ExternalLink, Loader2, Shield, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PublicAgentInfo } from '@/lib/firebase-types';

interface AgentContactCardProps {
  agentInfo: PublicAgentInfo | null;
  isLoading: boolean;
  refCode: string | null;
}

export const AgentContactCard = ({ agentInfo, isLoading, refCode }: AgentContactCardProps) => {
  if (!refCode) return null;
  
  if (isLoading) {
    return (
      <section className="py-6 -mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <Card className="glass-card max-w-lg mx-auto border-primary/30">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-3">Conectando con tu cajero...</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!agentInfo) return null;

  const { displayName, contactLabel, whatsapp, messageTemplate } = agentInfo;

  // Build WhatsApp link - ensure clean number
  const cleanWhatsapp = whatsapp?.replace(/\D/g, '') || '';
  const defaultMessage = messageTemplate || `Hola ${displayName?.split(' ')[0] || 'cajero'}, quiero jugar en Ganaya.bet`;
  const whatsappUrl = cleanWhatsapp 
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(defaultMessage)}`
    : null;

  return (
    <section className="py-6 -mt-16 relative z-20" id="tu-cajero">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card className="glass-card max-w-lg mx-auto border-primary/40 overflow-hidden shadow-2xl shadow-primary/20">
            {/* Gradient header */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-gold to-primary" />
            
            <CardContent className="p-6">
              {/* Agent Info Row */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/30">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#25D366] rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-primary font-medium mb-0.5">
                    {contactLabel || 'Tu cajero asignado'}
                  </p>
                  <h3 className="font-display text-2xl font-bold truncate">
                    {displayName}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Disponible ahora
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
                  <Shield className="w-3 h-3" />
                  Verificado
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#25D366]/10 text-xs text-[#25D366]">
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp directo
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 text-xs text-gold">
                  <Sparkles className="w-3 h-3" />
                  Atención personal
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Tienes atención personalizada. Cualquier duda con <strong>recargas</strong>, <strong>retiros</strong> o apuestas, {displayName?.split(' ')[0] || 'tu cajero'} te ayuda directamente.
              </p>

              {whatsappUrl && (
                <Button 
                  variant="whatsapp" 
                  size="lg"
                  className="w-full gap-3 text-base shadow-lg shadow-[#25D366]/30"
                  asChild
                >
                  <a 
                    href={whatsappUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Hablar con {displayName?.split(' ')[0] || 'mi cajero'}
                    <ExternalLink className="w-4 h-4 ml-auto opacity-60" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default AgentContactCard;
