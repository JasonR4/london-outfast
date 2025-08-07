-- Create analytics_codes table for managing tracking scripts
CREATE TABLE public.analytics_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code_type TEXT NOT NULL CHECK (code_type IN ('gtm', 'google_analytics', 'facebook_pixel', 'custom_script', 'custom_pixel')),
  tracking_code TEXT NOT NULL,
  placement TEXT NOT NULL DEFAULT 'head' CHECK (placement IN ('head', 'body_start', 'body_end')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active analytics codes" 
ON public.analytics_codes 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can view all analytics codes" 
ON public.analytics_codes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create analytics codes" 
ON public.analytics_codes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update analytics codes" 
ON public.analytics_codes 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete analytics codes" 
ON public.analytics_codes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY (ARRAY['super_admin'::text, 'admin'::text])
));

-- Create trigger for updating timestamps
CREATE TRIGGER update_analytics_codes_updated_at
  BEFORE UPDATE ON public.analytics_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_analytics_codes_active ON public.analytics_codes(is_active);
CREATE INDEX idx_analytics_codes_type ON public.analytics_codes(code_type);
CREATE INDEX idx_analytics_codes_placement ON public.analytics_codes(placement);
CREATE INDEX idx_analytics_codes_priority ON public.analytics_codes(is_active, placement, priority);