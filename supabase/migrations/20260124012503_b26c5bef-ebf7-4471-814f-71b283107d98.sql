-- Second migration: Add columns and policies (after enum values are committed)

-- Add line_leader_id to agentes table to create hierarchy
ALTER TABLE public.agentes 
ADD COLUMN IF NOT EXISTS line_leader_id uuid REFERENCES public.agentes(id) ON DELETE SET NULL;

-- Add user_id to agentes to link with auth users (for agent login)
ALTER TABLE public.agentes 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agentes_line_leader ON public.agentes(line_leader_id);
CREATE INDEX IF NOT EXISTS idx_agentes_user_id ON public.agentes(user_id);

-- Update RLS policies for line_leader and agent roles on agentes
DROP POLICY IF EXISTS "Admins can view agentes" ON public.agentes;
CREATE POLICY "Role-based agent access"
ON public.agentes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'line_leader'::app_role) AND (
    line_leader_id IN (SELECT id FROM public.agentes WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  ))
  OR (has_role(auth.uid(), 'agent'::app_role) AND user_id = auth.uid())
);

-- Update leads policies for role-based access
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Role-based lead access"
ON public.leads
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'line_leader'::app_role) AND asignado_agente_id IN (
    SELECT id FROM public.agentes 
    WHERE line_leader_id IN (SELECT id FROM public.agentes WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  ))
  OR (has_role(auth.uid(), 'agent'::app_role) AND asignado_agente_id IN (
    SELECT id FROM public.agentes WHERE user_id = auth.uid()
  ))
);

-- Add settings for enabled countries and scoring rules
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS enabled_countries jsonb DEFAULT '["Paraguay", "Argentina", "Bolivia", "Colombia", "Ecuador", "Perú", "Chile", "México", "USA"]'::jsonb;

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS scoring_rules jsonb DEFAULT '{
  "binance": {"verificada": 30},
  "p2p": {"basico": 5, "medio": 10, "avanzado": 15},
  "horas": {"1-2": 5, "3-5": 10, "6+": 20},
  "banca_300": 20,
  "exp_casinos": 10,
  "exp_atencion": 10,
  "quiere_empezar": 5
}'::jsonb;