-- Add new page types to support all pages in CMS
-- Update page_type to include industry, about, faq, legal, and home page types

-- First, let's add the new page types by inserting some base pages if they don't exist

-- Insert home/index page
INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'home',
  'Home Page',
  '{"hero_title": "Out-of-Home Advertising Specialists in London", "hero_description": "Strategic outdoor advertising campaigns across London. Expert media buying for maximum impact and ROI."}',
  'published',
  'home',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'home');

-- Insert about page
INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'about',
  'About Us',
  '{"hero_title": "We''re specialist media planners and buyers.", "hero_description": "Expert out-of-home advertising campaigns across London with proven results."}',
  'published',
  'about',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'about');

-- Insert FAQ page
INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'faqs',
  'Frequently Asked Questions',
  '{"hero_title": "Frequently Asked Questions", "hero_description": "Get answers to common questions about out-of-home advertising in London."}',
  'published',
  'faq',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'faqs');

-- Insert legal pages
INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'privacy-policy',
  'Privacy Policy',
  '{"hero_title": "Privacy Policy", "content": "Our privacy policy content will be here."}',
  'published',
  'legal',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'privacy-policy');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'terms-of-service',
  'Terms of Service',
  '{"hero_title": "Terms of Service", "content": "Our terms of service content will be here."}',
  'published',
  'legal',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'terms-of-service');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'cookie-policy',
  'Cookie Policy',
  '{"hero_title": "Cookie Policy", "content": "Our cookie policy content will be here."}',
  'published',
  'legal',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'cookie-policy');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'disclaimer',
  'Disclaimer',
  '{"hero_title": "Disclaimer", "content": "Our disclaimer content will be here."}',
  'published',
  'legal',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'disclaimer');