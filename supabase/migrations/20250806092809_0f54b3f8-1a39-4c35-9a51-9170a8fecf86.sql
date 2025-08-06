-- Create creative_design_cost_tiers table
CREATE TABLE public.creative_design_cost_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_format_id UUID NOT NULL,
  category TEXT NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  cost_per_unit NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.creative_design_cost_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for creative_design_cost_tiers
CREATE POLICY "Anyone can view active creative design cost tiers" 
ON public.creative_design_cost_tiers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can view all creative design cost tiers" 
ON public.creative_design_cost_tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create creative design cost tiers" 
ON public.creative_design_cost_tiers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update creative design cost tiers" 
ON public.creative_design_cost_tiers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete creative design cost tiers" 
ON public.creative_design_cost_tiers 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY(ARRAY['super_admin'::text, 'admin'::text])
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_creative_design_cost_tiers_updated_at
BEFORE UPDATE ON public.creative_design_cost_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();