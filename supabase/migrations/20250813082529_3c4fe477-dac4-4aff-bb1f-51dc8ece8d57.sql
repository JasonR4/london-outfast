-- Ensure hero description is properly stored in CMS for SEO optimization
UPDATE public.homepage_content
SET content = COALESCE(content, '{}'::jsonb) || jsonb_build_object(
  'subtitle', 'From London Underground (TfL) to Classic & Digital Roadside, Bus, Taxi, National Rail, Retail & Leisure, Airports, Street Furniture, Programmatic DOOH, and Ambient OOH — we secure the best locations, the best rates, and deliver same-day quotes.',
  'title', 'London''s Fastest Out-of-Home Media Buying Specialists'
),
updated_at = now()
WHERE section_key = 'hero' AND is_active = true;

-- Insert hero section if it doesn't exist
INSERT INTO public.homepage_content (section_key, content, is_active)
SELECT 'hero', jsonb_build_object(
  'title', 'London''s Fastest Out-of-Home Media Buying Specialists',
  'subtitle', 'From London Underground (TfL) to Classic & Digital Roadside, Bus, Taxi, National Rail, Retail & Leisure, Airports, Street Furniture, Programmatic DOOH, and Ambient OOH — we secure the best locations, the best rates, and deliver same-day quotes.',
  'ctas', jsonb_build_array(
    jsonb_build_object('key','quote','heading','Get My Quote','description','Get your OOH campaign booked today.','label','Get My Quote','route','https://mediabuyinglondon.co.uk/quote','variant','default'),
    jsonb_build_object('key','configurator','heading','Use the Configurator','description','Answer a few quick questions and we'll recommend the right formats, locations, and budget split.','label','Use the Configurator','route','https://mediabuyinglondon.co.uk/configurator','variant','secondary'),
    jsonb_build_object('key','browse','heading','Explore Outdoor Media','description','Browse London's OOH environments, formats, and placement opportunities.','label','Explore Outdoor Media','route','https://mediabuyinglondon.co.uk/outdoor-media','variant','outline'),
    jsonb_build_object('key','specialist','heading','Send My Brief','description','Discuss your brief directly with a senior MBL media buying specialist.','label','Send My Brief','route','https://mediabuyinglondon.co.uk/brief','variant','accent')
  )
), true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_content WHERE section_key = 'hero');

-- Update SEO page for homepage to include this description
INSERT INTO public.seo_pages (page_slug, meta_title, meta_description, meta_keywords, h1_heading, h2_headings, content, location_data, is_active)
VALUES (
  '/',
  'London''s Fastest Out-of-Home Media Buying Specialists | Media Buying London',
  'From London Underground (TfL) to Classic & Digital Roadside, Bus, Taxi, National Rail, Retail & Leisure, Airports, Street Furniture, Programmatic DOOH, and Ambient OOH — we secure the best locations, the best rates, and deliver same-day quotes.',
  'London Out-of-Home advertising, OOH media buying, TfL advertising, London Underground ads, digital roadside advertising, bus advertising London, taxi advertising, National Rail advertising, retail advertising, airport advertising, street furniture advertising, programmatic DOOH, ambient advertising',
  'London''s Fastest Out-of-Home Media Buying Specialists',
  '["Why Choose Media Buying London", "Our OOH Media Services", "Get Started Today"]',
  jsonb_build_object(
    'services', 'TfL, Roadside, Bus, Taxi, Rail, Retail & Leisure, Airports, Street Furniture, pDOOH, Ambient',
    'unique_selling_points', 'Best locations, best rates, same-day quotes',
    'target_audience', 'London advertisers, media buyers, marketing professionals'
  ),
  jsonb_build_object(
    'primary_location', 'London',
    'coverage_areas', '["Greater London", "Central London", "London Underground", "London Transport"]'
  ),
  true
)
ON CONFLICT (page_slug) DO UPDATE SET
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  content = EXCLUDED.content,
  updated_at = now();