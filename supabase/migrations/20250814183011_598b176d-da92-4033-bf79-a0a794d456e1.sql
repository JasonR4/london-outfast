-- Update main navigation to include "How We Work"
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  (setting_value->'menu_items') || '[{"label": "How We Work", "url": "/how-we-work"}]'::jsonb
)
WHERE setting_key = 'main_navigation' AND is_active = true;