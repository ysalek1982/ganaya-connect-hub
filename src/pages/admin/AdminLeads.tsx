import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Download, Eye, Check, UserPlus, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import LeadDetailModal from '@/components/admin/LeadDetailModal';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadStatus = Database['public']['Enums']['lead_status'];
type ScoreLabel = Database['public']['Enums']['score_label'];
type Agente = Database['public']['Tables']['agentes']['Row'];

const AdminLeads = () => {
  const queryClient = useQueryClient();
  const { isAdmin, isLineLeader, agentId } = useUserRole();
  
  const [search, setSearch] = useState('');
  const [filterPais, setFilterPais] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<LeadStatus | 'all'>('all');
  const [filterIntent, setFilterIntent] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<ScoreLabel | 'all'>('all');
  const [filterAgente, setFilterAgente] = useState<string>('all');
  const [sortByScore, setSortByScore] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch agents for filter dropdown
  const { data: agentes } = useQuery({
    queryKey: ['agentes-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes')
        .select('id, nombre, ref_code, line_leader_id')
        .eq('estado', 'activo')
        .order('nombre');
      if (error) throw error;
      return data as (Agente & { line_leader_id: string | null })[];
    },
  });

  // Filter agents based on role
  const visibleAgents = agentes?.filter(agent => {
    if (isAdmin) return true;
    if (isLineLeader && agentId) {
      return agent.line_leader_id === agentId || agent.id === agentId;
    }
    return agent.id === agentId;
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads-unified', filterPais, filterEstado, filterIntent, filterTier, filterAgente, sortByScore],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .order(sortByScore ? 'score' : 'created_at', { ascending: false });

      if (filterPais !== 'all') query = query.eq('pais', filterPais);
      if (filterEstado !== 'all') query = query.eq('estado', filterEstado);
      if (filterIntent !== 'all') query = query.eq('tipo', filterIntent);
      if (filterTier !== 'all') query = query.eq('etiqueta', filterTier);
      if (filterAgente !== 'all') query = query.eq('asignado_agente_id', filterAgente);

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: LeadStatus }) => {
      const { error } = await supabase.from('leads').update({ estado }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-unified'] });
      toast.success('Estado actualizado');
    },
  });

  const convertToAgent = useMutation({
    mutationFn: async (lead: Lead) => {
      const baseCode = lead.nombre.substring(0, 4).toUpperCase().replace(/\s/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const refCode = `${baseCode}${randomSuffix}`;

      const { error: agentError } = await supabase
        .from('agentes')
        .insert({
          nombre: lead.nombre,
          whatsapp: lead.whatsapp,
          pais: lead.pais,
          ciudad: lead.ciudad || undefined,
          estado: 'activo',
          ref_code: refCode,
        });
      if (agentError) throw agentError;

      const { error: leadError } = await supabase
        .from('leads')
        .update({ estado: 'cerrado' })
        .eq('id', lead.id);
      if (leadError) throw leadError;

      return refCode;
    },
    onSuccess: (refCode) => {
      queryClient.invalidateQueries({ queryKey: ['leads-unified'] });
      queryClient.invalidateQueries({ queryKey: ['agentes'] });
      toast.success(`Agente creado con código: ${refCode}`);
      setSelectedLead(null);
    },
  });

  const filteredLeads = leads?.filter(lead =>
    lead.nombre.toLowerCase().includes(search.toLowerCase()) ||
    lead.whatsapp.includes(search) ||
    (lead.ref_code && lead.ref_code.toLowerCase().includes(search.toLowerCase()))
  );

  const getAgentName = (agentId: string | null) => {
    if (!agentId || !agentes) return '-';
    const agent = agentes.find(a => a.id === agentId);
    return agent?.nombre || '-';
  };

  const exportCSV = () => {
    if (!filteredLeads) return;
    const headers = ['Fecha', 'Intent', 'Nombre', 'País', 'Contacto', 'Estado', 'Agente', 'Tier', 'Score'];
    const rows = filteredLeads.map(l => [
      format(new Date(l.created_at), 'dd/MM/yyyy'),
      l.tipo,
      l.nombre,
      l.pais,
      l.whatsapp,
      l.estado || '',
      getAgentName(l.asignado_agente_id),
      l.etiqueta || '',
      l.score || 0,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const intentBadge = (tipo: string) => {
    return tipo === 'agente' 
      ? 'bg-gold/20 text-gold border-gold/30' 
      : 'bg-primary/20 text-primary border-primary/30';
  };

  const estadoBadge = (estado: string | null) => {
    const colors: Record<string, string> = {
      nuevo: 'bg-green-500/20 text-green-400 border-green-500/30',
      contactado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      asignado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cerrado: 'bg-muted text-muted-foreground border-muted',
      descartado: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[estado || 'nuevo'] || colors.nuevo;
  };

  const tierBadge = (etiqueta: string | null) => {
    const colors: Record<string, string> = {
      'AGENTE_POTENCIAL_ALTO': 'bg-primary/20 text-primary border-primary/30',
      'AGENTE_POTENCIAL_MEDIO': 'bg-gold/20 text-gold border-gold/30',
      'AGENTE_POTENCIAL_BAJO': 'bg-orange-400/20 text-orange-400 border-orange-400/30',
      'CLIENTE': 'bg-muted text-muted-foreground border-muted',
    };
    return colors[etiqueta || ''] || 'bg-muted text-muted-foreground border-muted';
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
              <SelectItem value="nuevo">Nuevo</SelectItem>
              <SelectItem value="contactado">Contactado</SelectItem>
              <SelectItem value="asignado">Asignado</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
              <SelectItem value="descartado">Descartado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTier} onValueChange={(v) => setFilterTier(v as ScoreLabel | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tiers</SelectItem>
              <SelectItem value="AGENTE_POTENCIAL_ALTO">Alto</SelectItem>
              <SelectItem value="AGENTE_POTENCIAL_MEDIO">Medio</SelectItem>
              <SelectItem value="AGENTE_POTENCIAL_BAJO">Bajo</SelectItem>
              <SelectItem value="CLIENTE">Cliente</SelectItem>
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
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.nombre}
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
              ) : filteredLeads?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No hay leads
                  </td>
                </tr>
              ) : (
                filteredLeads?.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-muted-foreground text-sm">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={intentBadge(lead.tipo)}>
                        {lead.tipo}
                      </Badge>
                    </td>
                    <td className="p-4">{lead.pais}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{lead.nombre}</p>
                        <p className="text-sm text-muted-foreground">{lead.whatsapp}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={estadoBadge(lead.estado)}>
                        {lead.estado || 'nuevo'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {getAgentName(lead.asignado_agente_id)}
                    </td>
                    <td className="p-4">
                      {lead.etiqueta ? (
                        <Badge variant="outline" className={tierBadge(lead.etiqueta)}>
                          {lead.etiqueta.split('_').pop()}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      <span className="font-display font-bold text-primary">
                        {lead.score || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {lead.estado === 'nuevo' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateEstado.mutate({ id: lead.id, estado: 'contactado' })}
                          >
                            <Check className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                        {isAdmin && lead.tipo === 'agente' && lead.etiqueta?.includes('ALTO') && lead.estado !== 'cerrado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => convertToAgent.mutate(lead)}
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

      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        getAgentName={getAgentName}
      />
    </div>
  );
};

export default AdminLeads;
