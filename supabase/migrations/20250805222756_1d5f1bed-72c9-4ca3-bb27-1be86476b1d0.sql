-- Add industry pages to CMS
-- Insert all industry pages from the IndustriesDropdown data

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/automotive',
  'Out-of-Home Advertising for Automotive Industry',
  '{"hero_title": "Out-of-Home Advertising for Automotive Industry", "hero_description": "Strategic outdoor advertising campaigns for automotive brands across London."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/automotive');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/agencies',
  'Out-of-Home Advertising for Agencies & In-House Teams',
  '{"hero_title": "Out-of-Home Advertising for Agencies & In-House Teams", "hero_description": "Professional OOH media buying services for agencies and in-house marketing teams."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/agencies');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/beauty',
  'Out-of-Home Advertising for Beauty & Wellness',
  '{"hero_title": "Out-of-Home Advertising for Beauty & Wellness", "hero_description": "Outdoor advertising solutions for beauty and wellness brands in London."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/beauty');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/construction',
  'Out-of-Home Advertising for Construction & Trade',
  '{"hero_title": "Out-of-Home Advertising for Construction & Trade", "hero_description": "Effective outdoor advertising for construction and trade businesses."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/construction');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/education',
  'Out-of-Home Advertising for Education Sector',
  '{"hero_title": "Out-of-Home Advertising for Education Sector", "hero_description": "Strategic outdoor advertising campaigns for educational institutions."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/education');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/entertainment',
  'Out-of-Home Advertising for Entertainment Industry',
  '{"hero_title": "Out-of-Home Advertising for Entertainment Industry", "hero_description": "High-impact outdoor advertising for entertainment and media brands."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/entertainment');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/events',
  'Out-of-Home Advertising for Events & Entertainment',
  '{"hero_title": "Out-of-Home Advertising for Events & Entertainment", "hero_description": "Drive event attendance with strategic outdoor advertising campaigns."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/events');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/fashion',
  'Out-of-Home Advertising for Fashion & Lifestyle',
  '{"hero_title": "Out-of-Home Advertising for Fashion & Lifestyle", "hero_description": "Premium outdoor advertising solutions for fashion and lifestyle brands."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/fashion');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/financial-services',
  'Out-of-Home Advertising for Financial Services',
  '{"hero_title": "Out-of-Home Advertising for Financial Services", "hero_description": "Trusted outdoor advertising for financial services and fintech companies."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/financial-services');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/food',
  'Out-of-Home Advertising for Food & Drink',
  '{"hero_title": "Out-of-Home Advertising for Food & Drink", "hero_description": "Appetite-driving outdoor advertising for food and beverage brands."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/food');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/government',
  'Out-of-Home Advertising for Government & Public Sector',
  '{"hero_title": "Out-of-Home Advertising for Government & Public Sector", "hero_description": "Public awareness campaigns through strategic outdoor advertising."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/government');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/healthcare',
  'Out-of-Home Advertising for Healthcare Industry',
  '{"hero_title": "Out-of-Home Advertising for Healthcare Industry", "hero_description": "Compliant outdoor advertising solutions for healthcare providers."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/healthcare');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/property',
  'Out-of-Home Advertising for Property & Real Estate',
  '{"hero_title": "Out-of-Home Advertising for Property & Real Estate", "hero_description": "Drive property inquiries with targeted outdoor advertising campaigns."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/property');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/recruitment',
  'Out-of-Home Advertising for Recruitment Industry',
  '{"hero_title": "Out-of-Home Advertising for Recruitment Industry", "hero_description": "Attract top talent through strategic outdoor advertising campaigns."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/recruitment');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/retail',
  'Out-of-Home Advertising for Retail Industry',
  '{"hero_title": "Out-of-Home Advertising for Retail Industry", "hero_description": "Drive footfall and sales with strategic retail outdoor advertising."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/retail');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/startups',
  'Out-of-Home Advertising for Startups & Scaleups',
  '{"hero_title": "Out-of-Home Advertising for Startups & Scaleups", "hero_description": "Cost-effective outdoor advertising solutions for growing businesses."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/startups');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/technology',
  'Out-of-Home Advertising for Technology Sector',
  '{"hero_title": "Out-of-Home Advertising for Technology Sector", "hero_description": "Innovative outdoor advertising for tech companies and SaaS businesses."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/technology');

INSERT INTO content_pages (slug, title, content, status, page_type, created_by, updated_by)
SELECT 
  'industries/travel',
  'Out-of-Home Advertising for Travel & Hospitality',
  '{"hero_title": "Out-of-Home Advertising for Travel & Hospitality", "hero_description": "Inspire wanderlust with captivating outdoor advertising campaigns."}',
  'published',
  'industry',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'industries/travel');