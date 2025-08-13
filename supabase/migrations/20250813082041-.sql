-- Sync hero CTA content in CMS with absolute URLs and visual variants
UPDATE public.homepage_content
SET content = COALESCE(content, '{}'::jsonb) || jsonb_build_object(
  'ctas', jsonb_build_array(
    jsonb_build_object('key','quote','heading','Get My Quote','description','Get your OOH campaign booked today.','label','Get My Quote','route','https://mediabuyinglondon.co.uk/quote','variant','default'),
    jsonb_build_object('key','configurator','heading','Use the Configurator','description','Answer a few quick questions and we’ll recommend the right formats, locations, and budget split.','label','Use the Configurator','route','https://mediabuyinglondon.co.uk/configurator','variant','secondary'),
    jsonb_build_object('key','browse','heading','Explore Outdoor Media','description','Browse London’s OOH environments, formats, and placement opportunities.','label','Explore Outdoor Media','route','https://mediabuyinglondon.co.uk/outdoor-media','variant','outline'),
    jsonb_build_object('key','specialist','heading','Send My Brief','description','Discuss your brief directly with a senior MBL media buying specialist.','label','Send My Brief','route','https://mediabuyinglondon.co.uk/brief','variant','accent')
  )
),
updated_at = now()
WHERE section_key = 'hero' AND is_active = true;