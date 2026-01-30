import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Users, 
  User, 
  TrendingUp, 
  AlertTriangle,
  Wrench,
  RefreshCw,
  UserX,
  RotateCcw,
  Check,
  X,
  Edit2,
  Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { 
  useNetworkTree, 
  useUpdateAgentLeader,
  useFixOrphans,
  useNormalizeLineLeaderIds,
  isDescendant,
  type NetworkNode 
} from '@/hooks/useNetworkTree';
import { toast } from 'sonner';

const AdminNetwork = () => {
  const { isAdmin } = useFirebaseAuth();
  const { data: networkData, isLoading, refetch } = useNetworkTree();
  const updateLeaderMutation = useUpdateAgentLeader();
  const fixOrphansMutation = useFixOrphans();
  const normalizeMutation = useNormalizeLineLeaderIds();
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const startEdit = (node: NetworkNode) => {
    setEditingNode(node.uid);
    setSelectedLeader(node.lineLeaderId || 'none');
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setSelectedLeader(null);
  };

  const saveLeaderChange = async (node: NetworkNode) => {
    if (!networkData) return;
    
    const newLeaderId = selectedLeader === 'none' ? null : selectedLeader;
    
    // Validate: can't set a descendant as leader (would create cycle)
    if (newLeaderId && isDescendant(node.uid, newLeaderId, networkData.allNodes)) {
      toast.error('No puedes seleccionar un descendiente como líder (crearía un ciclo)');
      return;
    }
    
    // Validate: can't set self as leader
    if (newLeaderId === node.uid) {
      toast.error('No puedes seleccionar al agente como su propio líder');
      return;
    }
    
    await updateLeaderMutation.mutateAsync({ 
      uid: node.uid, 
      newLineLeaderId: newLeaderId 
    });
    
    setEditingNode(null);
    setSelectedLeader(null);
  };

  const handleFixOrphans = () => {
    if (!networkData) return;
    const orphanUids = networkData.issues
      .filter(i => i.type === 'orphan')
      .map(i => i.uid);
    
    if (orphanUids.length === 0) {
      toast.info('No hay huérfanos para reparar');
      return;
    }
    
    fixOrphansMutation.mutate(orphanUids);
  };

  const handleFixCycles = () => {
    if (!networkData) return;
    const cycleUids = networkData.issues
      .filter(i => i.type === 'cycle' || i.type === 'self-loop')
      .map(i => i.uid);
    
    if (cycleUids.length === 0) {
      toast.info('No hay ciclos para reparar');
      return;
    }
    
    fixOrphansMutation.mutate(cycleUids);
  };

  const handleNormalize = () => {
    normalizeMutation.mutate();
  };

  // Get list of possible leaders for select (exclude self and descendants)
  const getLeaderOptions = (currentNode: NetworkNode) => {
    if (!networkData) return [];
    
    const options: { uid: string; name: string; refCode: string | null }[] = [];
    
    networkData.allNodes.forEach((node) => {
      // Exclude self
      if (node.uid === currentNode.uid) return;
      // Exclude descendants
      if (isDescendant(currentNode.uid, node.uid, networkData.allNodes)) return;
      
      options.push({
        uid: node.uid,
        name: node.name,
        refCode: node.refCode,
      });
    });
    
    return options.sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderNode = (node: NetworkNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.uid);
    const isEditing = editingNode === node.uid;
    const isLeader = node.role === 'LINE_LEADER' || node.children.length > 0;

    return (
      <div key={node.uid} className="relative">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isLeader ? 'bg-primary/10 hover:bg-primary/20' : 'bg-muted/50 hover:bg-muted'
          } ${depth > 0 ? 'ml-6' : ''}`}
        >
          {/* Expand/collapse button */}
          {hasChildren ? (
            <button 
              className="w-5 h-5 flex items-center justify-center"
              onClick={() => toggleNode(node.uid)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          {/* Icon */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isLeader ? 'bg-primary/20' : 'bg-muted'
          }`}>
            {isLeader ? (
              <Users className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{node.name}</span>
              {node.role === 'LINE_LEADER' && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  Line Leader
                </Badge>
              )}
              {node.canRecruitSubagents && node.role !== 'LINE_LEADER' && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs">
                  Reclutador
                </Badge>
              )}
              {node.isOrphan && (
                <Badge variant="destructive" className="text-xs">
                  Huérfano
                </Badge>
              )}
              {(node.hasCycle || node.hasSelfLoop) && (
                <Badge variant="destructive" className="text-xs">
                  Ciclo
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
              <span>{node.country}</span>
              {node.refCode && (
                <code className="text-xs bg-background px-1.5 py-0.5 rounded">
                  {node.refCode}
                </code>
              )}
              {node.totalDownline > 0 && (
                <span className="text-xs">
                  Red: {node.totalDownline} agente{node.totalDownline !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Leader edit section */}
            {isAdmin && isEditing && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Select
                  value={selectedLeader || 'none'}
                  onValueChange={setSelectedLeader}
                >
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue placeholder="Seleccionar líder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin líder (raíz)</SelectItem>
                    {getLeaderOptions(node).map(opt => (
                      <SelectItem key={opt.uid} value={opt.uid}>
                        {opt.name} {opt.refCode && `(${opt.refCode})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => saveLeaderChange(node)}
                  disabled={updateLeaderMutation.isPending}
                >
                  <Save className="w-4 h-4 text-primary" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={cancelEdit}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Metrics */}
          <div className="text-right flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1 text-primary font-semibold">
                <TrendingUp className="w-4 h-4" />
                {node.leadsDirect}
              </div>
              <span className="text-xs text-muted-foreground">directos</span>
            </div>
            {node.leadsTotal > node.leadsDirect && (
              <div>
                <div className="font-semibold text-accent">
                  {node.leadsTotal}
                </div>
                <span className="text-xs text-muted-foreground">total red</span>
              </div>
            )}
            
            {isAdmin && !isEditing && (
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => startEdit(node)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2 border-l-2 border-primary/20 ml-4">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const { roots, issues, stats } = networkData || { 
    roots: [], 
    issues: [], 
    stats: { totalAgents: 0, totalLeaders: 0, totalLeads: 0, orphanCount: 0, cycleCount: 0 } 
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Red de Agentes</h1>
          <p className="text-muted-foreground">
            Vista jerárquica basada en Firebase (lineLeaderId)
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Line Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-primary">{stats.totalLeaders}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-accent">{stats.totalAgents}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nodos Raíz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-muted-foreground">{roots.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostics Panel */}
      {isAdmin && issues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Inconsistencias detectadas ({issues.length})</AlertTitle>
          <AlertDescription>
            <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
              <CollapsibleTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-destructive-foreground underline">
                  {showDiagnostics ? 'Ocultar detalles' : 'Ver detalles'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                {/* Orphans */}
                {stats.orphanCount > 0 && (
                  <div className="bg-background/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UserX className="w-4 h-4" />
                        <span className="font-medium">Huérfanos ({stats.orphanCount})</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFixOrphans}
                        disabled={fixOrphansMutation.isPending}
                      >
                        <Wrench className="w-4 h-4 mr-1" />
                        Reparar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Agentes cuyo lineLeaderId apunta a un usuario inexistente
                    </p>
                    <ul className="text-xs space-y-1">
                      {issues.filter(i => i.type === 'orphan').map(issue => (
                        <li key={issue.uid}>
                          • {issue.name} → líder inválido: <code>{issue.invalidLineLeaderId}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cycles */}
                {stats.cycleCount > 0 && (
                  <div className="bg-background/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        <span className="font-medium">Ciclos/Self-loops ({stats.cycleCount})</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleFixCycles}
                        disabled={fixOrphansMutation.isPending}
                      >
                        <Wrench className="w-4 h-4 mr-1" />
                        Romper ciclos
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Agentes que crean referencias circulares
                    </p>
                    <ul className="text-xs space-y-1">
                      {issues.filter(i => i.type === 'cycle' || i.type === 'self-loop').map(issue => (
                        <li key={issue.uid}>
                          • {issue.name} ({issue.type === 'self-loop' ? 'auto-referencia' : 'ciclo detectado'})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Normalize button */}
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={handleNormalize}
                    disabled={normalizeMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Normalizar datos ('' → null)
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </AlertDescription>
        </Alert>
      )}

      {/* No issues badge */}
      {isAdmin && issues.length === 0 && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertTitle>Sin inconsistencias</AlertTitle>
          <AlertDescription>
            La estructura jerárquica está correctamente configurada.
          </AlertDescription>
        </Alert>
      )}

      {/* Hierarchy Tree */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Estructura Jerárquica
        </h2>
        
        {roots.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay agentes en la red
          </div>
        ) : (
          <div className="space-y-3">
            {roots.map(root => renderNode(root))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNetwork;
