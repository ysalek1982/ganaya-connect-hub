import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Eye, Copy, Plus, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseLeads, useAddFirebaseLead } from '@/hooks/useFirebaseLeads';
import { toast } from 'sonner';
import type { FirebaseLead, LeadStatus } from '@/lib/firebase-types';

const AppLeads = () => {
  const { agentId, isAdmin, isLineLeader, userData } = useFirebaseAuth();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<FirebaseLead | null>(null);
  const [newLead, setNewLead] = useState({ nombre: '', whatsapp: '', pais: 'Paraguay' });

  const { data: leads, isLoading } = useFirebaseLeads({
    agentId,
    lineLeaderId: isLineLeader ? agentId : null,
    isAdmin,
  });

  const addLeadMutation = useAddFirebaseLead();

  const handleAddLead = () => {
    addLeadMutation.mutate(
      {
        name: newLead.nombre,
        country: newLead.pais,
        contact: { whatsapp: newLead.whatsapp },
        intent: 'JUGADOR',
        refCode: userData?.refCode || null,
        scoreTotal: 0,
        tier: null,
        rawJson: {},
        status: 'NUEVO',
        assignedAgentId: agentId,
        assignedLineLeaderId: userData?.lineLeaderId || null,
        origen: 'manual_agent',
      },
      {
        onSuccess: () => {
          toast.success('Lead agregado');
          setShowAddModal(false);
          setNewLead({ nombre: '', whatsapp: '', pais: 'Paraguay' });
        },
        onError: () => toast.error('Error al agregar lead'),
      }
    );
  };

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.contact.whatsapp || '').includes(search);
    const matchesEstado = filterEstado === 'all' || lead.status.toLowerCase() === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const copyContact = (lead: FirebaseLead) => {
    navigator.clipboard.writeText(lead.contact.whatsapp || '');
    toast.success('Contacto copiado');
  };

  const openWhatsApp = (lead: FirebaseLead) => {
    const phone = (lead.contact.whatsapp || '').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const statusColor = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      'NUEVO': 'bg-primary/20 text-primary border-primary/30',
      'CONTACTADO': 'bg-gold/20 text-gold border-gold/30',
      'ASIGNADO': 'bg-accent/20 text-accent border-accent/30',
      'CERRADO': 'bg-muted text-muted-foreground',
      'DESCARTADO': 'bg-destructive/20 text-destructive border-destructive/30',
    };
    return colors[status] || colors['NUEVO'];
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
                      <span className="font-medium truncate">{lead.name}</span>
                      <Badge variant="outline" className={statusColor(lead.status)}>
                        {lead.status.toLowerCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {lead.intent?.toLowerCase() || 'cliente'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.contact.whatsapp || 'Sin WhatsApp'}
                      </span>
                      <span>{lead.country}</span>
                      <span>{format(new Date(lead.createdAt), 'dd/MM/yy')}</span>
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
              onClick={handleAddLead}
              disabled={!newLead.nombre || !newLead.whatsapp || addLeadMutation.isPending}
            >
              {addLeadMutation.isPending ? 'Agregando...' : 'Agregar'}
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
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">WhatsApp</Label>
                  <p className="font-medium">{selectedLead.contact.whatsapp || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">País</Label>
                  <p className="font-medium">{selectedLead.country}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <p className="font-medium">{selectedLead.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Intent</Label>
                  <p className="font-medium">{selectedLead.intent || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{format(new Date(selectedLead.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
              {selectedLead.refCode && (
                <div>
                  <Label className="text-muted-foreground">Ref Code</Label>
                  <code className="block mt-1 text-primary">{selectedLead.refCode}</code>
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
