import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, ChevronDown, Users, User, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';
import type { Database } from '@/integrations/supabase/types';

type Agente = Database['public']['Tables']['agentes']['Row'];

interface AgentWithStats extends Agente {
  leads_count: number;
  subordinates?: AgentWithStats[];
}

const AdminNetwork = () => {
  const { isAdmin, isLineLeader, agentId } = useUserRole();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { data: agentes } = useQuery({
    queryKey: ['agentes-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agentes')
        .select('*')
        .order('nombre');
      if (error) throw error;
      return data as Agente[];
    },
  });

  const { data: leadCounts } = useQuery({
    queryKey: ['lead-counts-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('asignado_agente_id')
        .not('asignado_agente_id', 'is', null);
      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(lead => {
        if (lead.asignado_agente_id) {
          counts[lead.asignado_agente_id] = (counts[lead.asignado_agente_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Build hierarchical structure
  const buildHierarchy = (): AgentWithStats[] => {
    if (!agentes) return [];

    const agentsWithStats: AgentWithStats[] = agentes.map(a => ({
      ...a,
      leads_count: leadCounts?.[a.id] || 0,
    }));

    // Get line leaders (agents without line_leader_id or self-referencing)
    let lineLeaders = agentsWithStats.filter(a => !a.line_leader_id);

    // For each line leader, attach their subordinates
    lineLeaders = lineLeaders.map(ll => ({
      ...ll,
      subordinates: agentsWithStats.filter(a => a.line_leader_id === ll.id),
    }));

    // Filter by role
    if (isLineLeader && agentId) {
      return lineLeaders.filter(ll => ll.id === agentId);
    }

    return lineLeaders;
  };

  const hierarchy = buildHierarchy();

  // Calculate totals
  const totalLeaders = hierarchy.length;
  const totalAgents = hierarchy.reduce((acc, ll) => acc + (ll.subordinates?.length || 0), 0);
  const totalLeads = hierarchy.reduce((acc, ll) => {
    const llLeads = ll.leads_count;
    const subLeads = ll.subordinates?.reduce((s, a) => s + a.leads_count, 0) || 0;
    return acc + llLeads + subLeads;
  }, 0);

  const renderAgent = (agent: AgentWithStats, isLeader = false) => {
    const hasSubordinates = isLeader && agent.subordinates && agent.subordinates.length > 0;
    const isExpanded = expandedNodes.has(agent.id);

    return (
      <div key={agent.id} className="relative">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
            isLeader ? 'bg-primary/10 hover:bg-primary/20' : 'bg-muted/50 hover:bg-muted ml-6'
          }`}
          onClick={() => hasSubordinates && toggleNode(agent.id)}
        >
          {hasSubordinates && (
            <button className="w-5 h-5 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          {!hasSubordinates && <div className="w-5" />}
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isLeader ? 'bg-primary/20' : 'bg-muted'
          }`}>
            {isLeader ? (
              <Users className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{agent.nombre}</span>
              {isLeader && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  Line Leader
                </Badge>
              )}
              <Badge variant={agent.estado === 'activo' ? 'default' : 'secondary'} className="text-xs">
                {agent.estado}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-3">
              <span>{agent.pais}</span>
              {agent.ref_code && (
                <code className="text-xs bg-background px-1.5 py-0.5 rounded">
                  {agent.ref_code}
                </code>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary font-semibold">
              <TrendingUp className="w-4 h-4" />
              {agent.leads_count}
            </div>
            <span className="text-xs text-muted-foreground">leads</span>
          </div>
        </div>

        {/* Subordinates */}
        {hasSubordinates && isExpanded && (
          <div className="mt-2 space-y-2 border-l-2 border-primary/20 ml-4">
            {agent.subordinates!.map(sub => renderAgent(sub, false))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Red de Agentes</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Vista jerárquica completa' : 'Tu red de agentes'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Line Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-primary">{totalLeaders}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-gold">{totalAgents}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Hierarchy Tree */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Estructura Jerárquica
        </h2>
        
        {hierarchy.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay agentes en la red
          </div>
        ) : (
          <div className="space-y-3">
            {hierarchy.map(ll => renderAgent(ll, true))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNetwork;
