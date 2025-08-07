-- Create quantity-based discount tiers table
CREATE TABLE public.quantity_discount_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    media_format_id UUID NOT NULL,
    location_area TEXT NULL,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER NULL,
    discount_percentage NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NULL,
    updated_by UUID NULL
);

-- Enable Row Level Security
ALTER TABLE public.quantity_discount_tiers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active quantity discount tiers" 
ON public.quantity_discount_tiers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can view all quantity discount tiers" 
ON public.quantity_discount_tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create quantity discount tiers" 
ON public.quantity_discount_tiers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update quantity discount tiers" 
ON public.quantity_discount_tiers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete quantity discount tiers" 
ON public.quantity_discount_tiers 
FOR DELETE 
USING (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY (ARRAY['super_admin'::text, 'admin'::text])
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quantity_discount_tiers_updated_at
BEFORE UPDATE ON public.quantity_discount_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();