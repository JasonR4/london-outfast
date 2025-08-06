-- Update RLS policy to allow anyone to view incharge periods
DROP POLICY IF EXISTS "Incharge periods are viewable by authenticated users" ON public.incharge_periods;

CREATE POLICY "Anyone can view incharge periods" 
ON public.incharge_periods 
FOR SELECT 
USING (true);