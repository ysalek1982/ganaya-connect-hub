-- Add ref_code column to agentes table for unique referral codes
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS ref_code TEXT UNIQUE;

-- Add ref_code column to leads table to track referral attribution
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ref_code TEXT;

-- Create index for faster ref_code lookups
CREATE INDEX IF NOT EXISTS idx_agentes_ref_code ON public.agentes(ref_code);
CREATE INDEX IF NOT EXISTS idx_leads_ref_code ON public.leads(ref_code);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON public.leads(asignado_agente_id);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON public.leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- Function to get agent load (count of new/asignado leads in last 24h)
CREATE OR REPLACE FUNCTION public.get_agent_load(agent_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.leads
  WHERE asignado_agente_id = agent_id
    AND estado IN ('nuevo', 'asignado')
    AND created_at >= NOW() - INTERVAL '24 hours'
$$;

-- Function to auto-assign agent by ref_code or round-robin by country
CREATE OR REPLACE FUNCTION public.auto_assign_agent(
  p_ref_code TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid;
BEGIN
  -- First try to find agent by ref_code
  IF p_ref_code IS NOT NULL AND p_ref_code != '' THEN
    SELECT id INTO v_agent_id
    FROM public.agentes
    WHERE ref_code = p_ref_code
      AND estado = 'activo'
    LIMIT 1;
    
    IF v_agent_id IS NOT NULL THEN
      RETURN v_agent_id;
    END IF;
  END IF;
  
  -- If no ref_code match, use round-robin weighted by load
  -- Priority: same country agents with lowest load
  SELECT a.id INTO v_agent_id
  FROM public.agentes a
  WHERE a.estado = 'activo'
    AND (p_country IS NULL OR LOWER(a.pais) = LOWER(p_country))
  ORDER BY public.get_agent_load(a.id) ASC, a.created_at ASC
  LIMIT 1;
  
  -- If no agent in same country, try any active agent
  IF v_agent_id IS NULL THEN
    SELECT a.id INTO v_agent_id
    FROM public.agentes a
    WHERE a.estado = 'activo'
    ORDER BY public.get_agent_load(a.id) ASC, a.created_at ASC
    LIMIT 1;
  END IF;
  
  RETURN v_agent_id;
END;
$$;