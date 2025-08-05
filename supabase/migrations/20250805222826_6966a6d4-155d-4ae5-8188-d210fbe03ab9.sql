-- Update the page_type check constraint to allow all page types
ALTER TABLE content_pages DROP CONSTRAINT content_pages_page_type_check;

-- Add new constraint with all page types
ALTER TABLE content_pages ADD CONSTRAINT content_pages_page_type_check 
CHECK (page_type = ANY (ARRAY['ooh_format'::text, 'general'::text, 'landing'::text, 'home'::text, 'about'::text, 'faq'::text, 'legal'::text, 'industry'::text]));