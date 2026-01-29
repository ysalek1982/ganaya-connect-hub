import { useState } from 'react';
import { Users, UserPlus, TrendingUp, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useSubagents, useCreateSubagent, CreateSubagentResult } from '@/hooks/useSubagents';
import { useFirebaseLeadCounts } from '@/hooks/useFirebaseLeads';
import SubagentCreatedModal from '@/components/app/SubagentCreatedModal';
import { toast } from 'sonner';

const COUNTRIES = [
  'Paraguay', 'Argentina', 'Chile', 'Colombia', 'Ecuador', 
  'Perú', 'Bolivia', 'México', 'USA', 'España'
];

const AppSubagents = () => {
  const { userData, isAdmin, isLineLeader } = useFirebaseAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [createdData, setCreatedData] = useState<CreateSubagentResult | null>(null);
  const [newAgent, setNewAgent] = useState({ 
    nombre: '', 
    email: '',
    whatsapp: '', 
    pais: 'Paraguay',
    ciudad: '',
  });

  const { data: subagents, isLoading, error } = useSubagents();
  const { data: leadCounts } = useFirebaseLeadCounts();
  const createSubagentMutation = useCreateSubagent();

  // Check if user can recruit
  const canRecruit = isAdmin || isLineLeader || userData?.canRecruitSubagents;

  const handleCreateSubagent = () => {
    if (!newAgent.nombre || !newAgent.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    createSubagentMutation.mutate(
      {
        name: newAgent.nombre,
        email: newAgent.email,
        country: newAgent.pais,
        whatsapp: newAgent.whatsapp || undefined,
        city: newAgent.ciudad || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setShowAddModal(false);
            setCreatedData({
              ...result,
              // Add name for the modal message
              email: result.email || newAgent.email,
            });
            setShowCreatedModal(true);
            setNewAgent({ nombre: '', email: '', whatsapp: '', pais: 'Paraguay', ciudad: '' });
          } else {
            toast.error(result.error || 'Error al crear subagente');
          }
        },
        onError: (error) => {
          toast.error(error.message || 'Error al crear subagente');
        },
      }
    );
  };

  const copyLink = (refCode: string) => {
    const link = `${window.location.origin}/?ref=${refCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado');
  };

  const totalLeads = subagents?.reduce((acc, a) => acc + (leadCounts?.[a.uid] || 0), 0) || 0;

  if (!canRecruit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Subagentes</h1>
          <p className="text-muted-foreground">Gestiona tu red de agentes</p>
        </div>
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Función no habilitada</h3>
            <p className="text-muted-foreground">
              Contacta a tu administrador para activar la opción de reclutar subagentes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Subagentes</h1>
          <p className="text-muted-foreground">Gestiona tu red de agentes</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="hero" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Crear subagente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{subagents?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Subagentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalLeads}</p>
                <p className="text-sm text-muted-foreground">Leads totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {subagents?.filter(a => a.isActive).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <Card className="glass-card border-destructive/50">
          <CardContent className="py-6 text-center text-destructive">
            Error al cargar subagentes: {error.message}
          </CardContent>
        </Card>
      )}

      {/* Subagents List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : subagents?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tienes subagentes aún.</p>
              <p className="text-sm mt-2">¡Crea uno para expandir tu red!</p>
            </CardContent>
          </Card>
        ) : (
          subagents?.map(agent => (
            <Card key={agent.uid} className="glass-card hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{agent.name || agent.displayName}</span>
                      <Badge variant={agent.isActive ? 'default' : 'secondary'} className="text-xs">
                        {agent.isActive ? 'activo' : 'inactivo'}
                      </Badge>
                      {agent.canRecruitSubagents && (
                        <Badge variant="outline" className="text-xs">
                          reclutador
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span>{agent.country}</span>
                      {agent.refCode && (
                        <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">
                          {agent.refCode}
                        </code>
                      )}
                      <span>{leadCounts?.[agent.uid] || 0} leads</span>
                    </div>
                    {agent.email && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{agent.email}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {agent.refCode && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => copyLink(agent.refCode!)} title="Copiar link">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => window.open(`/?ref=${agent.refCode}`, '_blank')}
                          title="Abrir link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Subagent Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear subagente</DialogTitle>
            <DialogDescription>
              Se creará una cuenta con contraseña temporal que el subagente deberá cambiar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newAgent.nombre}
                onChange={(e) => setNewAgent({ ...newAgent, nombre: e.target.value })}
                placeholder="María García"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newAgent.email}
                onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                placeholder="maria@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={newAgent.whatsapp}
                onChange={(e) => setNewAgent({ ...newAgent, whatsapp: e.target.value })}
                placeholder="+595981234567"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>País *</Label>
                <Select value={newAgent.pais} onValueChange={(v) => setNewAgent({ ...newAgent, pais: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={newAgent.ciudad}
                  onChange={(e) => setNewAgent({ ...newAgent, ciudad: e.target.value })}
                  placeholder="Asunción"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="hero" 
              onClick={handleCreateSubagent}
              disabled={!newAgent.nombre || !newAgent.email || createSubagentMutation.isPending}
            >
              {createSubagentMutation.isPending ? 'Creando...' : 'Crear subagente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Created Success Modal */}
      <SubagentCreatedModal
        open={showCreatedModal}
        onClose={() => setShowCreatedModal(false)}
        data={createdData ? {
          email: createdData.email || '',
          tempPassword: createdData.tempPassword || '',
          refCode: createdData.refCode || '',
          referralUrl: createdData.referralUrl,
          name: newAgent.nombre,
        } : null}
      />
    </div>
  );
};

export default AppSubagents;
