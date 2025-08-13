-- Create investor_commitments table for tracking funding progress
CREATE TABLE IF NOT EXISTS public.investor_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  investor_email TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'committed' CHECK (status IN ('committed', 'pending', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.investor_commitments ENABLE ROW LEVEL SECURITY;

-- Create policies for investor_commitments
CREATE POLICY "Anyone can view committed amounts" 
ON public.investor_commitments 
FOR SELECT 
USING (status = 'committed');

CREATE POLICY "Authenticated users can insert commitments" 
ON public.investor_commitments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update commitments" 
ON public.investor_commitments 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);