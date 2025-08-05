-- Update profiles table to support super_admin role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer'));

-- Update global settings policies for super admin
DROP POLICY IF EXISTS "Admins can delete global settings" ON public.global_settings;
CREATE POLICY "Super admins can delete global settings" ON public.global_settings 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Update content pages policies for super admin  
DROP POLICY IF EXISTS "Admins can delete content" ON public.content_pages;
CREATE POLICY "Admins can delete content" ON public.content_pages 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Update media library policies for super admin
DROP POLICY IF EXISTS "Admins can delete any media" ON public.media_library;
CREATE POLICY "Admins can delete any media" ON public.media_library 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_super_admin.user_id 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create policy for super admin to manage all profiles
CREATE POLICY "Super admins can update any profile role" ON public.profiles 
  FOR UPDATE USING (
    public.is_super_admin(auth.uid())
  );

-- If matt@r4advertising.agency exists, update their role to super_admin
-- This will only work if they've already signed up
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'matt@r4advertising.agency';

-- Create default navigation and footer settings if they don't exist
INSERT INTO public.global_settings (setting_key, setting_value, setting_type, created_by, updated_by)
SELECT 
  'main_navigation',
  '{"logo": {"text": "Media Buying London", "url": "/"}, "menu_items": [{"label": "Home", "url": "/", "type": "internal"}, {"label": "OOH Formats", "url": "/outdoor-media", "type": "internal"}, {"label": "Get Quote", "url": "/quote", "type": "internal", "style": "primary"}], "phone": "020 7946 0465", "cta_text": "Get Quote", "cta_url": "/quote"}'::jsonb,
  'navigation',
  id,
  id
FROM auth.users 
WHERE email = 'matt@r4advertising.agency'
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.global_settings (setting_key, setting_value, setting_type, created_by, updated_by)
SELECT 
  'main_footer',
  '{"company": {"name": "Media Buying London", "description": "London leading outdoor advertising specialists. We secure the best rates and premium locations for billboard, transit, and digital OOH campaigns across the capital.", "address": "123 Oxford Street, London W1D 2HX", "phone": "020 7946 0465", "email": "hello@mediabuyinglondon.com"}, "links": {"services": [{"label": "Billboard Advertising", "url": "/outdoor-media/48-sheet-billboard"}, {"label": "Transport Advertising", "url": "/outdoor-media/tube-car-panels"}, {"label": "Digital OOH", "url": "/outdoor-media/digital-billboard"}, {"label": "Street Furniture", "url": "/outdoor-media/bus-shelter"}], "company": [{"label": "About Us", "url": "/about"}, {"label": "Case Studies", "url": "/case-studies"}, {"label": "Contact", "url": "/contact"}, {"label": "Blog", "url": "/blog"}], "legal": [{"label": "Privacy Policy", "url": "/privacy"}, {"label": "Terms of Service", "url": "/terms"}, {"label": "Cookie Policy", "url": "/cookies"}]}, "social": [{"platform": "LinkedIn", "url": "https://linkedin.com/company/mediabuyinglondon", "icon": "linkedin"}, {"platform": "Twitter", "url": "https://twitter.com/mediabuyinglondon", "icon": "twitter"}], "copyright": "© 2024 Media Buying London. All rights reserved."}'::jsonb,
  'footer',
  id,
  id
FROM auth.users 
WHERE email = 'matt@r4advertising.agency'
ON CONFLICT (setting_key) DO NOTHING;