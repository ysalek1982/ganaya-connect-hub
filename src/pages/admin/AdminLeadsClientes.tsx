import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Download, Eye, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadStatus = Database['public']['Enums']['lead_status'];
type Agente = Database['public']['Tables']['agentes']['Row'];

const AdminLeadsClientes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPais, setFilterPais] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<LeadStatus | 'all'>('all');
  const [filterAgente, setFilterAgente] = useState<string>('all');
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
    queryKey: ['leads-clientes', filterPais, filterEstado, filterAgente],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('tipo', 'cliente')
        .order('created_at', { ascending: false });

      if (filterPais !== 'all') query = query.eq('pais', filterPais);
      if (filterEstado !== 'all') query = query.eq('estado', filterEstado);
      if (filterAgente !== 'all') query = query.eq('asignado_agente_id', filterAgente);

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ estado: estado as Database['public']['Enums']['lead_status'] })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-clientes'] });
      toast.success('Estado actualizado');
    },
  });

  const filteredLeads = leads?.filter(lead => 
    lead.nombre.toLowerCase().includes(search.toLowerCase()) ||
    lead.whatsapp.includes(search) ||
    (lead.ref_code && lead.ref_code.toLowerCase().includes(search.toLowerCase()))
  );

  // Get agent name by ID
  const getAgentName = (agentId: string | null) => {
    if (!agentId || !agentes) return '-';
    const agent = agentes.find(a => a.id === agentId);
    return agent?.nombre || '-';
  };

  const exportCSV = () => {
    if (!filteredLeads) return;
    const headers = ['Nombre', 'WhatsApp', 'País', 'Ciudad', 'Email', 'Estado', 'Ref Code', 'Agente Asignado', 'Fecha'];
    const rows = filteredLeads.map(l => [
      l.nombre, l.whatsapp, l.pais, l.ciudad || '', l.email || '', l.estado || '', 
      l.ref_code || '', getAgentName(l.asignado_agente_id),
      format(new Date(l.created_at), 'dd/MM/yyyy')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-clientes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const estadoBadge = (estado: string | null) => {
    const colors: Record<string, string> = {
      nuevo: 'badge-success',
      contactado: 'badge-warning',
      asignado: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      cerrado: 'bg-muted text-muted-foreground',
      descartado: 'badge-danger',
    };
    return colors[estado || 'nuevo'] || 'badge-success';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Leads Clientes</h1>
          <p className="text-muted-foreground">Apostadores interesados</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
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
        <Select value={filterEstado} onValueChange={(v) => setFilterEstado(v as LeadStatus | 'all')}>
          <SelectTrigger className="w-full md:w-40">
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
        <Select value={filterAgente} onValueChange={setFilterAgente}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Agente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los agentes</SelectItem>
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
                <th className="p-4 font-semibold">WhatsApp</th>
                <th className="p-4 font-semibold">País</th>
                <th className="p-4 font-semibold">Ref Code</th>
                <th className="p-4 font-semibold">Agente</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="spinner mx-auto" />
                  </td>
                </tr>
              ) : filteredLeads?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No hay leads
                  </td>
                </tr>
              ) : (
                filteredLeads?.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{lead.nombre}</td>
                    <td className="p-4 text-muted-foreground">{lead.whatsapp}</td>
                    <td className="p-4">{lead.pais}</td>
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
                          <User className="w-3 h-3 text-primary" />
                          <span className="text-sm">{getAgentName(lead.asignado_agente_id)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge(lead.estado)}`}>
                        {lead.estado || 'nuevo'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
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
            <DialogTitle>Detalle del Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Nombre:</span><p className="font-medium">{selectedLead.nombre}</p></div>
                <div><span className="text-muted-foreground">WhatsApp:</span><p className="font-medium">{selectedLead.whatsapp}</p></div>
                <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{selectedLead.email || '-'}</p></div>
                <div><span className="text-muted-foreground">País:</span><p className="font-medium">{selectedLead.pais}</p></div>
                <div><span className="text-muted-foreground">Ciudad:</span><p className="font-medium">{selectedLead.ciudad || '-'}</p></div>
                <div><span className="text-muted-foreground">Apostó antes:</span><p className="font-medium">{selectedLead.aposto_antes ? 'Sí' : 'No'}</p></div>
                <div><span className="text-muted-foreground">Ref Code:</span><p className="font-medium font-mono">{selectedLead.ref_code || '-'}</p></div>
                <div><span className="text-muted-foreground">Agente Asignado:</span><p className="font-medium">{getAgentName(selectedLead.asignado_agente_id)}</p></div>
                <div><span className="text-muted-foreground">UTM Source:</span><p className="font-medium">{selectedLead.utm_source || '-'}</p></div>
                <div><span className="text-muted-foreground">UTM Campaign:</span><p className="font-medium">{selectedLead.utm_campaign || '-'}</p></div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="whatsapp" size="sm" asChild>
                  <a href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`} target="_blank">
                    Abrir WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeadsClientes;
