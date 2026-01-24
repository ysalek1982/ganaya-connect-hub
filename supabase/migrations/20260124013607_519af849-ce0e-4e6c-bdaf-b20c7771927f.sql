-- Add can_recruit_subagents flag to agentes table
ALTER TABLE public.agentes 
ADD COLUMN IF NOT EXISTS can_recruit_subagents boolean DEFAULT false;

-- Add country options for better tracking
CREATE INDEX IF NOT EXISTS idx_agentes_can_recruit ON public.agentes(can_recruit_subagents) WHERE can_recruit_subagents = true;

-- Update RLS policy for agents to allow creating subagents
DROP POLICY IF EXISTS "Agents can insert subagentes" ON public.agentes;
CREATE POLICY "Agents can insert subagentes" 
ON public.agentes 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (
    has_role(auth.uid(), 'line_leader'::app_role)
  )
  OR (
    has_role(auth.uid(), 'agent'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.agentes a 
      WHERE a.user_id = auth.uid() 
      AND a.can_recruit_subagents = true
    )
  )
);