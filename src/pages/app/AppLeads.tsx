import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Eye, Copy, Plus, Phone, MessageCircle, ChevronDown, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseLeads, useAddFirebaseLead, useUpdateFirebaseLead } from '@/hooks/useFirebaseLeads';
import { toast } from 'sonner';
import type { FirebaseLead, LeadStatus } from '@/lib/firebase-types';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'NUEVO', label: 'Nuevo', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: 'CONTACTADO', label: 'Contactado', color: 'bg-gold/20 text-gold border-gold/30' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'ONBOARDED', label: 'Onboarded', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'DESCARTADO', label: 'Descartado', color: 'bg-muted text-muted-foreground' },
];

const getStatusConfig = (status: LeadStatus) =>
  STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

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
  const updateLeadMutation = useUpdateFirebaseLead();

  const handleAddLead = () => {
    addLeadMutation.mutate(
      {
        name: newLead.nombre,
        country: newLead.pais,
        contact: { whatsapp: newLead.whatsapp },
        intent: 'AGENTE',
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
          toast.success('Postulación agregada');
          setShowAddModal(false);
          setNewLead({ nombre: '', whatsapp: '', pais: 'Paraguay' });
        },
        onError: () => toast.error('Error al agregar postulación'),
      }
    );
  };

  const handleStatusChange = (lead: FirebaseLead, newStatus: LeadStatus) => {
    updateLeadMutation.mutate(
      { id: lead.id, data: { status: newStatus } },
      {
        onSuccess: () => toast.success(`Estado actualizado a ${getStatusConfig(newStatus).label}`),
        onError: () => toast.error('Error al actualizar estado'),
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

  // Count by status for summary
  const statusCounts = leads
    ? STATUS_OPTIONS.reduce((acc, s) => {
        acc[s.value] = leads.filter(l => l.status === s.value).length;
        return acc;
      }, {} as Record<string, number>)
    : {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Mis Postulaciones</h1>
          <p className="text-muted-foreground">Candidatos a agente capturados con tu link</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="hero" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar manual
        </Button>
      </div>

      {/* Status summary chips */}
      {!isLoading && leads && leads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterEstado('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterEstado === 'all'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            Todos ({leads.length})
          </button>
          {STATUS_OPTIONS.filter(s => statusCounts[s.value] > 0).map(s => (
            <button
              key={s.value}
              onClick={() => setFilterEstado(s.value.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterEstado === s.value.toLowerCase()
                  ? 'bg-foreground text-background border-foreground'
                  : `bg-card border-border text-muted-foreground hover:border-primary/50`
              }`}
            >
              {s.label} ({statusCounts[s.value]})
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Leads List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : filteredLeads?.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              {leads?.length === 0
                ? 'No hay postulaciones aún. ¡Comparte tu link para reclutar agentes!'
                : 'No hay resultados para esta búsqueda.'}
            </CardContent>
          </Card>
        ) : (
          filteredLeads?.map(lead => {
            const statusCfg = getStatusConfig(lead.status);
            return (
              <Card key={lead.id} className="glass-card hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar initial */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-medium text-sm truncate">{lead.name}</span>
                        {lead.tier && (
                          <Badge variant="outline" className="text-xs h-4 px-1.5">
                            {lead.tier.toLowerCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {lead.contact.whatsapp && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.contact.whatsapp}
                          </span>
                        )}
                        <span>{lead.country}</span>
                        <span>{format(new Date(lead.createdAt), 'dd/MM/yy')}</span>
                      </div>
                    </div>

                    {/* Status dropdown (inline change) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80 ${statusCfg.color}`}
                          disabled={updateLeadMutation.isPending}
                        >
                          {statusCfg.label}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {STATUS_OPTIONS.map(opt => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={() => handleStatusChange(lead, opt.value)}
                            className={lead.status === opt.value ? 'font-semibold' : ''}
                          >
                            <span className={`w-2 h-2 rounded-full mr-2 ${opt.color.split(' ')[0]}`} />
                            {opt.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      {lead.contact.whatsapp && (
                        <>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyContact(lead)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openWhatsApp(lead)}>
                            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedLead(lead)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar postulación manual</DialogTitle>
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
                  {['Paraguay', 'Argentina', 'Chile', 'Colombia', 'Ecuador', 'México', 'USA'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
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
            <DialogTitle>Detalle de Postulación</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-2">
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedLead.name}</p>
                  <Badge variant="outline" className={`text-xs ${getStatusConfig(selectedLead.status).color}`}>
                    {getStatusConfig(selectedLead.status).label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">WhatsApp</p>
                  <p className="font-medium">{selectedLead.contact.whatsapp || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">País</p>
                  <p className="font-medium">{selectedLead.country}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Tier</p>
                  <p className="font-medium capitalize">{selectedLead.tier?.toLowerCase() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Score</p>
                  <p className="font-medium">{selectedLead.scoreTotal || 0} pts</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Origen</p>
                  <p className="font-medium capitalize">{selectedLead.origen?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Fecha</p>
                  <p className="font-medium">{format(new Date(selectedLead.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>

              {selectedLead.refCode && (
                <div className="pt-2 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-0.5">Ref Code</p>
                  <code className="text-primary font-mono">{selectedLead.refCode}</code>
                </div>
              )}

              {/* Quick actions */}
              {selectedLead.contact.whatsapp && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => openWhatsApp(selectedLead)}
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    Abrir WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => copyContact(selectedLead)}
                  >
                    <Copy className="w-4 h-4" />
                    Copiar número
                  </Button>
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
