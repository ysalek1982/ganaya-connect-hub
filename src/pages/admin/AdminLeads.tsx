import { useState, useEffect, useMemo } from 'react';
import { COUNTRY_NAMES } from '@/lib/countries';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Search, Download, Eye, Check, UserPlus, ArrowUpDown, LayoutGrid, List, MessageCircle, Filter, CalendarDays, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseUsers } from '@/hooks/useFirebaseUsers';
import LeadDetailModal from '@/components/admin/LeadDetailModal';
import { LeadsKanban } from '@/components/admin/LeadsKanban';
import { WhatsAppTemplates, buildWhatsAppUrl, type WhatsAppTemplatesConfig } from '@/components/admin/WhatsAppTemplates';
import type { FirebaseLead, LeadStatus, LeadTier } from '@/lib/firebase-types';

const AdminLeads = () => {
  const { isAdmin, isLineLeader, agentId, userData } = useFirebaseAuth();
  const { agents, createAgent } = useFirebaseUsers();
  
  const [leads, setLeads] = useState<(FirebaseLead & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPais, setFilterPais] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<LeadTier | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [filterAgente, setFilterAgente] = useState<string>('all');
  const [sortByScore, setSortByScore] = useState(false);
  const [selectedLead, setSelectedLead] = useState<(FirebaseLead & { id: string }) | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [whatsappModal, setWhatsappModal] = useState<{ open: boolean; lead: (FirebaseLead & { id: string }) | null }>({ open: false, lead: null });
  const [templates, setTemplates] = useState<WhatsAppTemplatesConfig | null>(null);

  // Load WhatsApp templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const docRef = doc(db, 'settings', 'whatsapp_templates');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTemplates(docSnap.data() as WhatsAppTemplatesConfig);
        } else {
          setTemplates({
            firstContact: 'Hola {name}, soy {agentName} de Ganaya.bet 🎰\n\nRecibimos tu postulación para ser agente. ¿Tienes 2 minutos para coordinar tu onboarding?',
            followUp: 'Hola {name} 👋\n\n¿Sigues interesado/a en iniciar como agente de Ganaya.bet? Puedo ayudarte con el paso a paso.',
            approved: '¡Genial {name}! 🎉\n\nEstás aprobado/a como agente. Te enviaré tus accesos y tu enlace de referidos en breve.',
          });
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // Subscribe to leads from Firestore
  useEffect(() => {
    const leadsRef = collection(db, 'leads');
    const unsubscribes: (() => void)[] = [];
    const leadMap = new Map<string, FirebaseLead & { id: string }>();

    const updateLeads = () => {
      const all = Array.from(leadMap.values());
      all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setLeads(all);
      setIsLoading(false);
    };

    const parseDocs = (snapshot: { docs: Array<{ id: string; data: () => any }> }) => {
      snapshot.docs.forEach(d => {
        leadMap.set(d.id, {
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || new Date(),
        } as FirebaseLead & { id: string });
      });
    };

    if (isAdmin) {
      const q = query(leadsRef, orderBy('createdAt', 'desc'));
      unsubscribes.push(onSnapshot(q, (snap) => { leadMap.clear(); parseDocs(snap); updateLeads(); }, (err) => { console.error('Admin leads error:', err); setIsLoading(false); }));
    } else if (isLineLeader && agentId) {
      // Query 1: leads assigned to this Line Leader
      const q1 = query(leadsRef, where('assignedLineLeaderId', '==', agentId), orderBy('createdAt', 'desc'));
      unsubscribes.push(onSnapshot(q1, (snap) => { parseDocs(snap); updateLeads(); }, (err) => console.warn('LL leads error:', err)));

      // Query 2: leads assigned to subagents of this Line Leader
      const subagentIds = agents?.filter(a => a.lineLeaderId === agentId).map(a => a.uid) || [];
      if (subagentIds.length > 0) {
        // Firestore 'in' supports max 30 items
        const chunks = [];
        for (let i = 0; i < subagentIds.length; i += 30) {
          chunks.push(subagentIds.slice(i, i + 30));
        }
        chunks.forEach(chunk => {
          const q2 = query(leadsRef, where('assignedAgentId', 'in', chunk));
          unsubscribes.push(onSnapshot(q2, (snap) => { parseDocs(snap); updateLeads(); }, (err) => console.warn('Subagent leads error:', err)));
        });
      }
    } else if (agentId) {
      const q = query(leadsRef, where('assignedAgentId', '==', agentId), orderBy('createdAt', 'desc'));
      unsubscribes.push(onSnapshot(q, (snap) => { leadMap.clear(); parseDocs(snap); updateLeads(); }, (err) => { console.error('Agent leads error:', err); setIsLoading(false); }));
    } else {
      setLeads([]);
      setIsLoading(false);
      return;
    }

    return () => unsubscribes.forEach(u => u());
  }, [isAdmin, isLineLeader, agentId, agents]);

  // Filter agents visible to user
  const visibleAgents = agents?.filter(agent => {
    if (isAdmin) return true;
    if (isLineLeader && agentId) {
      return agent.lineLeaderId === agentId || agent.uid === agentId;
    }
    return agent.uid === agentId;
  });

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
        await updateDoc(doc(db, 'leads', lead.id), { status: 'ONBOARDED' });
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
  const filteredLeads = useMemo(() => {
    let result = leads.filter(lead => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        (lead.contact.whatsapp && lead.contact.whatsapp.includes(search)) ||
        (lead.refCode && lead.refCode.toLowerCase().includes(search.toLowerCase()));

      const matchesPais = filterPais === 'all' || lead.country === filterPais;
      const matchesTier = filterTier === 'all' || lead.tier === filterTier;
      const matchesAgente = filterAgente === 'all' || lead.assignedAgentId === filterAgente;
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;

      // Date range filter
      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const now = new Date();
        const daysMap: Record<string, number> = { '1': 1, '7': 7, '30': 30, '90': 90 };
        const days = daysMap[filterDateRange];
        if (days) {
          const start = startOfDay(subDays(now, days));
          matchesDate = lead.createdAt >= start;
        }
      }

      return matchesSearch && matchesPais && matchesTier && matchesAgente && matchesStatus && matchesDate;
    });

    if (sortByScore) {
      result = [...result].sort((a, b) => (b.scoreTotal || 0) - (a.scoreTotal || 0));
    }

    return result;
  }, [leads, search, filterPais, filterTier, filterAgente, filterStatus, filterDateRange, sortByScore]);

  const getAgentName = (agentUid: string | null) => {
    if (!agentUid || !agents) return '-';
    const agent = agents.find(a => a.uid === agentUid);
    return agent?.name || '-';
  };

  const handleWhatsAppClick = (lead: FirebaseLead & { id: string }) => {
    setWhatsappModal({ open: true, lead });
  };

  const sendWhatsApp = (template: string) => {
    if (!whatsappModal.lead?.contact.whatsapp) {
      toast.error('Sin número de WhatsApp');
      return;
    }
    const url = buildWhatsAppUrl(
      whatsappModal.lead.contact.whatsapp,
      template,
      whatsappModal.lead.name,
      userData?.name || 'Ganaya.bet'
    );
    window.open(url, '_blank');
    setWhatsappModal({ open: false, lead: null });
  };

  const exportCSV = () => {
    const headers = ['Fecha', 'Nombre', 'País', 'Ciudad', 'WhatsApp', 'Email', 'Estado', 'Reclutador', 'Tier', 'Score', 'Ref Code', 'UTM Source', 'UTM Medium', 'UTM Campaign'];
    const rows = filteredLeads.map(l => [
      format(l.createdAt, 'dd/MM/yyyy HH:mm'),
      `"${l.name}"`,
      l.country,
      l.city || '',
      l.contact.whatsapp || '',
      l.contact.email || '',
      l.status,
      `"${getAgentName(l.assignedAgentId)}"`,
      l.tier || '',
      l.scoreTotal || 0,
      l.refCode || '',
      (l.rawJson?.utm_source as string) || '',
      (l.rawJson?.utm_medium as string) || '',
      (l.rawJson?.utm_campaign as string) || '',
    ]);
    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postulaciones-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
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
          <h1 className="font-display text-2xl md:text-3xl font-bold">Postulaciones</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Todos los candidatos a agente' : isLineLeader ? 'Postulaciones de tu red' : 'Tus postulaciones asignadas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'table')}>
            <TabsList className="h-9">
              <TabsTrigger value="kanban" className="gap-1 px-3">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-1 px-3">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as LeadStatus | 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="NUEVO">Nuevo</SelectItem>
              <SelectItem value="CONTACTADO">Contactado</SelectItem>
              <SelectItem value="APROBADO">Aprobado</SelectItem>
              <SelectItem value="ONBOARDED">Onboarded</SelectItem>
              <SelectItem value="RECHAZADO">Rechazado</SelectItem>
              <SelectItem value="DESCARTADO">Descartado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPais} onValueChange={setFilterPais}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {COUNTRY_NAMES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDateRange} onValueChange={setFilterDateRange}>
            <SelectTrigger className="w-36">
              <CalendarDays className="w-4 h-4 mr-1" />
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el tiempo</SelectItem>
              <SelectItem value="1">Hoy</SelectItem>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTier} onValueChange={(v) => setFilterTier(v as LeadTier | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tiers</SelectItem>
              <SelectItem value="PROMETEDOR">Prometedor</SelectItem>
              <SelectItem value="POTENCIAL">Potencial</SelectItem>
              <SelectItem value="NOVATO">Novato</SelectItem>
            </SelectContent>
          </Select>

          {(isAdmin || isLineLeader) && (
            <Select value={filterAgente} onValueChange={setFilterAgente}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Reclutador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los reclutadores</SelectItem>
                {visibleAgents?.map(agent => (
                  <SelectItem key={agent.uid} value={agent.uid}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {viewMode === 'table' && (
            <Button onClick={() => setSortByScore(!sortByScore)} variant="outline" size="sm" className="h-10">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortByScore ? 'Por score' : 'Por fecha'}
            </Button>
          )}

          {(filterStatus !== 'all' || filterPais !== 'all' || filterTier !== 'all' || filterAgente !== 'all' || filterDateRange !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 text-muted-foreground"
              onClick={() => {
                setFilterStatus('all');
                setFilterPais('all');
                setFilterTier('all');
                setFilterAgente('all');
                setFilterDateRange('all');
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </Button>
          )}

          <Badge variant="outline" className="h-7 ml-auto">
            {filteredLeads.length} resultado{filteredLeads.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : viewMode === 'kanban' ? (
        <LeadsKanban
          leads={filteredLeads}
          onViewLead={setSelectedLead}
          onWhatsApp={handleWhatsAppClick}
          getAgentName={getAgentName}
        />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left bg-muted/30">
                  <th className="p-4 font-semibold">Fecha</th>
                  <th className="p-4 font-semibold">País</th>
                  <th className="p-4 font-semibold">Contacto</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Reclutador</th>
                  <th className="p-4 font-semibold">Tier</th>
                  <th className="p-4 font-semibold">Score</th>
                  <th className="p-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No hay postulaciones
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-muted-foreground text-sm">
                        {format(lead.createdAt, 'dd/MM/yyyy')}
                      </td>
                      <td className="p-4">{lead.country}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.contact.whatsapp}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className={estadoBadge(lead.status)}>
                            {lead.status.toLowerCase()}
                          </Badge>
                          {lead.assignedAgentId && (
                            <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent/30">
                              asignado
                            </Badge>
                          )}
                        </div>
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
                          <Button size="sm" variant="ghost" onClick={() => handleWhatsAppClick(lead)}>
                            <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                            <Eye className="w-4 h-4" />
                          </Button>
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
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          getAgentName={getAgentName}
        />
      )}

      {/* WhatsApp Template Selector */}
      <Dialog open={whatsappModal.open} onOpenChange={(open) => setWhatsappModal({ open, lead: open ? whatsappModal.lead : null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              Contactar a {whatsappModal.lead?.name}
            </DialogTitle>
          </DialogHeader>
          {templates && (
            <WhatsAppTemplates
              mode="select"
              onTemplateSelect={sendWhatsApp}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;