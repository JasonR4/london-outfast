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

-- Insert default navigation settings
INSERT INTO public.global_settings (setting_key, setting_value, setting_type, created_by, updated_by) 
SELECT 
  'main_navigation',
  '{
    "logo": {
      "text": "Media Buying London",
      "url": "/"
    },
    "menu_items": [
      {"label": "Home", "url": "/", "type": "internal"},
      {"label": "OOH Formats", "url": "/outdoor-media", "type": "internal"},
      {"label": "Get Quote", "url": "/quote", "type": "internal", "style": "primary"}
    ],
    "phone": "020 7946 0465",
    "cta_text": "Get Quote",
    "cta_url": "/quote"
  }'::jsonb,
  'navigation',
  id,
  id
FROM auth.users LIMIT 1;

-- Insert default footer settings  
INSERT INTO public.global_settings (setting_key, setting_value, setting_type, created_by, updated_by)
SELECT 
  'main_footer',
  '{
    "company": {
      "name": "Media Buying London",
      "description": "London\'s leading outdoor advertising specialists. We secure the best rates and premium locations for billboard, transit, and digital OOH campaigns across the capital.",
      "address": "123 Oxford Street, London W1D 2HX",
      "phone": "020 7946 0465",
      "email": "hello@mediabuyinglondon.com"
    },
    "links": {
      "services": [
        {"label": "Billboard Advertising", "url": "/outdoor-media/48-sheet-billboard"},
        {"label": "Transport Advertising", "url": "/outdoor-media/tube-car-panels"},
        {"label": "Digital OOH", "url": "/outdoor-media/digital-billboard"},
        {"label": "Street Furniture", "url": "/outdoor-media/bus-shelter"}
      ],
      "company": [
        {"label": "About Us", "url": "/about"},
        {"label": "Case Studies", "url": "/case-studies"},
        {"label": "Contact", "url": "/contact"},
        {"label": "Blog", "url": "/blog"}
      ],
      "legal": [
        {"label": "Privacy Policy", "url": "/privacy"},
        {"label": "Terms of Service", "url": "/terms"},
        {"label": "Cookie Policy", "url": "/cookies"}
      ]
    },
    "social": [
      {"platform": "LinkedIn", "url": "https://linkedin.com/company/mediabuyinglondon", "icon": "linkedin"},
      {"platform": "Twitter", "url": "https://twitter.com/mediabuyinglondon", "icon": "twitter"}
    ],
    "copyright": "© 2024 Media Buying London. All rights reserved."
  }'::jsonb,
  'footer',
  id,
  id  
FROM auth.users LIMIT 1;