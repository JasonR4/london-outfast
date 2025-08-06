-- Add RLS policy to allow admins to delete quotes
CREATE POLICY "Admins can delete quotes" 
ON public.quotes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('super_admin', 'admin')
  )
);