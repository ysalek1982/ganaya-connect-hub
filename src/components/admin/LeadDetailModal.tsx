import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { MessageSquare, User, MapPin, Phone, Mail, Calendar, Target, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  getAgentName: (id: string | null) => string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatLog {
  id: string;
  transcript: ChatMessage[] | null;
  ai_summary: string | null;
  ai_recommendation: string | null;
  created_at: string;
}

const LeadDetailModal = ({ lead, onClose, getAgentName }: LeadDetailModalProps) => {
  // Fetch chat logs for this lead
  const { data: chatLogs } = useQuery({
    queryKey: ['chat-logs', lead?.id],
    queryFn: async () => {
      if (!lead) return null;
      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ChatLog[];
    },
    enabled: !!lead,
  });

  if (!lead) return null;

  const tierBadge = (etiqueta: string | null, score: number | null) => {
    const colors: Record<string, string> = {
      'AGENTE_POTENCIAL_ALTO': 'bg-primary/20 text-primary border-primary/30',
      'AGENTE_POTENCIAL_MEDIO': 'bg-gold/20 text-gold border-gold/30',
      'AGENTE_POTENCIAL_BAJO': 'bg-orange-400/20 text-orange-400 border-orange-400/30',
      'CLIENTE': 'bg-muted text-muted-foreground border-muted',
      'NO_PRIORITARIO': 'bg-muted text-muted-foreground border-muted',
    };
    return colors[etiqueta || ''] || 'bg-muted text-muted-foreground border-muted';
  };

  return (
    <Dialog open={!!lead} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-5 h-5" />
            {lead.nombre}
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${tierBadge(lead.etiqueta, lead.score)}`}>
              {lead.tipo === 'agente' ? lead.etiqueta?.replace(/_/g, ' ') : lead.tipo}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="chat">Historial Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{lead.whatsapp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{lead.pais}{lead.ciudad ? `, ${lead.ciudad}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha registro</p>
                  <p className="font-medium">{format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Intent</p>
                  <p className="font-medium capitalize">{lead.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Agente Asignado</p>
                  <p className="font-medium">{getAgentName(lead.asignado_agente_id)}</p>
                </div>
              </div>
            </div>

            {lead.ref_code && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground">Ref Code</p>
                <p className="font-mono font-bold text-primary">{lead.ref_code}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="whatsapp" size="sm" asChild>
                <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank">
                  Abrir WhatsApp
                </a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-4 mt-4">
            {lead.tipo === 'agente' ? (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/20 to-gold/20 border border-primary/30">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    <span className="text-lg font-bold">Score Total</span>
                  </div>
                  <span className="text-3xl font-display font-bold text-primary">{lead.score || 0}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Desglose de Criterios</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Binance verificada</p>
                      <p className="font-medium">{lead.binance_verificada ? '✅ Sí (+30)' : '❌ No'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Banca $300+</p>
                      <p className="font-medium">{lead.banca_300 ? '✅ Sí (+20)' : '❌ No'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Nivel P2P</p>
                      <p className="font-medium capitalize">{lead.p2p_nivel || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Horas/día</p>
                      <p className="font-medium">{lead.horas_dia || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Exp. Casinos</p>
                      <p className="font-medium">{lead.exp_casinos ? '✅ Sí (+10)' : '❌ No'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Exp. Atención</p>
                      <p className="font-medium">{lead.exp_atencion ? '✅ Sí (+10)' : '❌ No'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                      <p className="text-xs text-muted-foreground">Quiere empezar</p>
                      <p className="font-medium">{lead.quiere_empezar ? '✅ Sí (+5)' : '❌ No'}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                El scoring solo aplica para leads de tipo agente
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            {chatLogs && chatLogs.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {chatLogs.map((log) => (
                    <div key={log.id} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>

                      {log.transcript && log.transcript.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-muted/50 ml-4'
                              : 'bg-primary/10 mr-4'
                          }`}
                        >
                          <p className="text-xs text-muted-foreground mb-1">
                            {msg.role === 'user' ? 'Usuario' : 'Bot'}
                          </p>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}

                      {log.ai_summary && (
                        <div className="p-3 rounded-lg bg-gold/10 border border-gold/20">
                          <p className="text-xs text-gold mb-1">Resumen IA</p>
                          <p className="text-sm">{log.ai_summary}</p>
                        </div>
                      )}

                      {log.ai_recommendation && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-xs text-primary mb-1">Recomendación IA</p>
                          <p className="text-sm">{log.ai_recommendation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay historial de chat
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;
