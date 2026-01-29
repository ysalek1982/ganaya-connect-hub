import { motion } from 'framer-motion';
import { MessageCircle, User, ExternalLink, Loader2 } from 'lucide-react';
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
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="glass-card max-w-md mx-auto">
            <CardContent className="py-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Cargando tu cajero...</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!agentInfo) return null;

  const { displayName, contactLabel, whatsapp, messageTemplate } = agentInfo;

  // Build WhatsApp link
  const whatsappUrl = whatsapp 
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}${messageTemplate ? `?text=${encodeURIComponent(messageTemplate)}` : ''}`
    : null;

  return (
    <section className="py-8" id="tu-cajero">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card max-w-md mx-auto border-primary/30 overflow-hidden">
            {/* Gradient header */}
            <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-gold" />
            
            <CardContent className="py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-primary font-medium">
                    {contactLabel || 'Tu cajero asignado'}
                  </p>
                  <h3 className="font-display text-xl font-bold truncate">
                    {displayName}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Tienes atención personalizada. Cualquier duda con recargas, retiros o apuestas, tu cajero te ayuda directamente.
              </p>

              {whatsappUrl && (
                <Button 
                  variant="whatsapp" 
                  className="w-full gap-2"
                  asChild
                >
                  <a 
                    href={whatsappUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Hablar con {displayName.split(' ')[0]}
                    <ExternalLink className="w-4 h-4 ml-auto" />
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
