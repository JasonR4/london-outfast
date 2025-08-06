-- Drop the existing check constraint and create a new one that includes 'client'
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'editor'::text, 'viewer'::text, 'client'::text]));

-- Now update the user role to 'client'
UPDATE public.profiles 
SET role = 'client', updated_at = now()
WHERE user_id = 'd3b5be5e-9ff5-4e6d-a027-5a404530b24d';