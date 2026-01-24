import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Plus, Users, UserPlus, TrendingUp, Edit, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Agente = Database['public']['Tables']['agentes']['Row'];

const AppSubagents = () => {
  const queryClient = useQueryClient();
  const { agentId, isAdmin, isLineLeader } = useUserRole();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ 
    nombre: '', 
    whatsapp: '', 
    pais: 'Paraguay',
    ciudad: '',
  });

  const { data: subagents, isLoading } = useQuery({
    queryKey: ['app-subagents', agentId],
    queryFn: async () => {
      let query = supabase.from('agentes').select('*').order('created_at', { ascending: false });
      
      if (!isAdmin) {
        query = query.eq('line_leader_id', agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Agente[];
    },
    enabled: !!agentId || isAdmin,
  });

  const { data: leadCounts } = useQuery({
    queryKey: ['subagent-lead-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('leads')
        .select('asignado_agente_id')
        .not('asignado_agente_id', 'is', null);

      const counts: Record<string, number> = {};
      data?.forEach(l => {
        if (l.asignado_agente_id) {
          counts[l.asignado_agente_id] = (counts[l.asignado_agente_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const generateRefCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AGT-${suffix}`;
  };

  const createSubagent = useMutation({
    mutationFn: async () => {
      const refCode = generateRefCode();
      const { error } = await supabase.from('agentes').insert({
        nombre: newAgent.nombre,
        whatsapp: newAgent.whatsapp,
        pais: newAgent.pais,
        ciudad: newAgent.ciudad || null,
        estado: 'activo',
        ref_code: refCode,
        line_leader_id: agentId,
      });
      if (error) throw error;
      return refCode;
    },
    onSuccess: (refCode) => {
      queryClient.invalidateQueries({ queryKey: ['app-subagents'] });
      toast.success(`Subagente creado con código: ${refCode}`);
      setShowAddModal(false);
      setNewAgent({ nombre: '', whatsapp: '', pais: 'Paraguay', ciudad: '' });
    },
    onError: (e: Error) => {
      if (e.message.includes('unique')) {
        toast.error('El código ya existe, intenta de nuevo');
      } else {
        toast.error('Error al crear subagente');
      }
    },
  });

  const copyLink = (refCode: string) => {
    const link = `${window.location.origin}/?ref=${refCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado');
  };

  const totalLeads = subagents?.reduce((acc, a) => acc + (leadCounts?.[a.id] || 0), 0) || 0;

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
                  {subagents?.filter(a => a.estado === 'activo').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subagents List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : subagents?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              No tienes subagentes aún. ¡Crea uno para expandir tu red!
            </CardContent>
          </Card>
        ) : (
          subagents?.map(agent => (
            <Card key={agent.id} className="glass-card hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{agent.nombre}</span>
                      <Badge variant={agent.estado === 'activo' ? 'default' : 'secondary'}>
                        {agent.estado}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{agent.pais}</span>
                      {agent.ref_code && (
                        <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                          {agent.ref_code}
                        </code>
                      )}
                      <span>{leadCounts?.[agent.id] || 0} leads</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {agent.ref_code && (
                      <Button size="sm" variant="ghost" onClick={() => copyLink(agent.ref_code!)}>
                        <Copy className="w-4 h-4" />
                      </Button>
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
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newAgent.nombre}
                onChange={(e) => setNewAgent({ ...newAgent, nombre: e.target.value })}
                placeholder="María García"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={newAgent.whatsapp}
                onChange={(e) => setNewAgent({ ...newAgent, whatsapp: e.target.value })}
                placeholder="+59891234567"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={newAgent.pais} onValueChange={(v) => setNewAgent({ ...newAgent, pais: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paraguay">Paraguay</SelectItem>
                    <SelectItem value="Argentina">Argentina</SelectItem>
                    <SelectItem value="Chile">Chile</SelectItem>
                    <SelectItem value="Colombia">Colombia</SelectItem>
                    <SelectItem value="Ecuador">Ecuador</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
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
            <p className="text-sm text-muted-foreground">
              Se generará automáticamente un código de referido único (AGT-XXXXXX)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button 
              variant="hero" 
              onClick={() => createSubagent.mutate()}
              disabled={!newAgent.nombre || !newAgent.whatsapp}
            >
              Crear subagente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppSubagents;
