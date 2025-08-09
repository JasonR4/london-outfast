-- Update the hero content with proper data
UPDATE homepage_content 
SET content = '{
  "title": "MEDIA BUYING LONDON",
  "subtitle": "London''s Fastest, Leanest OOH Media Buying Specialists", 
  "description": "We don''t build brands — we get them seen. From 6-sheets to Digital 48s, we buy media that gets noticed. Fast turnarounds, insider rates, zero delay.",
  "background_image": "/assets/london-hero.jpg"
}'::jsonb
WHERE section_key = 'hero';