-- Drop the problematic policies first
DROP POLICY IF EXISTS "Role-based agent access" ON public.agentes;
DROP POLICY IF EXISTS "Role-based lead access" ON public.leads;

-- Create a helper function to get agent IDs for a user (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_agent_id(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.agentes WHERE user_id = p_user_id LIMIT 1;
$$;

-- Create a helper function to get agents under a line leader (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_line_leader_agent_ids(p_line_leader_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.agentes WHERE line_leader_id = p_line_leader_id;
$$;

-- Recreate agentes SELECT policy without self-referencing subqueries
CREATE POLICY "Role-based agent access" ON public.agentes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (user_id = auth.uid())
  OR (has_role(auth.uid(), 'line_leader'::app_role) AND line_leader_id = get_user_agent_id(auth.uid()))
);

-- Recreate leads SELECT policy using the helper functions
CREATE POLICY "Role-based lead access" ON public.leads
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (asignado_agente_id = get_user_agent_id(auth.uid()))
  OR (has_role(auth.uid(), 'line_leader'::app_role) AND asignado_agente_id IN (SELECT get_line_leader_agent_ids(get_user_agent_id(auth.uid()))))
);