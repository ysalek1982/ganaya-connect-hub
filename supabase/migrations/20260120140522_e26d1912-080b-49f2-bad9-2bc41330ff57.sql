-- Create a function to setup the first admin user
-- This will be called when the first admin logs in or can be triggered manually

-- Insert default settings row if not exists
INSERT INTO public.settings (id, fallback_mode, whatsapp_default)
SELECT gen_random_uuid(), true, '+59176356972'
WHERE NOT EXISTS (SELECT 1 FROM public.settings LIMIT 1);

-- Insert default CMS content
INSERT INTO public.cms_content (key, value) VALUES
  ('home_hero', '{"title": "Apostá con soporte real. Recargá y retirás con un agente local.", "subtitle": "Apuestas deportivas y casino en vivo. Atención por WhatsApp y retiros guiados a tu banco.", "cta_primary": "Quiero apostar", "cta_secondary": "Quiero ser agente"}'::jsonb),
  ('home_stats', '{"growth": "+25%", "growth_label": "Crecimiento anual iGaming LATAM", "mobile": "85%", "mobile_label": "Usuarios móviles", "projection": "$8.5B", "projection_label": "Proyección 2026"}'::jsonb),
  ('agente_hero', '{"title": "Generá ingresos como agente de Ganaya.bet", "subtitle": "Hasta 40% por positivo mensual + 7%/5% por tu red. 100% móvil.", "cta": "Postularme ahora"}'::jsonb),
  ('faq', '{"items": [{"q": "¿Cómo recargo?", "a": "Contactá a tu agente por WhatsApp. Te guiará para recargar con USDT/Binance o método local."}, {"q": "¿Cómo retiro?", "a": "Pedí tu retiro al agente. Verificamos y transferimos a tu banco en 24hs."}, {"q": "¿Es seguro?", "a": "Sí. Tu agente es tu punto de contacto personal. Datos protegidos."}, {"q": "¿Qué métodos hay en mi país?", "a": "USDT/Binance P2P es el más rápido. También aceptamos transferencias locales."}]}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create a helper function to promote a user to admin after registration
-- Admin user should register normally with email: ysalek@gmail.com
-- Then this function can be called via SQL or an edge function
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update profile if exists
  UPDATE public.profiles 
  SET full_name = COALESCE(full_name, 'Administrator')
  WHERE user_id = target_user_id;
END;
$$;

-- Create trigger to auto-promote the designated admin email on first signup
CREATE OR REPLACE FUNCTION public.auto_promote_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the user is the designated admin, auto-promote
  IF NEW.email = 'ysalek@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin();

-- Insert sample agents for demo purposes
INSERT INTO public.agentes (nombre, whatsapp, pais, ciudad, estado) VALUES
  ('Carlos Mendez', '+595981234567', 'Paraguay', 'Asunción', 'activo'),
  ('María González', '+5491155443322', 'Argentina', 'Buenos Aires', 'activo'),
  ('Juan Pérez', '+573001234567', 'Colombia', 'Bogotá', 'activo'),
  ('Ana Rodríguez', '+593991234567', 'Ecuador', 'Quito', 'activo')
ON CONFLICT DO NOTHING;

-- Insert sample leads for demo purposes  
INSERT INTO public.leads (tipo, nombre, whatsapp, pais, ciudad, origen, score, etiqueta, estado) VALUES
  ('cliente', 'Demo Cliente 1', '+595982111222', 'Paraguay', 'Asunción', 'home_form', 0, 'CLIENTE', 'nuevo'),
  ('cliente', 'Demo Cliente 2', '+5491144556677', 'Argentina', 'Córdoba', 'chat', 0, 'CLIENTE', 'nuevo'),
  ('agente', 'Demo Agente Alto', '+573009998877', 'Colombia', 'Medellín', 'agent_page', 85, 'AGENTE_POTENCIAL_ALTO', 'nuevo'),
  ('agente', 'Demo Agente Medio', '+593998887766', 'Ecuador', 'Guayaquil', 'chat', 65, 'AGENTE_POTENCIAL_MEDIO', 'nuevo')
ON CONFLICT DO NOTHING;