import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Search, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Agente = Database['public']['Tables']['agentes']['Row'];
type AgentStatus = Database['public']['Enums']['agent_status'];

interface AgentForm {
  nombre: string;
  whatsapp: string;
  pais: string;
  ciudad: string;
  estado: AgentStatus;
  ref_code: string;
}

const AdminAgentes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agente | null>(null);
  const [form, setForm] = useState<AgentForm>({ 
    nombre: '', 
    whatsapp: '', 
    pais: 'Paraguay', 
    ciudad: '', 
    estado: 'activo',
    ref_code: '',
  });

  const { data: agentes, isLoading } = useQuery({
    queryKey: ['agentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Agente[];
    },
  });

  // Fetch lead counts per agent
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

  const generateRefCode = (name: string) => {
    const baseCode = name.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${baseCode}${randomSuffix}`;
  };

  const createAgent = useMutation({
    mutationFn: async () => {
      const refCode = form.ref_code || generateRefCode(form.nombre);
      const { error } = await supabase.from('agentes').insert({
        nombre: form.nombre,
        whatsapp: form.whatsapp,
        pais: form.pais,
        ciudad: form.ciudad || null,
        estado: form.estado as Database['public']['Enums']['agent_status'],
        ref_code: refCode,
      });
      if (error) throw error;
      return refCode;
    },
    onSuccess: (refCode) => {
      queryClient.invalidateQueries({ queryKey: ['agentes'] });
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
          estado: form.estado as Database['public']['Enums']['agent_status'],
          ref_code: form.ref_code || null,
        })
        .eq('id', editingAgent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentes'] });
      toast.success('Agente actualizado');
      closeModal();
    },
    onError: (error: Error) => {
      if (error.message.includes('unique')) {
        toast.error('El código de referencia ya existe');
      } else {
        toast.error('Error al actualizar agente');
      }
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agentes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentes'] });
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
    setForm({ nombre: '', whatsapp: '', pais: 'Paraguay', ciudad: '', estado: 'activo', ref_code: '' });
    setShowModal(true);
  };

  const openEditModal = (agent: Agente) => {
    setEditingAgent(agent);
    setForm({
      nombre: agent.nombre,
      whatsapp: agent.whatsapp,
      pais: agent.pais,
      ciudad: agent.ciudad || '',
      estado: (agent.estado || 'activo') as AgentStatus,
      ref_code: agent.ref_code || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgent(null);
    setForm({ nombre: '', whatsapp: '', pais: 'Paraguay', ciudad: '', estado: 'activo', ref_code: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) {
      updateAgent.mutate();
    } else {
      createAgent.mutate();
    }
  };

  const filteredAgentes = agentes?.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.whatsapp.includes(search) ||
    a.pais.toLowerCase().includes(search.toLowerCase()) ||
    (a.ref_code && a.ref_code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Agentes</h1>
          <p className="text-muted-foreground">Gestión de agentes activos</p>
        </div>
        <Button onClick={openCreateModal} variant="hero" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo agente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, WhatsApp o ref_code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="spinner" />
          </div>
        ) : filteredAgentes?.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No hay agentes
          </div>
        ) : (
          filteredAgentes?.map((agent) => (
            <div key={agent.id} className="glass-card rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{agent.nombre}</h3>
                  <p className="text-muted-foreground text-sm">{agent.whatsapp}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.estado === 'activo' ? 'badge-success' : 'badge-danger'
                }`}>
                  {agent.estado}
                </span>
              </div>
              
              {/* Ref Code */}
              {agent.ref_code && (
                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Código de referido</p>
                      <p className="font-mono font-bold text-primary">{agent.ref_code}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyRefLink(agent.ref_code!)}
                      title="Copiar link de referido"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>📍 {agent.pais}{agent.ciudad ? `, ${agent.ciudad}` : ''}</p>
                <p>📅 {format(new Date(agent.created_at), 'dd/MM/yyyy')}</p>
                <p className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {leadCounts?.[agent.id] || 0} leads asignados
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditModal(agent)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    if (confirm('¿Eliminar este agente?')) {
                      deleteAgent.mutate(agent.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <Button size="sm" variant="whatsapp" asChild className="flex-1">
                  <a href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`} target="_blank">
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Editar agente' : 'Nuevo agente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+595981123456"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Código de Referido (opcional)</Label>
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
                  onClick={() => setForm({ ...form, ref_code: generateRefCode(form.nombre || 'AGENT') })}
                >
                  Generar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Link: {window.location.origin}/?ref={form.ref_code || '[código]'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="hero">
                {editingAgent ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentes;
