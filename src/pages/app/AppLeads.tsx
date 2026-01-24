import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Eye, Copy, Plus, Phone, MessageCircle } from 'lucide-react';
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

type Lead = Database['public']['Tables']['leads']['Row'];

const AppLeads = () => {
  const queryClient = useQueryClient();
  const { agentId, isAdmin, isLineLeader } = useUserRole();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState({ nombre: '', whatsapp: '', pais: 'Paraguay' });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['app-leads', agentId],
    queryFn: async () => {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      if (!isAdmin) {
        query = query.eq('asignado_agente_id', agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!agentId || isAdmin,
  });

  const addLead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('leads').insert({
        nombre: newLead.nombre,
        whatsapp: newLead.whatsapp,
        pais: newLead.pais,
        tipo: 'cliente',
        origen: 'manual_agent',
        asignado_agente_id: agentId,
        estado: 'nuevo',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-leads'] });
      toast.success('Lead agregado');
      setShowAddModal(false);
      setNewLead({ nombre: '', whatsapp: '', pais: 'Paraguay' });
    },
    onError: () => toast.error('Error al agregar lead'),
  });

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = 
      lead.nombre.toLowerCase().includes(search.toLowerCase()) ||
      lead.whatsapp.includes(search);
    const matchesEstado = filterEstado === 'all' || lead.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const copyContact = (lead: Lead) => {
    navigator.clipboard.writeText(lead.whatsapp);
    toast.success('Contacto copiado');
  };

  const openWhatsApp = (lead: Lead) => {
    window.open(`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const statusColor = (estado: string | null) => {
    const colors: Record<string, string> = {
      nuevo: 'bg-primary/20 text-primary border-primary/30',
      contactado: 'bg-gold/20 text-gold border-gold/30',
      asignado: 'bg-accent/20 text-accent border-accent/30',
      cerrado: 'bg-muted text-muted-foreground',
      descartado: 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return colors[estado || 'nuevo'];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Mis Leads</h1>
          <p className="text-muted-foreground">Jugadores y prospectos capturados</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="hero" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar jugador
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="nuevo">Nuevo</SelectItem>
            <SelectItem value="contactado">Contactado</SelectItem>
            <SelectItem value="asignado">Asignado</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : filteredLeads?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay leads aún. ¡Comparte tu link para capturar jugadores!
            </CardContent>
          </Card>
        ) : (
          filteredLeads?.map(lead => (
            <Card key={lead.id} className="glass-card hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{lead.nombre}</span>
                      <Badge variant="outline" className={statusColor(lead.estado)}>
                        {lead.estado || 'nuevo'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {lead.tipo}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.whatsapp}
                      </span>
                      <span>{lead.pais}</span>
                      <span>{format(new Date(lead.created_at), 'dd/MM/yy')}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => copyContact(lead)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openWhatsApp(lead)}>
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar jugador manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newLead.nombre}
                onChange={(e) => setNewLead({ ...newLead, nombre: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={newLead.whatsapp}
                onChange={(e) => setNewLead({ ...newLead, whatsapp: e.target.value })}
                placeholder="+59891234567"
              />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Select value={newLead.pais} onValueChange={(v) => setNewLead({ ...newLead, pais: v })}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button 
              variant="hero" 
              onClick={() => addLead.mutate()}
              disabled={!newLead.nombre || !newLead.whatsapp}
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{selectedLead.nombre}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">WhatsApp</Label>
                  <p className="font-medium">{selectedLead.whatsapp}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">País</Label>
                  <p className="font-medium">{selectedLead.pais}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <p className="font-medium">{selectedLead.estado}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{selectedLead.tipo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{format(new Date(selectedLead.created_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
              {selectedLead.ref_code && (
                <div>
                  <Label className="text-muted-foreground">Ref Code</Label>
                  <code className="block mt-1 text-primary">{selectedLead.ref_code}</code>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppLeads;
