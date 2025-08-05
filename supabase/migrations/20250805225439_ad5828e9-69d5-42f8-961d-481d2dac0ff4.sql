-- Update main_navigation settings to include configurator
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  setting_value->'menu_items' || '[{"label": "Configurator", "url": "/configurator", "type": "internal"}]'::jsonb
)
WHERE setting_key = 'main_navigation' AND setting_type = 'navigation';