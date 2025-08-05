-- Fix security issues from linter

-- 1. Fix search_path for update_seo_pages_updated_at function
CREATE OR REPLACE FUNCTION public.update_seo_pages_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;