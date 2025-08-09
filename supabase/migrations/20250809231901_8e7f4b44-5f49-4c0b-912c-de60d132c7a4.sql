-- Add missing homepage content sections that are causing loading issues
INSERT INTO homepage_content (section_key, content, is_active) VALUES 
('hero', '{"title": "MEDIA BUYING LONDON", "subtitle": "London''s Fastest, Leanest OOH Media Buying Specialists", "description": "We don''t build brands — we get them seen. From 6-sheets to Digital 48s, we buy media that gets noticed. Fast turnarounds, insider rates, zero delay."}', true),
('configurator_teaser', '{"title": "Smart OOH Configurator", "subtitle": "AI-Powered Campaign Planning"}', true),
('planning_tools', '{"title": "Planning Tools", "subtitle": "Everything you need to plan your perfect OOH campaign"}', true)
ON CONFLICT (section_key) DO UPDATE SET 
content = EXCLUDED.content,
is_active = EXCLUDED.is_active;