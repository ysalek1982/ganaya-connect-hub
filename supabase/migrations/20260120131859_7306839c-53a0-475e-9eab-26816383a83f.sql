-- Enum para roles de usuario
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum para niveles P2P
CREATE TYPE public.p2p_level AS ENUM ('basico', 'medio', 'avanzado');

-- Enum para horas por día
CREATE TYPE public.hours_per_day AS ENUM ('1-2', '3-5', '6+');

-- Enum para estados de leads
CREATE TYPE public.lead_status AS ENUM ('nuevo', 'contactado', 'asignado', 'cerrado', 'descartado');

-- Enum para estados de agentes
CREATE TYPE public.agent_status AS ENUM ('activo', 'inactivo');

-- Enum para etiquetas de scoring
CREATE TYPE public.score_label AS ENUM ('AGENTE_POTENCIAL_ALTO', 'AGENTE_POTENCIAL_MEDIO', 'AGENTE_POTENCIAL_BAJO', 'CLIENTE', 'NO_PRIORITARIO');

-- Tabla de perfiles de usuario (para auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Tabla de leads (clientes y agentes potenciales)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'agente')),
  nombre TEXT NOT NULL,
  edad INTEGER,
  whatsapp TEXT NOT NULL,
  email TEXT,
  pais TEXT NOT NULL,
  ciudad TEXT,
  binance_verificada BOOLEAN,
  p2p_nivel p2p_level,
  horas_dia hours_per_day,
  banca_300 BOOLEAN,
  exp_casinos BOOLEAN,
  exp_atencion BOOLEAN,
  quiere_empezar BOOLEAN,
  score INTEGER DEFAULT 0,
  etiqueta score_label,
  estado lead_status DEFAULT 'nuevo',
  asignado_agente_id UUID,
  origen TEXT DEFAULT 'home_form' CHECK (origen IN ('home_form', 'chat', 'agent_page')),
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  aposto_antes BOOLEAN,
  prefiere_usdt BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de agentes
CREATE TABLE public.agentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pais TEXT NOT NULL,
  ciudad TEXT,
  estado agent_status DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Agregar FK de leads a agentes
ALTER TABLE public.leads 
ADD CONSTRAINT leads_asignado_agente_fk 
FOREIGN KEY (asignado_agente_id) REFERENCES public.agentes(id) ON DELETE SET NULL;

-- Tabla de contenido CMS
CREATE TABLE public.cms_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de settings
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gemini_api_key TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_pass TEXT,
  from_email TEXT,
  whatsapp_default TEXT,
  fallback_mode BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de logs de chat
CREATE TABLE public.chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  transcript JSONB DEFAULT '[]',
  ai_summary TEXT,
  ai_recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insertar contenido CMS por defecto
INSERT INTO public.cms_content (key, value) VALUES
('home_hero', '{"title": "Apostá con soporte real. Recargá y retirás con un agente local.", "subtitle": "Apuestas deportivas y casino en vivo. Atención por WhatsApp y retiros guiados a tu banco."}'),
('home_benefits', '{"items": [{"icon": "MessageCircle", "title": "Soporte por WhatsApp", "desc": "Atención 24/7 con agentes locales"}, {"icon": "Zap", "title": "Recargas rápidas", "desc": "USDT/Binance en segundos"}, {"icon": "Shield", "title": "Retiros guiados", "desc": "Tu agente te guía paso a paso"}, {"icon": "CreditCard", "title": "Pagos locales", "desc": "Transferencia a tu banco"}]}'),
('home_steps', '{"items": [{"step": 1, "title": "Contactás al agente", "desc": "Escribinos por WhatsApp"}, {"step": 2, "title": "Recargás", "desc": "USDT, Binance P2P u opción local"}, {"step": 3, "title": "Jugás", "desc": "Deportes y casino en vivo"}, {"step": 4, "title": "Retirás", "desc": "El agente te guía y paga"}]}'),
('home_stats', '{"items": [{"value": "+25%", "label": "Crecimiento anual iGaming LATAM"}, {"value": "85%", "label": "Usuarios móviles"}, {"value": "$8.5B", "label": "Proyección 2026"}]}'),
('home_testimonials', '{"items": [{"name": "Carlos M.", "country": "Paraguay", "text": "Excelente servicio, retiro en minutos"}, {"name": "María G.", "country": "Argentina", "text": "Mi agente siempre responde rápido"}, {"name": "Juan P.", "country": "Colombia", "text": "Mejor plataforma que he probado"}]}'),
('home_faq', '{"items": [{"q": "¿Cómo recargo?", "a": "Contactá a tu agente por WhatsApp. Te guiará para recargar con USDT/Binance o método local."}, {"q": "¿Cómo retiro?", "a": "Pedí tu retiro al agente. Verificamos y transferimos a tu banco en 24hs."}, {"q": "¿Es seguro?", "a": "100%. Tu agente es tu punto de contacto personal. Datos protegidos."}, {"q": "¿Qué métodos hay en mi país?", "a": "USDT/Binance P2P es el más rápido. También aceptamos transferencias locales según tu país."}]}'),
('agent_hero', '{"title": "Generá ingresos como agente de Ganaya.bet", "subtitle": "Hasta 40% por positivo mensual + 7%/5% por tu red. 100% móvil."}'),
('agent_requirements', '{"items": [{"icon": "Wallet", "title": "Binance verificada", "desc": "Cuenta P2P activa"}, {"icon": "DollarSign", "title": "Banca mínima $300", "desc": "Capital operativo"}, {"icon": "MessageCircle", "title": "WhatsApp/Telegram", "desc": "Disponibilidad diaria"}, {"icon": "FileCheck", "title": "Documento vigente", "desc": "DNI o pasaporte"}]}'),
('agent_commissions', '{"ranges": [{"min": 1, "max": 500, "percent": 25, "level": "Inicial"}, {"min": 501, "max": 750, "percent": 30, "level": "Intermedio"}, {"min": 751, "max": 1000, "percent": 35, "level": "Avanzado"}, {"min": 1001, "max": null, "percent": 40, "level": "Elite"}], "multilevel": {"line1": 7, "line2": 5}}');

-- Insertar settings por defecto
INSERT INTO public.settings (whatsapp_default, fallback_mode) 
VALUES ('+595981123456', true);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Función para verificar roles (security definer para evitar recursión)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para leads (público puede insertar, admins pueden todo)
CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para agentes
CREATE POLICY "Admins can view agentes" ON public.agentes
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert agentes" ON public.agentes
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update agentes" ON public.agentes
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete agentes" ON public.agentes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para cms_content (público puede leer, admins pueden editar)
CREATE POLICY "Anyone can read cms" ON public.cms_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can update cms" ON public.cms_content
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert cms" ON public.cms_content
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para settings (solo admins)
CREATE POLICY "Admins can view settings" ON public.settings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para chat_logs
CREATE POLICY "Anyone can insert chat_logs" ON public.chat_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view chat_logs" ON public.chat_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_content_updated_at
  BEFORE UPDATE ON public.cms_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();