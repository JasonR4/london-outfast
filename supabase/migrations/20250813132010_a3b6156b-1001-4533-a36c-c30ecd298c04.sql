-- Add london-ooh-specialists link to footer company section
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{links,company}',
  setting_value->'links'->'company' || '[{"url": "/london-ooh-specialists", "label": "London OOH Specialists"}]'
)
WHERE setting_key = 'main_footer' AND is_active = true;