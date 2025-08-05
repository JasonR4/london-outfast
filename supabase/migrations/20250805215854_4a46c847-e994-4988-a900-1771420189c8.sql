-- Add About link to main navigation
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  (setting_value->'menu_items') || '[{"label": "About", "url": "/about"}]'::jsonb
)
WHERE setting_key = 'main_navigation' AND is_active = true;