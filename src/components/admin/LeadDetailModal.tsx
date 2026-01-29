import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { MessageSquare, User, MapPin, Phone, Mail, Calendar, Target, Award, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import type { FirebaseLead } from '@/lib/firebase-types';
import { getTierColor, getTierText } from '@/lib/agent-scoring';

interface LeadDetailModalProps {
  lead: FirebaseLead | null;
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

interface ScoreBreakdownItem {
  key: string;
  label: string;
  value: boolean | string | number | null;
  pointsAwarded: number;
  maxPoints: number;
}

const LeadDetailModal = ({ lead, onClose, getAgentName }: LeadDetailModalProps) => {
  // Fetch chat logs for this lead
  const { data: chatLogs } = useQuery({
    queryKey: ['chat-logs', lead?.id],
    queryFn: async () => {
      if (!lead?.id) return null;
      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ChatLog[];
    },
    enabled: !!lead?.id,
  });

  if (!lead) return null;

  // Extract score breakdown from rawJson if available
  const rawJson = lead.rawJson || {};
  const scoreBreakdown: ScoreBreakdownItem[] = (rawJson.scoreBreakdown as ScoreBreakdownItem[]) || 
    ((lead as unknown as Record<string, unknown>).scoreBreakdown as ScoreBreakdownItem[]) || [];
  
  // Get agent profile for display
  const agentProfile = rawJson.agentProfile as Record<string, unknown> || rawJson;
  
  // Compute score from breakdown if not directly available
  const scoreTotal = lead.scoreTotal || scoreBreakdown.reduce((sum, item) => sum + item.pointsAwarded, 0);
  const tier = lead.tier || (lead.rawJson?.tier as string) || 'NOVATO';

  // Format value for display
  const formatValue = (value: boolean | string | number | null): React.ReactNode => {
    if (value === null || value === undefined) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <HelpCircle className="w-4 h-4" />
          No informado
        </span>
      );
    }
    if (typeof value === 'boolean') {
      return value ? (
        <span className="flex items-center gap-1 text-primary">
          <CheckCircle className="w-4 h-4" />
          Sí
        </span>
      ) : (
        <span className="flex items-center gap-1 text-destructive">
          <XCircle className="w-4 h-4" />
          No
        </span>
      );
    }
    return <span className="font-medium">{String(value)}</span>;
  };

  return (
    <Dialog open={!!lead} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-5 h-5" />
            {lead.name}
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTierColor(tier)}`}>
              {getTierText(tier)}
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
                  <p className="font-medium">{lead.contact?.whatsapp || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.contact?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{lead.country}{lead.city ? `, ${lead.city}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha registro</p>
                  <p className="font-medium">
                    {lead.createdAt instanceof Date && !isNaN(lead.createdAt.getTime())
                      ? format(lead.createdAt, 'dd/MM/yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Intent</p>
                  <p className="font-medium capitalize">{lead.intent || 'Agente'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Agente Asignado</p>
                  <p className="font-medium">{getAgentName(lead.assignedAgentId)}</p>
                </div>
              </div>
            </div>

            {lead.refCode && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground">Ref Code</p>
                <p className="font-mono font-bold text-primary">{lead.refCode}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {lead.contact?.whatsapp && (
                <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90">
                  <a href={`https://wa.me/${lead.contact.whatsapp.replace(/\D/g, '')}`} target="_blank">
                    Abrir WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-4 mt-4">
            {/* Score Total */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/20 to-gold/20 border border-primary/30">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold">Score Total</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-display font-bold text-primary">{scoreTotal}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
            </div>

            <Progress value={scoreTotal} className="h-3" />

            {/* Score Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold">Desglose de Criterios</h4>
              
              {scoreBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {scoreBreakdown.map((item) => (
                    <div 
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <div className="text-sm mt-1">
                          {formatValue(item.value)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${item.pointsAwarded > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                          +{item.pointsAwarded}
                        </span>
                        <span className="text-sm text-muted-foreground">/{item.maxPoints}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback: Display from agentProfile or rawJson
                <div className="grid grid-cols-1 gap-2">
                  <ScoringItem 
                    label="Horas/día"
                    value={agentProfile.hours_per_day ?? agentProfile.availability_hours}
                    points={parseHoursPoints(agentProfile.hours_per_day ?? agentProfile.availability_hours)}
                    maxPoints={20}
                  />
                  <ScoringItem 
                    label="Métodos de cobro local"
                    value={agentProfile.has_local_payment_methods ?? (agentProfile.payment_methods_knowledge !== 'ninguno' ? true : null)}
                    points={agentProfile.has_local_payment_methods === true || (agentProfile.payment_methods_knowledge && agentProfile.payment_methods_knowledge !== 'ninguno') ? 15 : 0}
                    maxPoints={15}
                  />
                  <ScoringItem 
                    label="Red de contactos casino"
                    value={agentProfile.knows_casino_players}
                    points={agentProfile.knows_casino_players === 'yes' || agentProfile.knows_casino_players === true ? 15 : 0}
                    maxPoints={15}
                  />
                  <ScoringItem 
                    label="Quiere empezar ya"
                    value={agentProfile.wants_to_start_now ?? agentProfile.quiere_empezar}
                    points={agentProfile.wants_to_start_now === true || agentProfile.quiere_empezar === true ? 10 : 0}
                    maxPoints={10}
                  />
                </div>
              )}
            </div>
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

// Helper component for scoring item
const ScoringItem = ({ 
  label, 
  value, 
  points, 
  maxPoints 
}: { 
  label: string; 
  value: unknown;
  points: number; 
  maxPoints: number;
}) => {
  const formatValue = (val: unknown): React.ReactNode => {
    if (val === null || val === undefined) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <HelpCircle className="w-4 h-4" />
          No informado
        </span>
      );
    }
    if (typeof val === 'boolean') {
      return val ? (
        <span className="flex items-center gap-1 text-primary">
          <CheckCircle className="w-4 h-4" />
          Sí
        </span>
      ) : (
        <span className="flex items-center gap-1 text-destructive">
          <XCircle className="w-4 h-4" />
          No
        </span>
      );
    }
    return <span className="font-medium">{String(val)}</span>;
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <div className="text-sm mt-1">
          {formatValue(value)}
        </div>
      </div>
      <div className="text-right">
        <span className={`text-lg font-bold ${points > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          +{points}
        </span>
        <span className="text-sm text-muted-foreground">/{maxPoints}</span>
      </div>
    </div>
  );
};

// Helper functions
function parseHoursPoints(value: unknown): number {
  if (!value) return 0;
  const str = String(value).toLowerCase();
  if (str.includes('6') || str.includes('+') || str.includes('más')) return 20;
  if (str.includes('3') || str.includes('4') || str.includes('5')) return 10;
  return 0;
}

export default LeadDetailModal;
