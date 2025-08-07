-- Insert contact page content if it doesn't exist
INSERT INTO homepage_content (section_key, content, is_active, created_by, updated_by)
SELECT 
  'contact',
  jsonb_build_object(
    'hero', jsonb_build_object(
      'badge_text', 'GET IN TOUCH',
      'title', 'LET''S TALK MEDIA',
      'description', 'From quick quotes to complex campaigns. We''re here to get your brand seen across London.'
    ),
    'methods', jsonb_build_object(
      'badge_text', 'MULTIPLE WAYS TO REACH US',
      'title', 'Choose Your Preferred Contact Method'
    ),
    'location', jsonb_build_object(
      'address', 'Central London Office',
      'details', 'Private meeting rooms available for campaign planning sessions. Street parking and tube stations nearby.'
    ),
    'cta', jsonb_build_object(
      'title', 'Ready to Get Started?',
      'description', 'Join hundreds of brands who trust us with their London OOH campaigns.'
    )
  ),
  true,
  (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM homepage_content WHERE section_key = 'contact'
);