-- Make global_settings safely readable so Navigation/Footer never disappear
-- 1) Ensure RLS is enabled
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- 2) Allow anyone (including anon) to read active settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'global_settings' 
      AND policyname = 'Public can read active global settings'
  ) THEN
    CREATE POLICY "Public can read active global settings"
    ON public.global_settings
    FOR SELECT
    TO public
    USING (is_active = true);
  END IF;
END $$;