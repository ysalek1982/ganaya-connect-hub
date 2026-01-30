import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Users, MapPin, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];
type Agente = Database['public']['Tables']['agentes']['Row'];

const AdminAsignacion = () => {
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Fetch unassigned leads
  const { data: leadsData, isLoading: loadingLeads } = useQuery({
    queryKey: ['unassigned-leads', selectedCountry],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .is('asignado_agente_id', null)
        .in('estado', ['nuevo', 'contactado'])
        .order('created_at', { ascending: true });

      if (selectedCountry !== 'all') {
        query = query.eq('pais', selectedCountry);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Fetch active agents
  const { data: agentesData, isLoading: loadingAgentes } = useQuery({
    queryKey: ['active-agentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes')
        .select('*')
        .eq('estado', 'activo')
        .order('nombre');
      if (error) throw error;
      return data as Agente[];
    },
  });

  // Get agent assignment counts
  const { data: assignmentCounts } = useQuery({
    queryKey: ['assignment-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('asignado_agente_id')
        .not('asignado_agente_id', 'is', null);
      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((lead) => {
        if (lead.asignado_agente_id) {
          counts[lead.asignado_agente_id] = (counts[lead.asignado_agente_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  // Manual assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({ leadId, agenteId }: { leadId: string; agenteId: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ asignado_agente_id: agenteId, estado: 'asignado' })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-leads'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-counts'] });
      toast.success('Lead asignado');
    },
  });

  // Round-robin auto-assign
  const autoAssignMutation = useMutation({
    mutationFn: async () => {
      if (!leadsData?.length || !agentesData?.length) {
        throw new Error('No hay leads o agentes disponibles');
      }

      // Group leads by country
      const leadsByCountry: Record<string, Lead[]> = {};
      leadsData.forEach((lead) => {
        if (!leadsByCountry[lead.pais]) leadsByCountry[lead.pais] = [];
        leadsByCountry[lead.pais].push(lead);
      });

      // Group agents by country
      const agentsByCountry: Record<string, Agente[]> = {};
      agentesData.forEach((agent) => {
        if (!agentsByCountry[agent.pais]) agentsByCountry[agent.pais] = [];
        agentsByCountry[agent.pais].push(agent);
      });

      let assignedCount = 0;

      // Round-robin by country
      for (const country of Object.keys(leadsByCountry)) {
        const countryLeads = leadsByCountry[country];
        const countryAgents = agentsByCountry[country] || [];

        if (countryAgents.length === 0) continue;

        // Get current assignment counts for country agents
        const agentCounts = countryAgents.map((a) => ({
          agent: a,
          count: assignmentCounts?.[a.id] || 0,
        }));

        // Sort by count (least assigned first)
        agentCounts.sort((a, b) => a.count - b.count);

        let agentIndex = 0;
        for (const lead of countryLeads) {
          const agent = agentCounts[agentIndex % agentCounts.length].agent;
          
          const { error } = await supabase
            .from('leads')
            .update({ asignado_agente_id: agent.id, estado: 'asignado' })
            .eq('id', lead.id);

          if (!error) {
            assignedCount++;
            agentCounts[agentIndex % agentCounts.length].count++;
          }

          agentIndex++;
        }
      }

      return assignedCount;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-leads'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-counts'] });
      toast.success(`${count} leads asignados automáticamente`);
    },
    onError: (error) => {
      toast.error(error.message || 'Error en la asignación');
    },
  });

  const countries = [...new Set(leadsData?.map((l) => l.pais) || [])];
  const getAgentsForCountry = (country: string) => 
    agentesData?.filter((a) => a.pais === country) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Postulaciones de Agentes</h1>
          <p className="text-muted-foreground">Asignación de postulantes a reclutadores por país</p>
        </div>
        <Button
          onClick={() => autoAssignMutation.mutate()}
          variant="hero"
          disabled={!leadsData?.length || autoAssignMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${autoAssignMutation.isPending ? 'animate-spin' : ''}`} />
          Auto-asignar todos
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Postulantes sin asignar</p>
          <p className="font-display text-2xl font-bold text-primary">{leadsData?.length || 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Reclutadores activos</p>
          <p className="font-display text-2xl font-bold text-gold">{agentesData?.length || 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Países con postulantes</p>
          <p className="font-display text-2xl font-bold">{countries.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total asignados</p>
          <p className="font-display text-2xl font-bold text-muted-foreground">
            {Object.values(assignmentCounts || {}).reduce((a, b) => a + b, 0)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por país" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los países</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Postulante</th>
                <th className="p-4 font-semibold">País/Ciudad</th>
                <th className="p-4 font-semibold">Reclutadores disponibles</th>
                <th className="p-4 font-semibold">Asignar a</th>
              </tr>
            </thead>
            <tbody>
              {loadingLeads || loadingAgentes ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="spinner mx-auto" />
                  </td>
                </tr>
              ) : leadsData?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No hay postulantes sin asignar</p>
                  </td>
                </tr>
              ) : (
                leadsData?.map((lead) => {
                  const availableAgents = getAgentsForCountry(lead.pais);
                  return (
                    <tr key={lead.id} className="border-b border-border/50">
                      <td className="p-4">
                        <p className="font-medium">{lead.nombre}</p>
                        <p className="text-sm text-muted-foreground">{lead.whatsapp}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{lead.pais}</span>
                          {lead.ciudad && (
                            <span className="text-muted-foreground">, {lead.ciudad}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {availableAgents.length === 0 ? (
                          <span className="text-sm text-muted-foreground">Sin reclutadores en {lead.pais}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {availableAgents.length} reclutador(es)
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {availableAgents.length > 0 ? (
                          <Select
                            onValueChange={(agentId) => assignMutation.mutate({ leadId: lead.id, agenteId: agentId })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Seleccionar reclutador" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.nombre} ({assignmentCounts?.[agent.id] || 0} asig.)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Sin reclutadores
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruiters Overview */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">Resumen por reclutador</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentesData?.map((agent) => (
            <div key={agent.id} className="glass-card rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{agent.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {agent.pais}{agent.ciudad ? `, ${agent.ciudad}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-primary">
                    {assignmentCounts?.[agent.id] || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">asignados</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAsignacion;
