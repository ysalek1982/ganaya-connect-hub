-- Add target country field to promos carousel
ALTER TABLE public.cms_promos_carousel 
ADD COLUMN target_country TEXT DEFAULT 'ALL';

-- Add comment for the column
COMMENT ON COLUMN public.cms_promos_carousel.target_country IS 'Target country for promo: ALL, PY, AR, CO, EC, USD';