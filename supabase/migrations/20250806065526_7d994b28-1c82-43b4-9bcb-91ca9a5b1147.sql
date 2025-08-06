-- Update navigation to point to industries index page instead of automotive directly
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{menu_items}', 
  jsonb_set(
    setting_value->'menu_items',
    '{2}',
    '{"label": "Industries", "type": "internal", "url": "/industries"}'
  )
)
WHERE setting_key = 'main_navigation' AND is_active = true;