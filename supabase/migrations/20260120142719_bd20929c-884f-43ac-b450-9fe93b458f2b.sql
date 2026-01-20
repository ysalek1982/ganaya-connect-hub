
-- Table for managing sections visibility and order
CREATE TABLE public.cms_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  enabled boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for game lobbies (main categories)
CREATE TABLE public.cms_lobbies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  cta_text text NOT NULL DEFAULT 'Jugar ahora',
  cta_link text,
  badge text,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for promo carousel slides
CREATE TABLE public.cms_promos_carousel (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text NOT NULL DEFAULT 'Ver más',
  cta_link text,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for spotlight games
CREATE TABLE public.cms_spotlight_games (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  speed_tag text NOT NULL DEFAULT 'Normal',
  image_url text,
  cta_text text NOT NULL DEFAULT 'Jugar',
  cta_link text,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for FAQ items
CREATE TABLE public.cms_faq (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for uploaded assets
CREATE TABLE public.cms_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL,
  tag text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for mobile CTA buttons
CREATE TABLE public.cms_mobile_ctas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  button_key text NOT NULL UNIQUE,
  text text NOT NULL,
  link text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for SEO/OG settings
CREATE TABLE public.cms_seo (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key text NOT NULL UNIQUE,
  meta_title text,
  meta_description text,
  og_image_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_promos_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_spotlight_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_mobile_ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_seo ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read cms_sections" ON public.cms_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms_lobbies" ON public.cms_lobbies FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms_promos_carousel" ON public.cms_promos_carousel FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms_spotlight_games" ON public.cms_spotlight_games FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms_faq" ON public.cms_faq FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms_assets" ON public.cms_assets FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms_mobile_ctas" ON public.cms_mobile_ctas FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms_seo" ON public.cms_seo FOR SELECT USING (true);

-- Admin CRUD policies
CREATE POLICY "Admins can insert cms_sections" ON public.cms_sections FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_sections" ON public.cms_sections FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_sections" ON public.cms_sections FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cms_lobbies" ON public.cms_lobbies FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_lobbies" ON public.cms_lobbies FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_lobbies" ON public.cms_lobbies FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cms_promos_carousel" ON public.cms_promos_carousel FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_promos_carousel" ON public.cms_promos_carousel FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_promos_carousel" ON public.cms_promos_carousel FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cms_spotlight_games" ON public.cms_spotlight_games FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_spotlight_games" ON public.cms_spotlight_games FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_spotlight_games" ON public.cms_spotlight_games FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cms_faq" ON public.cms_faq FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_faq" ON public.cms_faq FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_faq" ON public.cms_faq FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cms_assets" ON public.cms_assets FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_assets" ON public.cms_assets FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_assets" ON public.cms_assets FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cms_mobile_ctas" ON public.cms_mobile_ctas FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_mobile_ctas" ON public.cms_mobile_ctas FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_mobile_ctas" ON public.cms_mobile_ctas FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cms_seo" ON public.cms_seo FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms_seo" ON public.cms_seo FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms_seo" ON public.cms_seo FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_cms_sections_updated_at BEFORE UPDATE ON public.cms_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_lobbies_updated_at BEFORE UPDATE ON public.cms_lobbies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_promos_carousel_updated_at BEFORE UPDATE ON public.cms_promos_carousel FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_spotlight_games_updated_at BEFORE UPDATE ON public.cms_spotlight_games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_faq_updated_at BEFORE UPDATE ON public.cms_faq FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_mobile_ctas_updated_at BEFORE UPDATE ON public.cms_mobile_ctas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_seo_updated_at BEFORE UPDATE ON public.cms_seo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for CMS images
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-images', 'cms-images', true);

-- Storage policies
CREATE POLICY "Anyone can view cms images" ON storage.objects FOR SELECT USING (bucket_id = 'cms-images');
CREATE POLICY "Admins can upload cms images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cms images" ON storage.objects FOR UPDATE USING (bucket_id = 'cms-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cms images" ON storage.objects FOR DELETE USING (bucket_id = 'cms-images' AND has_role(auth.uid(), 'admin'::app_role));
