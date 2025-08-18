UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{links,formats}',
  '[
    {"label": "OOH Hub", "url": "/ooh"},
    {"label": "Bus Advertising", "url": "/ooh/bus-advertising"},
    {"label": "Underground Advertising", "url": "/ooh/london-underground"},
    {"label": "Digital OOH", "url": "/ooh/digital-ooh"},
    {"label": "Roadside Billboards", "url": "/ooh/roadside-billboards"},
    {"label": "Rail Advertising", "url": "/ooh/rail-advertising-london"},
    {"label": "Taxi Advertising", "url": "/ooh/taxi-advertising"},
    {"label": "Airport Advertising", "url": "/ooh/airport-advertising"}
  ]'::jsonb
)
WHERE setting_key = 'main_footer' AND is_active = true;