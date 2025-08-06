-- Update the user role to 'client' instead of 'editor'
UPDATE public.profiles 
SET role = 'client', updated_at = now()
WHERE user_id = 'd3b5be5e-9ff5-4e6d-a027-5a404530b24d';