import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Search, Download, Eye, Check, UserPlus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseUsers } from '@/hooks/useFirebaseUsers';
import LeadDetailModal from '@/components/admin/LeadDetailModal';
import type { FirebaseLead, LeadStatus, LeadTier, LeadIntent } from '@/lib/firebase-types';

const AdminLeads = () => {
  const { isAdmin, isLineLeader, agentId } = useFirebaseAuth();
  const { agents, createAgent } = useFirebaseUsers();
  
  const [leads, setLeads] = useState<(FirebaseLead & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPais, setFilterPais] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<LeadStatus | 'all'>('all');
  const [filterIntent, setFilterIntent] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<LeadTier | 'all'>('all');
  const [filterAgente, setFilterAgente] = useState<string>('all');
  const [sortByScore, setSortByScore] = useState(false);
  const [selectedLead, setSelectedLead] = useState<(FirebaseLead & { id: string }) | null>(null);

  // Subscribe to leads from Firestore
  useEffect(() => {
    const leadsRef = collection(db, 'leads');
    let q;

    if (isAdmin) {
      q = query(leadsRef, orderBy('createdAt', 'desc'));
    } else if (isLineLeader && agentId) {
      q = query(leadsRef, where('assignedLineLeaderId', '==', agentId), orderBy('createdAt', 'desc'));
    } else if (agentId) {
      q = query(leadsRef, where('assignedAgentId', '==', agentId), orderBy('createdAt', 'desc'));
    } else {
      setLeads([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as (FirebaseLead & { id: string })[];
      
      setLeads(leadsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching leads:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, isLineLeader, agentId]);

  // Filter agents visible to user
  const visibleAgents = agents?.filter(agent => {
    if (isAdmin) return true;
    if (isLineLeader && agentId) {
      return agent.lineLeaderId === agentId || agent.uid === agentId;
    }
    return agent.uid === agentId;
  });

  const updateEstado = async (leadId: string, status: LeadStatus) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { status });
      toast.success('Estado actualizado');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const convertToAgent = async (lead: FirebaseLead & { id: string }) => {
    try {
      const result = await createAgent({
        name: lead.name,
        email: lead.contact.email || `${lead.name.toLowerCase().replace(/\s/g, '')}@temp.com`,
        whatsapp: lead.contact.whatsapp || '',
        country: lead.country,
        city: lead.city || undefined,
      });

      if (result.success) {
        // Update lead status
        await updateDoc(doc(db, 'leads', lead.id), { status: 'CERRADO' });
        toast.success(`Agente creado con código: ${result.refCode}`);
        setSelectedLead(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error converting to agent:', error);
      toast.error(error.message || 'Error al convertir a agente');
    }
  };

  // Apply filters
  let filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.contact.whatsapp && lead.contact.whatsapp.includes(search)) ||
      (lead.refCode && lead.refCode.toLowerCase().includes(search.toLowerCase()));

    const matchesPais = filterPais === 'all' || lead.country === filterPais;
    const matchesEstado = filterEstado === 'all' || lead.status === filterEstado;
    const matchesIntent = filterIntent === 'all' || filterIntent === 'agente'; // All leads are now agents
    const matchesTier = filterTier === 'all' || lead.tier === filterTier;
    const matchesAgente = filterAgente === 'all' || lead.assignedAgentId === filterAgente;

    return matchesSearch && matchesPais && matchesEstado && matchesIntent && matchesTier && matchesAgente;
  });

  // Sort
  if (sortByScore) {
    filteredLeads = [...filteredLeads].sort((a, b) => (b.scoreTotal || 0) - (a.scoreTotal || 0));
  }

  const getAgentName = (agentUid: string | null) => {
    if (!agentUid || !agents) return '-';
    const agent = agents.find(a => a.uid === agentUid);
    return agent?.name || '-';
  };

  const exportCSV = () => {
    const headers = ['Fecha', 'Intent', 'Nombre', 'País', 'Contacto', 'Estado', 'Agente', 'Tier', 'Score'];
    const rows = filteredLeads.map(l => [
      format(l.createdAt, 'dd/MM/yyyy'),
      l.intent || '',
      l.name,
      l.country,
      l.contact.whatsapp || '',
      l.status,
      getAgentName(l.assignedAgentId),
      l.tier || '',
      l.scoreTotal || 0,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const intentBadge = (intent: LeadIntent | null) => {
    return intent === 'AGENTE' 
      ? 'bg-gold/20 text-gold border-gold/30' 
      : 'bg-primary/20 text-primary border-primary/30';
  };

  const estadoBadge = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      NUEVO: 'bg-green-500/20 text-green-400 border-green-500/30',
      CONTACTADO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      APROBADO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      RECHAZADO: 'bg-red-500/20 text-red-400 border-red-500/30',
      ONBOARDED: 'bg-primary/20 text-primary border-primary/30',
      CERRADO: 'bg-muted text-muted-foreground border-muted',
      DESCARTADO: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || colors.NUEVO;
  };

  const tierBadge = (tier: LeadTier | null) => {
    const colors: Record<LeadTier, string> = {
      PROMETEDOR: 'bg-primary/20 text-primary border-primary/30',
      POTENCIAL: 'bg-gold/20 text-gold border-gold/30',
      NOVATO: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
    };
    return tier ? colors[tier] : 'bg-muted text-muted-foreground border-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Todos los leads' : isLineLeader ? 'Leads de tu red' : 'Tus leads asignados'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setSortByScore(!sortByScore)} variant="outline" size="sm">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortByScore ? 'Por score' : 'Por fecha'}
          </Button>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, WhatsApp o ref_code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
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
              <SelectItem value="Ecuador">Ecuador</SelectItem>
              <SelectItem value="Perú">Perú</SelectItem>
              <SelectItem value="Chile">Chile</SelectItem>
              <SelectItem value="México">México</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterIntent} onValueChange={setFilterIntent}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
              <SelectItem value="agente">Agente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEstado} onValueChange={(v) => setFilterEstado(v as LeadStatus | 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="NUEVO">Nuevo</SelectItem>
              <SelectItem value="CONTACTADO">Contactado</SelectItem>
              <SelectItem value="ASIGNADO">Asignado</SelectItem>
              <SelectItem value="CERRADO">Cerrado</SelectItem>
              <SelectItem value="DESCARTADO">Descartado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTier} onValueChange={(v) => setFilterTier(v as LeadTier | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tiers</SelectItem>
              <SelectItem value="APROBABLE">Alto</SelectItem>
              <SelectItem value="POTENCIAL">Medio</SelectItem>
              <SelectItem value="NOVATO">Bajo</SelectItem>
            </SelectContent>
          </Select>

          {(isAdmin || isLineLeader) && (
            <Select value={filterAgente} onValueChange={setFilterAgente}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los agentes</SelectItem>
                {visibleAgents?.map(agent => (
                  <SelectItem key={agent.uid} value={agent.uid}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left bg-muted/30">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Intent</th>
                <th className="p-4 font-semibold">País</th>
                <th className="p-4 font-semibold">Contacto</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold">Agente</th>
                <th className="p-4 font-semibold">Tier</th>
                <th className="p-4 font-semibold">Score</th>
                <th className="p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="spinner mx-auto" />
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No hay leads
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-muted-foreground text-sm">
                      {format(lead.createdAt, 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={intentBadge(lead.intent)}>
                        {lead.intent === 'AGENTE' ? 'agente' : lead.intent === 'JUGADOR' ? 'cliente' : 'soporte'}
                      </Badge>
                    </td>
                    <td className="p-4">{lead.country}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.contact.whatsapp}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={estadoBadge(lead.status)}>
                        {lead.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {getAgentName(lead.assignedAgentId)}
                    </td>
                    <td className="p-4">
                      {lead.tier ? (
                        <Badge variant="outline" className={tierBadge(lead.tier)}>
                          {lead.tier}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      <span className="font-display font-bold text-primary">
                        {lead.scoreTotal || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {lead.status === 'NUEVO' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateEstado(lead.id, 'CONTACTADO')}
                          >
                            <Check className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                        {isAdmin && lead.tier === 'PROMETEDOR' && lead.status !== 'ONBOARDED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => convertToAgent(lead)}
                          >
                            <UserPlus className="w-4 h-4 text-gold" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          getAgentName={getAgentName}
        />
      )}
    </div>
  );
};

export default AdminLeads;
