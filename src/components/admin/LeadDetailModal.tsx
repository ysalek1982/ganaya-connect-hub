import { useState, useEffect } from 'react';
import { doc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { MessageSquare, User, MapPin, Phone, Mail, Calendar, Target, Award, CheckCircle, XCircle, HelpCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { FirebaseLead, LeadStatus } from '@/lib/firebase-types';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { getTierColor, getTierText } from '@/lib/agent-scoring';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'NUEVO', label: 'Nuevo', color: 'bg-green-500' },
  { value: 'CONTACTADO', label: 'Contactado', color: 'bg-yellow-500' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-blue-500' },
  { value: 'ONBOARDED', label: 'Onboarded', color: 'bg-primary' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-500' },
  { value: 'DESCARTADO', label: 'Descartado', color: 'bg-gray-500' },
];

interface LeadDetailModalProps {
  lead: FirebaseLead | null;
  onClose: () => void;
  getAgentName: (id: string | null) => string;
  onLeadUpdated?: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FirestoreChatLog {
  id: string;
  leadId: string;
  transcript: ChatMessage[] | null;
  aiSummary: string | null;
  aiRecommendation: string | null;
  createdAt: Date;
}

interface ScoreBreakdownItem {
  key: string;
  label: string;
  value: boolean | string | number | null;
  pointsAwarded: number;
  maxPoints: number;
}

const LeadDetailModal = ({ lead, onClose, getAgentName, onLeadUpdated }: LeadDetailModalProps) => {
  const { isAdmin } = useFirebaseAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chatLogs, setChatLogs] = useState<FirestoreChatLog[] | null>(null);
  const [chatLogsLoading, setChatLogsLoading] = useState(false);

  // Fetch chat logs from Firebase Firestore
  useEffect(() => {
    const fetchChatLogs = async () => {
      if (!lead?.id) {
        setChatLogs(null);
        return;
      }

      setChatLogsLoading(true);
      try {
        const chatLogsRef = collection(db, 'chat_logs');
        const q = query(chatLogsRef, where('leadId', '==', lead.id));
        const snapshot = await getDocs(q);
        
        const logs: FirestoreChatLog[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            leadId: data.leadId || '',
            transcript: data.transcript || null,
            aiSummary: data.aiSummary || null,
            aiRecommendation: data.aiRecommendation || null,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          };
        });

        // Sort by createdAt descending
        logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setChatLogs(logs);
      } catch (error) {
        console.error('[LeadDetailModal] Error fetching chat logs:', error);
        setChatLogs([]);
      } finally {
        setChatLogsLoading(false);
      }
    };

    fetchChatLogs();
  }, [lead?.id]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead?.id) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'leads', lead.id), {
        status: newStatus,
        lastUpdatedAt: serverTimestamp(),
      });
      toast.success(`Estado actualizado a ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`);
      onLeadUpdated?.();
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Error al actualizar estado. Verifica tus permisos.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!lead?.id) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'leads', lead.id));
      toast.success('Postulación eliminada');
      onClose();
      onLeadUpdated?.();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar. Solo admins pueden eliminar postulaciones.');
    } finally {
      setIsDeleting(false);
    }
  };

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

            {/* Status Selector */}
            <div className="pt-4 border-t border-border">
              <label className="text-sm text-muted-foreground mb-2 block">Cambiar Estado</label>
              <Select
                value={lead.status}
                onValueChange={(value) => handleStatusChange(value as LeadStatus)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              {lead.contact?.whatsapp && (
                <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90">
                  <a href={`https://wa.me/${lead.contact.whatsapp.replace(/\D/g, '')}`} target="_blank">
                    Abrir WhatsApp
                  </a>
                </Button>
              )}

              {/* Delete Button - Admin only */}
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar postulación?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la postulación de <strong>{lead.name}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sí, eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                // Fallback: show raw answers if no breakdown available
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    No hay desglose detallado disponible. Mostrando respuestas:
                  </p>
                  <div className="space-y-2">
                    {Object.entries(agentProfile).map(([key, value]) => {
                      // Skip internal fields
                      if (key.startsWith('_') || key === 'scoreBreakdown' || key === 'upline') return null;
                      return (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{formatValue(value as boolean | string | number | null)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            {chatLogsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : chatLogs && chatLogs.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {chatLogs.map((log) => (
                    <div key={log.id} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        {format(log.createdAt, 'dd/MM/yyyy HH:mm')}
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

                      {log.aiSummary && (
                        <div className="p-3 rounded-lg bg-gold/10 border border-gold/20">
                          <p className="text-xs text-gold mb-1">Resumen IA</p>
                          <p className="text-sm">{log.aiSummary}</p>
                        </div>
                      )}

                      {log.aiRecommendation && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-xs text-primary mb-1">Recomendación IA</p>
                          <p className="text-sm">{log.aiRecommendation}</p>
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