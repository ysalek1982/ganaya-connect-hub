import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Search, Users, Link, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseUsers, type CreateAgentResult } from '@/hooks/useFirebaseUsers';
import AgentLinkModal from '@/components/admin/AgentLinkModal';
import AgentCreatedModal from '@/components/admin/AgentCreatedModal';
import type { FirebaseUser } from '@/lib/firebase-types';

interface AgentForm {
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  city: string;
  isActive: boolean;
  lineLeaderId: string;
  canRecruitSubagents: boolean;
}

const AdminAgentesNew = () => {
  const { isAdmin, isLineLeader, agentId } = useFirebaseAuth();
  const { agents, lineLeaders, isLoading, createAgent, updateAgent, deleteAgent, getLeadCount } = useFirebaseUsers();
  
  const [search, setSearch] = useState('');
  const [filterPais, setFilterPais] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterLineLeader, setFilterLineLeader] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [createdAgentData, setCreatedAgentData] = useState<{
    email: string;
    tempPassword: string;
    refCode: string;
    referralUrl: string;
  } | null>(null);
  const [selectedAgentForLink, setSelectedAgentForLink] = useState<{ name: string; refCode: string } | null>(null);
  const [editingAgent, setEditingAgent] = useState<FirebaseUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<AgentForm>({
    name: '',
    email: '',
    whatsapp: '',
    country: 'Paraguay',
    city: '',
    isActive: true,
    lineLeaderId: '',
    canRecruitSubagents: false,
  });

  const openLinkModal = (agent: FirebaseUser) => {
    if (agent.refCode) {
      setSelectedAgentForLink({ name: agent.name, refCode: agent.refCode });
      setShowLinkModal(true);
    } else {
      toast.error('Este agente no tiene código de referido');
    }
  };

  const copyRefLink = (refCode: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?ref=${refCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de referido copiado');
  };

  const openCreateModal = () => {
    setEditingAgent(null);
    setForm({
      name: '',
      email: '',
      whatsapp: '',
      country: 'Paraguay',
      city: '',
      isActive: true,
      lineLeaderId: isLineLeader && agentId ? agentId : '',
      canRecruitSubagents: false,
    });
    setShowModal(true);
  };

  const openEditModal = (agent: FirebaseUser) => {
    setEditingAgent(agent);
    setForm({
      name: agent.name,
      email: agent.email,
      whatsapp: agent.whatsapp || '',
      country: agent.country,
      city: agent.city || '',
      isActive: agent.isActive,
      lineLeaderId: agent.lineLeaderId || '',
      canRecruitSubagents: agent.canRecruitSubagents,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingAgent) {
        // Update existing agent
        await updateAgent(editingAgent.uid, {
          name: form.name,
          whatsapp: form.whatsapp || null,
          country: form.country,
          city: form.city || null,
          isActive: form.isActive,
          lineLeaderId: form.lineLeaderId || null,
          canRecruitSubagents: form.canRecruitSubagents,
        });
        toast.success('Agente actualizado');
        closeModal();
      } else {
        // Create new agent via Edge Function
        const result: CreateAgentResult = await createAgent({
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp || undefined,
          country: form.country,
          city: form.city || undefined,
          lineLeaderId: form.lineLeaderId || undefined,
          canRecruitSubagents: form.canRecruitSubagents,
        });
        
        if (result.success && result.tempPassword && result.refCode && result.referralUrl && result.email) {
          // Show the created modal with temp password
          setCreatedAgentData({
            email: result.email,
            tempPassword: result.tempPassword,
            refCode: result.refCode,
            referralUrl: result.referralUrl,
          });
          closeModal();
          setShowCreatedModal(true);
        } else {
          throw new Error(result.error || 'Error al crear agente');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('¿Eliminar este agente?')) return;
    
    try {
      await deleteAgent(uid);
      toast.success('Agente eliminado');
    } catch (error) {
      toast.error('Error al eliminar agente');
    }
  };

  const getLineLeaderName = (id: string | null) => {
    if (!id) return '-';
    const leader = lineLeaders?.find(a => a.uid === id);
    return leader?.name || '-';
  };

  // Filter agents based on role and filters
  const filteredAgentes = agents?.filter(a => {
    // Role-based filtering
    if (isLineLeader && agentId) {
      if (a.lineLeaderId !== agentId && a.uid !== agentId) return false;
    }

    // Search
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.whatsapp && a.whatsapp.includes(search)) ||
      a.country.toLowerCase().includes(search.toLowerCase()) ||
      (a.refCode && a.refCode.toLowerCase().includes(search.toLowerCase()));

    // Filters
    const matchesPais = filterPais === 'all' || a.country === filterPais;
    const matchesEstado = filterEstado === 'all' || 
      (filterEstado === 'activo' ? a.isActive : !a.isActive);
    const matchesLeader = filterLineLeader === 'all' || a.lineLeaderId === filterLineLeader;

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
              {lineLeaders?.filter(ll => ll.uid !== editingAgent?.uid).map(ll => (
                <SelectItem key={ll.uid} value={ll.uid}>{ll.name}</SelectItem>
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
                <TableRow key={agent.uid}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.whatsapp || agent.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{agent.country}</TableCell>
                  <TableCell>
                    <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                      {agent.isActive ? 'activo' : 'inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getLineLeaderName(agent.lineLeaderId)}</TableCell>
                  <TableCell>
                    {agent.refCode ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-primary/10 px-2 py-1 rounded text-primary font-mono">
                          {agent.refCode}
                        </code>
                        <Button size="sm" variant="ghost" onClick={() => copyRefLink(agent.refCode!)}>
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
                      {getLeadCount(agent.uid)}
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
                          onClick={() => handleDelete(agent.uid)}
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
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              {!editingAgent && (
                <div className="space-y-2 col-span-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="agente@email.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Se enviará un email para establecer contraseña
                  </p>
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label>WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+595981123456"
                  required={!editingAgent}
                />
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
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
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select 
                  value={form.isActive ? 'activo' : 'inactivo'} 
                  onValueChange={(v) => setForm({ ...form, isActive: v === 'activo' })}
                >
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
                  <Select 
                    value={form.lineLeaderId || "none"} 
                    onValueChange={(v) => setForm({ ...form, lineLeaderId: v === "none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {lineLeaders?.filter(ll => ll.uid !== editingAgent?.uid).map(ll => (
                        <SelectItem key={ll.uid} value={ll.uid}>{ll.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="canRecruit"
                  checked={form.canRecruitSubagents}
                  onChange={(e) => setForm({ ...form, canRecruitSubagents: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="canRecruit" className="cursor-pointer">
                  Puede reclutar subagentes
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingAgent ? 'Actualizar' : 'Crear agente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link/QR Modal */}
      <AgentLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        agentName={selectedAgentForLink?.name || ''}
        refCode={selectedAgentForLink?.refCode || ''}
      />

      {/* Agent Created Modal - shows temp password */}
      <AgentCreatedModal
        isOpen={showCreatedModal}
        onClose={() => {
          setShowCreatedModal(false);
          setCreatedAgentData(null);
        }}
        agentData={createdAgentData}
      />
    </div>
  );
};

export default AdminAgentesNew;
