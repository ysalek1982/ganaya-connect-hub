import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Search, Users, Link, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import AgentLinkModal from '@/components/admin/AgentLinkModal';
import type { Database } from '@/integrations/supabase/types';
type AgentStatus = Database['public']['Enums']['agent_status'];

interface AgentWithLineLeader {
  id: string;
  nombre: string;
  whatsapp: string;
  pais: string;
  ciudad: string | null;
  estado: AgentStatus | null;
  ref_code: string | null;
  line_leader_id: string | null;
  user_id: string | null;
  created_at: string;
  leads_count?: number;
  line_leader_name?: string;
}

interface AgentForm {
  nombre: string;
  whatsapp: string;
  pais: string;
  ciudad: string;
  estado: AgentStatus;
  ref_code: string;
  line_leader_id: string;
}

const AdminAgentesNew = () => {
  const queryClient = useQueryClient();
  const { isAdmin, isLineLeader, agentId } = useUserRole();
  
  const [search, setSearch] = useState('');
  const [filterPais, setFilterPais] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterLineLeader, setFilterLineLeader] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedAgentForLink, setSelectedAgentForLink] = useState<{ name: string; refCode: string } | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentWithLineLeader | null>(null);
  const [form, setForm] = useState<AgentForm>({
    nombre: '',
    whatsapp: '',
    pais: 'Paraguay',
    ciudad: '',
    estado: 'activo',
    ref_code: '',
    line_leader_id: '',
  });

  // Fetch all agents (admin) or network (line_leader)
  const { data: agentes, isLoading } = useQuery({
    queryKey: ['agentes-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AgentWithLineLeader[];
    },
  });

  // Fetch lead counts
  const { data: leadCounts } = useQuery({
    queryKey: ['agent-lead-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('asignado_agente_id')
        .not('asignado_agente_id', 'is', null);
      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(lead => {
        if (lead.asignado_agente_id) {
          counts[lead.asignado_agente_id] = (counts[lead.asignado_agente_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  // Get potential line leaders (agents without a line_leader_id - top level)
  const lineLeaders = agentes?.filter(a => !a.line_leader_id && a.estado === 'activo');

  // Generate ref_code in format AGT-XXXXXX
  const generateRefCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AGT-${suffix}`;
  };

  const openLinkModal = (agent: AgentWithLineLeader) => {
    if (agent.ref_code) {
      setSelectedAgentForLink({ name: agent.nombre, refCode: agent.ref_code });
      setShowLinkModal(true);
    } else {
      toast.error('Este agente no tiene código de referido');
    }
  };

  const createAgent = useMutation({
    mutationFn: async () => {
      const refCode = form.ref_code || generateRefCode();
      const { error } = await supabase.from('agentes').insert({
        nombre: form.nombre,
        whatsapp: form.whatsapp,
        pais: form.pais,
        ciudad: form.ciudad || null,
        estado: form.estado,
        ref_code: refCode,
        line_leader_id: form.line_leader_id || null,
      });
      if (error) throw error;
      return refCode;
    },
    onSuccess: (refCode) => {
      queryClient.invalidateQueries({ queryKey: ['agentes-full'] });
      toast.success(`Agente creado con código: ${refCode}`);
      closeModal();
    },
    onError: (error: Error) => {
      if (error.message.includes('unique')) {
        toast.error('El código de referencia ya existe');
      } else {
        toast.error('Error al crear agente');
      }
    },
  });

  const updateAgent = useMutation({
    mutationFn: async () => {
      if (!editingAgent) return;
      const { error } = await supabase
        .from('agentes')
        .update({
          nombre: form.nombre,
          whatsapp: form.whatsapp,
          pais: form.pais,
          ciudad: form.ciudad || null,
          estado: form.estado,
          ref_code: form.ref_code || null,
          line_leader_id: form.line_leader_id || null,
        })
        .eq('id', editingAgent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentes-full'] });
      toast.success('Agente actualizado');
      closeModal();
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agentes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentes-full'] });
      toast.success('Agente eliminado');
    },
  });

  const copyRefLink = (refCode: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?ref=${refCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de referido copiado');
  };

  const openCreateModal = () => {
    setEditingAgent(null);
    setForm({
      nombre: '',
      whatsapp: '',
      pais: 'Paraguay',
      ciudad: '',
      estado: 'activo',
      ref_code: '',
      line_leader_id: isLineLeader && agentId ? agentId : '',
    });
    setShowModal(true);
  };

  const openEditModal = (agent: AgentWithLineLeader) => {
    setEditingAgent(agent);
    setForm({
      nombre: agent.nombre,
      whatsapp: agent.whatsapp,
      pais: agent.pais,
      ciudad: agent.ciudad || '',
      estado: (agent.estado || 'activo') as AgentStatus,
      ref_code: agent.ref_code || '',
      line_leader_id: agent.line_leader_id || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) {
      updateAgent.mutate();
    } else {
      createAgent.mutate();
    }
  };

  const getLineLeaderName = (id: string | null) => {
    if (!id || !agentes) return '-';
    const leader = agentes.find(a => a.id === id);
    return leader?.nombre || '-';
  };

  // Filter agents
  const filteredAgentes = agentes?.filter(a => {
    // Role-based filtering
    if (isLineLeader && agentId) {
      if (a.line_leader_id !== agentId && a.id !== agentId) return false;
    }

    // Search
    const matchesSearch =
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.whatsapp.includes(search) ||
      a.pais.toLowerCase().includes(search.toLowerCase()) ||
      (a.ref_code && a.ref_code.toLowerCase().includes(search.toLowerCase()));

    // Filters
    const matchesPais = filterPais === 'all' || a.pais === filterPais;
    const matchesEstado = filterEstado === 'all' || a.estado === filterEstado;
    const matchesLeader = filterLineLeader === 'all' || a.line_leader_id === filterLineLeader;

    return matchesSearch && matchesPais && matchesEstado && matchesLeader;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Agentes</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gestión de todos los agentes' : 'Agentes de tu red'}
          </p>
        </div>
        <Button onClick={openCreateModal} variant="hero" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo agente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, WhatsApp o ref_code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPais} onValueChange={setFilterPais}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los países</SelectItem>
            <SelectItem value="Paraguay">Paraguay</SelectItem>
            <SelectItem value="Argentina">Argentina</SelectItem>
            <SelectItem value="Bolivia">Bolivia</SelectItem>
            <SelectItem value="Colombia">Colombia</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={filterLineLeader} onValueChange={setFilterLineLeader}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Line Leader" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {lineLeaders?.map(ll => (
                <SelectItem key={ll.id} value={ll.id}>{ll.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Line Leader</TableHead>
              <TableHead>Ref Code</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="spinner mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredAgentes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay agentes
                </TableCell>
              </TableRow>
            ) : (
              filteredAgentes?.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{agent.nombre}</p>
                      <p className="text-sm text-muted-foreground">{agent.whatsapp}</p>
                    </div>
                  </TableCell>
                  <TableCell>{agent.pais}</TableCell>
                  <TableCell>
                    <Badge variant={agent.estado === 'activo' ? 'default' : 'secondary'}>
                      {agent.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{getLineLeaderName(agent.line_leader_id)}</TableCell>
                  <TableCell>
                    {agent.ref_code ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-primary/10 px-2 py-1 rounded text-primary font-mono">
                          {agent.ref_code}
                        </code>
                        <Button size="sm" variant="ghost" onClick={() => copyRefLink(agent.ref_code!)}>
                          <Link className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openLinkModal(agent)}>
                          <QrCode className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {leadCounts?.[agent.id] || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(agent)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('¿Eliminar este agente?')) {
                              deleteAgent.mutate(agent.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Editar agente' : 'Nuevo agente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nombre</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+595981123456"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={form.pais} onValueChange={(v) => setForm({ ...form, pais: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paraguay">Paraguay</SelectItem>
                    <SelectItem value="Argentina">Argentina</SelectItem>
                    <SelectItem value="Bolivia">Bolivia</SelectItem>
                    <SelectItem value="Colombia">Colombia</SelectItem>
                    <SelectItem value="Ecuador">Ecuador</SelectItem>
                    <SelectItem value="Perú">Perú</SelectItem>
                    <SelectItem value="Chile">Chile</SelectItem>
                    <SelectItem value="México">México</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as AgentStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Line Leader</Label>
                  <Select value={form.line_leader_id} onValueChange={(v) => setForm({ ...form, line_leader_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {lineLeaders?.filter(ll => ll.id !== editingAgent?.id).map(ll => (
                        <SelectItem key={ll.id} value={ll.id}>{ll.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label>Código de Referido</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.ref_code}
                    onChange={(e) => setForm({ ...form, ref_code: e.target.value.toUpperCase() })}
                    placeholder="Se genera automáticamente"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, ref_code: generateRefCode() })}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="hero">
                {editingAgent ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Modal with QR */}
      {selectedAgentForLink && (
        <AgentLinkModal
          isOpen={showLinkModal}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedAgentForLink(null);
          }}
          agentName={selectedAgentForLink.name}
          refCode={selectedAgentForLink.refCode}
        />
      )}
    </div>
  );
};

export default AdminAgentesNew;
