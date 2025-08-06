-- Update navigation to make About a dropdown with Industries submenu
UPDATE public.global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  '[
    {"url": "/", "type": "internal", "label": "Home"},
    {"url": "/outdoor-media", "type": "internal", "label": "OOH Formats"},
    {"url": "/client-portal", "type": "internal", "label": "Client Portal"},
    {
      "type": "dropdown", 
      "label": "About", 
      "submenu": [
        {"url": "/about", "label": "About Us"},
        {"url": "/industries", "label": "Industries"}
      ]
    },
    {"url": "/quote", "type": "internal", "label": "Get Quote", "style": "primary"},
    {"url": "/configurator", "type": "internal", "label": "Configurator"}
  ]'::jsonb
),
updated_at = now()
WHERE setting_key = 'main_navigation' AND is_active = true;