import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirebaseUser, UserRole } from '@/lib/firebase-types';
import { toast } from 'sonner';

// Node in the network tree
export interface NetworkNode {
  uid: string;
  name: string;
  email: string;
  refCode: string | null;
  role: UserRole;
  country: string;
  isActive: boolean;
  lineLeaderId: string | null;
  canRecruitSubagents: boolean;
  createdAt: Date;
  
  // Computed metrics
  leadsDirect: number;
  leadsTotal: number;
  totalDownline: number;
  
  // Tree structure
  children: NetworkNode[];
  
  // Diagnostic flags
  isOrphan?: boolean;
  hasCycle?: boolean;
  hasSelfLoop?: boolean;
}

// Diagnostic issues
export interface NetworkIssue {
  uid: string;
  name: string;
  type: 'orphan' | 'self-loop' | 'cycle';
  invalidLineLeaderId?: string;
}

// Build result
export interface NetworkTreeResult {
  roots: NetworkNode[];
  allNodes: Map<string, NetworkNode>;
  issues: NetworkIssue[];
  stats: {
    totalAgents: number;
    totalLeaders: number;
    totalLeads: number;
    orphanCount: number;
    cycleCount: number;
  };
}

// Normalize lineLeaderId: treat '' as null
const normalizeLineLeaderId = (val: string | null | undefined): string | null => {
  if (!val || val === '') return null;
  return val;
};

// DFS cycle detection
const detectCycle = (
  nodeId: string, 
  allNodes: Map<string, NetworkNode>, 
  visited: Set<string>, 
  recStack: Set<string>
): boolean => {
  visited.add(nodeId);
  recStack.add(nodeId);
  
  const node = allNodes.get(nodeId);
  if (!node) return false;
  
  for (const child of node.children) {
    if (!visited.has(child.uid)) {
      if (detectCycle(child.uid, allNodes, visited, recStack)) {
        return true;
      }
    } else if (recStack.has(child.uid)) {
      return true;
    }
  }
  
  recStack.delete(nodeId);
  return false;
};

// Calculate subtree metrics recursively
const calculateSubtreeMetrics = (node: NetworkNode): { leadsTotal: number; totalDownline: number } => {
  let leadsTotal = node.leadsDirect;
  let totalDownline = node.children.length;
  
  for (const child of node.children) {
    const childMetrics = calculateSubtreeMetrics(child);
    leadsTotal += childMetrics.leadsTotal;
    totalDownline += childMetrics.totalDownline;
  }
  
  node.leadsTotal = leadsTotal;
  node.totalDownline = totalDownline;
  
  return { leadsTotal, totalDownline };
};

// Check if targetId is a descendant of nodeId
export const isDescendant = (
  nodeId: string, 
  targetId: string, 
  allNodes: Map<string, NetworkNode>
): boolean => {
  const node = allNodes.get(nodeId);
  if (!node) return false;
  
  for (const child of node.children) {
    if (child.uid === targetId) return true;
    if (isDescendant(child.uid, targetId, allNodes)) return true;
  }
  
  return false;
};

// Main hook to build network tree
export const useNetworkTree = () => {
  return useQuery({
    queryKey: ['network-tree'],
    queryFn: async (): Promise<NetworkTreeResult> => {
      // 1. Fetch all agents from Firebase
      const usersRef = collection(db, 'users');
      const agentsQuery = query(usersRef, where('role', 'in', ['AGENT', 'LINE_LEADER']));
      const usersSnapshot = await getDocs(agentsQuery);
      
      // 2. Fetch lead counts
      const leadsRef = collection(db, 'leads');
      const leadsSnapshot = await getDocs(leadsRef);
      
      const leadCounts: Record<string, number> = {};
      leadsSnapshot.docs.forEach(docSnap => {
        const agentId = docSnap.data().assignedAgentId;
        if (agentId) {
          leadCounts[agentId] = (leadCounts[agentId] || 0) + 1;
        }
      });
      
      // 3. Build node map
      const allNodes = new Map<string, NetworkNode>();
      const issues: NetworkIssue[] = [];
      
      usersSnapshot.docs.forEach(docSnap => {
        const data = docSnap.data() as Record<string, unknown>;
        const uid = docSnap.id;
        const lineLeaderId = normalizeLineLeaderId(data.lineLeaderId as string | null);
        const isActive = data.isActive !== false;
        
        // Skip inactive agents
        if (!isActive) return;
        
        const node: NetworkNode = {
          uid,
          name: (data.name as string) || (data.displayName as string) || '',
          email: (data.email as string) || '',
          refCode: (data.refCode as string) || null,
          role: (data.role as UserRole) || 'AGENT',
          country: (data.country as string) || '',
          isActive,
          lineLeaderId,
          canRecruitSubagents: (data.canRecruitSubagents as boolean) || false,
          createdAt: (data.createdAt as { toDate: () => Date })?.toDate?.() || new Date(),
          leadsDirect: leadCounts[uid] || 0,
          leadsTotal: 0,
          totalDownline: 0,
          children: [],
        };
        
        // Detect self-loop
        if (lineLeaderId === uid) {
          node.hasSelfLoop = true;
          node.lineLeaderId = null; // Treat as root for tree building
          issues.push({ uid, name: node.name, type: 'self-loop', invalidLineLeaderId: lineLeaderId });
        }
        
        allNodes.set(uid, node);
      });
      
      // 4. Build tree structure
      const roots: NetworkNode[] = [];
      
      allNodes.forEach((node) => {
        const parentId = node.hasSelfLoop ? null : node.lineLeaderId;
        
        if (parentId && allNodes.has(parentId)) {
          // Valid parent exists
          const parent = allNodes.get(parentId)!;
          parent.children.push(node);
        } else if (parentId && !allNodes.has(parentId)) {
          // Orphan: parent doesn't exist
          node.isOrphan = true;
          issues.push({ uid: node.uid, name: node.name, type: 'orphan', invalidLineLeaderId: parentId });
          roots.push(node);
        } else {
          // Root node (no lineLeaderId)
          roots.push(node);
        }
      });
      
      // 5. Detect cycles using DFS
      const visited = new Set<string>();
      const recStack = new Set<string>();
      
      roots.forEach(root => {
        if (!visited.has(root.uid)) {
          // Check for cycles starting from each root
          const hasCycleInSubtree = detectCycle(root.uid, allNodes, visited, recStack);
          if (hasCycleInSubtree) {
            // Mark nodes in cycle
            root.hasCycle = true;
            issues.push({ uid: root.uid, name: root.name, type: 'cycle' });
          }
        }
      });
      
      // 6. Calculate metrics for each subtree
      roots.forEach(root => {
        calculateSubtreeMetrics(root);
      });
      
      // 7. Sort roots and children by name
      const sortByName = (a: NetworkNode, b: NetworkNode) => a.name.localeCompare(b.name);
      roots.sort(sortByName);
      
      const sortChildren = (node: NetworkNode) => {
        node.children.sort(sortByName);
        node.children.forEach(sortChildren);
      };
      roots.forEach(sortChildren);
      
      // 8. Calculate stats
      let totalLeaders = 0;
      let totalAgents = 0;
      let totalLeads = 0;
      
      allNodes.forEach(node => {
        if (node.role === 'LINE_LEADER') totalLeaders++;
        else totalAgents++;
        totalLeads += node.leadsDirect;
      });
      
      return {
        roots,
        allNodes,
        issues,
        stats: {
          totalAgents,
          totalLeaders,
          totalLeads,
          orphanCount: issues.filter(i => i.type === 'orphan').length,
          cycleCount: issues.filter(i => i.type === 'cycle' || i.type === 'self-loop').length,
        },
      };
    },
    staleTime: 30000,
  });
};

// Mutation to update agent's lineLeaderId
export const useUpdateAgentLeader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      uid, 
      newLineLeaderId 
    }: { 
      uid: string; 
      newLineLeaderId: string | null 
    }) => {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lineLeaderId: newLineLeaderId,
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-tree'] });
      queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
      toast.success('Jerarquía actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
};

// Mutation to fix orphans (set lineLeaderId to null)
export const useFixOrphans = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orphanUids: string[]) => {
      const batch = writeBatch(db);
      
      orphanUids.forEach(uid => {
        const userRef = doc(db, 'users', uid);
        batch.update(userRef, {
          lineLeaderId: null,
          updatedAt: Timestamp.now(),
        });
      });
      
      await batch.commit();
    },
    onSuccess: (_, orphanUids) => {
      queryClient.invalidateQueries({ queryKey: ['network-tree'] });
      queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
      toast.success(`${orphanUids.length} huérfano(s) reparado(s)`);
    },
    onError: (error: Error) => {
      toast.error('Error al reparar: ' + error.message);
    },
  });
};

// Mutation to normalize empty strings to null
export const useNormalizeLineLeaderIds = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.lineLeaderId === '') {
          batch.update(docSnap.ref, {
            lineLeaderId: null,
            updatedAt: Timestamp.now(),
          });
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
      }
      
      return count;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['network-tree'] });
      queryClient.invalidateQueries({ queryKey: ['firebase-agents'] });
      if (count > 0) {
        toast.success(`${count} registro(s) normalizado(s)`);
      } else {
        toast.info('No hay registros para normalizar');
      }
    },
    onError: (error: Error) => {
      toast.error('Error al normalizar: ' + error.message);
    },
  });
};
