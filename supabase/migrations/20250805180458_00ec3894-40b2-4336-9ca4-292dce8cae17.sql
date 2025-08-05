-- Create global settings table for navigation and footer
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_type TEXT NOT NULL CHECK (setting_type IN ('navigation', 'footer', 'general')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on global settings
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Global settings policies
CREATE POLICY "Anyone can view active global settings" ON public.global_settings 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view all global settings" ON public.global_settings 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create global settings" ON public.global_settings 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update global settings" ON public.global_settings 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete global settings" ON public.global_settings 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_global_settings_updated_at 
  BEFORE UPDATE ON public.global_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();