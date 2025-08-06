-- Update RLS policy to allow anyone to view rate card periods (needed for anonymous quote creation)
DROP POLICY IF EXISTS "Rate card periods are viewable by authenticated users" ON public.rate_card_periods;

CREATE POLICY "Anyone can view rate card periods" 
ON public.rate_card_periods 
FOR SELECT 
USING (true);