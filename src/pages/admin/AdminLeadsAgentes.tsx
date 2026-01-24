import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Download, Eye, UserPlus, ArrowUpDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];
type ScoreLabel = Database['public']['Enums']['score_label'];
type Agente = Database['public']['Tables']['agentes']['Row'];

const AdminLeadsAgentes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterEtiqueta, setFilterEtiqueta] = useState<ScoreLabel | 'all'>('all');
  const [filterPais, setFilterPais] = useState<string>('all');
  const [filterAgente, setFilterAgente] = useState<string>('all');
  const [sortByScore, setSortByScore] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch agents for filter dropdown
  const { data: agentes } = useQuery({
    queryKey: ['agentes-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes')
        .select('id, nombre, ref_code')
        .eq('estado', 'activo')
        .order('nombre');
      if (error) throw error;
      return data as Agente[];
    },
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads-agentes', filterEtiqueta, filterPais, filterAgente, sortByScore],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('tipo', 'agente')
        .order(sortByScore ? 'score' : 'created_at', { ascending: false });

      if (filterEtiqueta !== 'all') query = query.eq('etiqueta', filterEtiqueta);
      if (filterPais !== 'all') query = query.eq('pais', filterPais);
      if (filterAgente !== 'all') query = query.eq('asignado_agente_id', filterAgente);

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  const convertToAgent = useMutation({
    mutationFn: async (lead: Lead) => {
      // Generate a unique ref_code based on name
      const baseCode = lead.nombre.substring(0, 4).toUpperCase().replace(/\s/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const refCode = `${baseCode}${randomSuffix}`;

      // Create agent with ref_code
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

      // Update lead status
      const { error: leadError } = await supabase
        .from('leads')
        .update({ estado: 'cerrado' })
        .eq('id', lead.id);
      if (leadError) throw leadError;

      return refCode;
    },
    onSuccess: (refCode) => {
      queryClient.invalidateQueries({ queryKey: ['leads-agentes'] });
      queryClient.invalidateQueries({ queryKey: ['agentes'] });
      toast.success(`Agente creado con código: ${refCode}`);
      setSelectedLead(null);
    },
    onError: () => {
      toast.error('Error al crear agente');
    },
  });

  // Get agent name by ID
  const getAgentName = (agentId: string | null) => {
    if (!agentId || !agentes) return '-';
    const agent = agentes.find(a => a.id === agentId);
    return agent?.nombre || '-';
  };

  const filteredLeads = leads?.filter(lead => 
    lead.nombre.toLowerCase().includes(search.toLowerCase()) ||
    lead.whatsapp.includes(search) ||
    (lead.ref_code && lead.ref_code.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    if (!filteredLeads) return;
    const headers = ['Nombre', 'WhatsApp', 'País', 'Score', 'Etiqueta', 'Binance', 'Banca', 'Horas/día', 'Ref Code', 'Agente', 'Fecha'];
    const rows = filteredLeads.map(l => [
      l.nombre, l.whatsapp, l.pais, l.score || 0, l.etiqueta || '', 
      l.binance_verificada ? 'Sí' : 'No', l.banca_300 ? 'Sí' : 'No',
      l.horas_dia || '', l.ref_code || '', getAgentName(l.asignado_agente_id),
      format(new Date(l.created_at), 'dd/MM/yyyy')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-agentes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const etiquetaBadge = (etiqueta: string | null) => {
    const colors: Record<string, string> = {
      'AGENTE_POTENCIAL_ALTO': 'badge-success',
      'AGENTE_POTENCIAL_MEDIO': 'badge-warning',
      'AGENTE_POTENCIAL_BAJO': 'badge-danger',
      'CLIENTE': 'bg-muted text-muted-foreground',
      'NO_PRIORITARIO': 'bg-muted text-muted-foreground',
    };
    return colors[etiqueta || ''] || 'badge-success';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Leads Agentes</h1>
          <p className="text-muted-foreground">Postulantes a agentes con scoring</p>
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
        <Select value={filterEtiqueta} onValueChange={(v) => setFilterEtiqueta(v as ScoreLabel | 'all')}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Etiqueta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las etiquetas</SelectItem>
            <SelectItem value="AGENTE_POTENCIAL_ALTO">Alto potencial</SelectItem>
            <SelectItem value="AGENTE_POTENCIAL_MEDIO">Medio potencial</SelectItem>
            <SelectItem value="AGENTE_POTENCIAL_BAJO">Bajo potencial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPais} onValueChange={setFilterPais}>
          <SelectTrigger className="w-full md:w-40">
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
        <Select value={filterAgente} onValueChange={setFilterAgente}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Referido por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {agentes?.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.nombre} {agent.ref_code ? `(${agent.ref_code})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-hover">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">País</th>
                <th className="p-4 font-semibold">Score</th>
                <th className="p-4 font-semibold">Etiqueta</th>
                <th className="p-4 font-semibold">Ref Code</th>
                <th className="p-4 font-semibold">Referido por</th>
                <th className="p-4 font-semibold">Binance</th>
                <th className="p-4 font-semibold">Fecha</th>
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
                  <tr key={lead.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{lead.nombre}</td>
                    <td className="p-4">{lead.pais}</td>
                    <td className="p-4">
                      <span className="font-display font-bold text-primary">{lead.score || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${etiquetaBadge(lead.etiqueta)}`}>
                        {lead.etiqueta?.replace(/_/g, ' ') || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      {lead.ref_code ? (
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">
                          {lead.ref_code}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {lead.asignado_agente_id ? (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gold" />
                          <span className="text-sm">{getAgentName(lead.asignado_agente_id)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Directo</span>
                      )}
                    </td>
                    <td className="p-4">
                      {lead.binance_verificada ? '✅' : '❌'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {lead.etiqueta?.includes('ALTO') && lead.estado !== 'cerrado' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => convertToAgent.mutate(lead)}
                          >
                            <UserPlus className="w-4 h-4 text-primary" />
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

      {/* Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Postulante</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Nombre:</span><p className="font-medium">{selectedLead.nombre}</p></div>
                <div><span className="text-muted-foreground">Edad:</span><p className="font-medium">{selectedLead.edad || '-'}</p></div>
                <div><span className="text-muted-foreground">WhatsApp:</span><p className="font-medium">{selectedLead.whatsapp}</p></div>
                <div><span className="text-muted-foreground">País:</span><p className="font-medium">{selectedLead.pais}</p></div>
                <div><span className="text-muted-foreground">Ciudad:</span><p className="font-medium">{selectedLead.ciudad || '-'}</p></div>
                <div><span className="text-muted-foreground">Score:</span><p className="font-medium text-primary font-display text-xl">{selectedLead.score}</p></div>
                <div><span className="text-muted-foreground">Ref Code:</span><p className="font-medium font-mono">{selectedLead.ref_code || '-'}</p></div>
                <div><span className="text-muted-foreground">Referido por:</span><p className="font-medium">{getAgentName(selectedLead.asignado_agente_id)}</p></div>
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-2">Requisitos</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Binance verificada: {selectedLead.binance_verificada ? '✅' : '❌'}</p>
                  <p>Banca $300: {selectedLead.banca_300 ? '✅' : '❌'}</p>
                  <p>P2P: {selectedLead.p2p_nivel || '-'}</p>
                  <p>Horas/día: {selectedLead.horas_dia || '-'}</p>
                  <p>Exp casinos: {selectedLead.exp_casinos ? '✅' : '❌'}</p>
                  <p>Exp atención: {selectedLead.exp_atencion ? '✅' : '❌'}</p>
                  <p>Quiere empezar: {selectedLead.quiere_empezar ? '✅' : '❌'}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="whatsapp" size="sm" asChild>
                  <a href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`} target="_blank">
                    WhatsApp
                  </a>
                </Button>
                {selectedLead.etiqueta?.includes('ALTO') && selectedLead.estado !== 'cerrado' && (
                  <Button variant="hero" size="sm" onClick={() => convertToAgent.mutate(selectedLead)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convertir a agente
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeadsAgentes;
