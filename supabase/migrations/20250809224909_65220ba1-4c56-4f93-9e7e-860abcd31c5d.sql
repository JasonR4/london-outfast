-- Create a function to check if user email is from allowed domain
CREATE OR REPLACE FUNCTION public.is_allowed_cms_domain(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if the user's email is from r4advertising.agency domain
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = is_allowed_cms_domain.user_id 
    AND email LIKE '%@r4advertising.agency'
  );
END;
$function$