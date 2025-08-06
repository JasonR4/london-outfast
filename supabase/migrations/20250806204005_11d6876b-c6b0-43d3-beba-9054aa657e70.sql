-- Fix the navigation JSON formatting - need proper double quotes for JSON
UPDATE public.global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  '[
    {"url": "/", "type": "internal", "label": "Home"},
    {"url": "/outdoor-media", "type": "internal", "label": "OOH Formats"},
    {"url": "/client-portal", "type": "internal", "label": "Client Portal"},
    {"url": "/about", "type": "internal", "label": "About"},
    {"url": "/quote", "type": "internal", "label": "Get Quote", "style": "primary"},
    {"url": "/configurator", "type": "internal", "label": "Configurator"}
  ]'::jsonb
),
updated_at = now()
WHERE setting_key = 'main_navigation' AND is_active = true;