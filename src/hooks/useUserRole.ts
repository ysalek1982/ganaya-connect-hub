import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserRoleInfo {
  role: AppRole | null;
  agentId: string | null;
  isAdmin: boolean;
  isLineLeader: boolean;
  isAgent: boolean;
  loading: boolean;
}

export const useUserRole = (): UserRoleInfo => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData) {
        setRole(roleData.role);
      }

      // If line_leader or agent, find their agente record
      if (roleData?.role === 'line_leader' || roleData?.role === 'agent') {
        const { data: agentData } = await supabase
          .from('agentes')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (agentData) {
          setAgentId(agentData.id);
        }
      }

      setLoading(false);
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    agentId,
    isAdmin: role === 'admin',
    isLineLeader: role === 'line_leader',
    isAgent: role === 'agent',
    loading,
  };
};
