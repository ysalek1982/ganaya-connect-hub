-- Corregir función search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Las políticas de INSERT público para leads y chat_logs son intencionales
-- ya que los formularios públicos necesitan insertar datos sin autenticación.
-- Agregar rate limiting a nivel de aplicación para mitigar spam.