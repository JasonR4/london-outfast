-- Create production cost tiers table
CREATE TABLE public.production_cost_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_format_id UUID NOT NULL REFERENCES public.media_formats(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.production_cost_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for production_cost_tiers
CREATE POLICY "Anyone can view active production cost tiers"
ON public.production_cost_tiers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can view all production cost tiers"
ON public.production_cost_tiers
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create production cost tiers"
ON public.production_cost_tiers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update production cost tiers"
ON public.production_cost_tiers
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete production cost tiers"
ON public.production_cost_tiers
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('super_admin', 'admin')
));

-- Create trigger for updated_at
CREATE TRIGGER update_production_cost_tiers_updated_at
  BEFORE UPDATE ON public.production_cost_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Remove the old production_cost column from rate_cards since we're now using tiers
ALTER TABLE public.rate_cards DROP COLUMN IF EXISTS production_cost;

-- Add comment explaining the new system
COMMENT ON TABLE public.production_cost_tiers IS 'Tiered production costs based on quantity. Higher quantities typically have lower per-unit costs.';