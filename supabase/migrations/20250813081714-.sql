-- Update CMS hero content: title, subtitle, and CTA set
UPDATE public.homepage_content
SET content = COALESCE(content, '{}'::jsonb) || jsonb_build_object(
  'title', 'London’s Fastest Out-of-Home Media Buying Specialists',
  'subtitle', 'From London Underground (TfL) to Classic & Digital Roadside, Bus, Taxi, National Rail, Retail & Leisure, Airports, Street Furniture, Programmatic DOOH, and Ambient OOH — we secure the best locations, the best rates, and deliver same-day quotes.',
  'ctas', jsonb_build_array(
    jsonb_build_object('key','quote','heading','I know what I want','description','Get your OOH campaign booked today.','label','Get My Quote','route','/quote','variant','default'),
    jsonb_build_object('key','configurator','heading','I need guidance','description','Answer a few quick questions and we’ll recommend the right formats, locations, and budget split.','label','Use the Configurator','route','/configurator','variant','outline'),
    jsonb_build_object('key','browse','heading','I’m just exploring','description','Browse London’s OOH environments, formats, and placement opportunities.','label','Explore Outdoor Media','route','/outdoor-media','variant','ghost'),
    jsonb_build_object('key','specialist','heading','Talk to an OOH specialist','description','Discuss your brief directly with a senior MBL media buying specialist.','label','Send My Brief','route','/brief','variant','accent')
  )
),
updated_at = now()
WHERE section_key = 'hero' AND is_active = true;