-- Create rate card tables for OOH media pricing
CREATE TABLE public.media_formats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  format_name TEXT NOT NULL UNIQUE,
  format_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  dimensions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL
);

-- Create rate cards table
CREATE TABLE public.rate_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_format_id UUID NOT NULL REFERENCES public.media_formats(id) ON DELETE CASCADE,
  location_area TEXT NOT NULL,
  base_rate_per_incharge DECIMAL(10,2) NOT NULL,
  production_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2),
  reduced_price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL
);

-- Create discount tiers table
CREATE TABLE public.discount_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_format_id UUID NOT NULL REFERENCES public.media_formats(id) ON DELETE CASCADE,
  min_incharges INTEGER NOT NULL,
  max_incharges INTEGER,
  discount_percentage DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.media_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for media_formats
CREATE POLICY "Anyone can view active media formats"
ON public.media_formats
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can view all media formats"
ON public.media_formats
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create media formats"
ON public.media_formats
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update media formats"
ON public.media_formats
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete media formats"
ON public.media_formats
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('super_admin', 'admin')
));

-- Create policies for rate_cards
CREATE POLICY "Anyone can view active rate cards"
ON public.rate_cards
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can view all rate cards"
ON public.rate_cards
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create rate cards"
ON public.rate_cards
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update rate cards"
ON public.rate_cards
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete rate cards"
ON public.rate_cards
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('super_admin', 'admin')
));

-- Create policies for discount_tiers
CREATE POLICY "Anyone can view active discount tiers"
ON public.discount_tiers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can view all discount tiers"
ON public.discount_tiers
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create discount tiers"
ON public.discount_tiers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update discount tiers"
ON public.discount_tiers
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete discount tiers"
ON public.discount_tiers
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('super_admin', 'admin')
));

-- Create triggers for updated_at
CREATE TRIGGER update_media_formats_updated_at
  BEFORE UPDATE ON public.media_formats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_cards_updated_at
  BEFORE UPDATE ON public.rate_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discount_tiers_updated_at
  BEFORE UPDATE ON public.discount_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial media formats
INSERT INTO public.media_formats (format_name, format_slug, description, dimensions, created_by, updated_by) 
VALUES 
  ('48 Sheet Billboard', '48-sheet-billboard', 'Large format billboard advertising', '6m x 3m', auth.uid(), auth.uid()),
  ('6 Sheet Poster', '6-sheet-poster', 'Standard roadside poster', '1.8m x 1.2m', auth.uid(), auth.uid()),
  ('Bus Stop Poster', 'bus-stop-poster', 'Transit advertising at bus stops', '1.2m x 1.8m', auth.uid(), auth.uid()),
  ('Digital Billboard', 'digital-billboard', 'Digital LED billboard advertising', '6m x 3m', auth.uid(), auth.uid());