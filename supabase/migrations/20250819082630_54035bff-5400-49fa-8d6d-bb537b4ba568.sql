-- Move Contact under About dropdown
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  '[
    {"label": "Formats", "url": "/outdoor-media", "children": [
      {"label": "London Underground", "url": "/ooh/london-underground"},
      {"label": "Roadside Advertising", "url": "/ooh/roadside-billboards"}, 
      {"label": "Bus Advertising", "url": "/ooh/bus-advertising"},
      {"label": "Taxi Advertising", "url": "/ooh/taxi-advertising"},
      {"label": "Rail Advertising", "url": "/ooh/rail-advertising-london"},
      {"label": "Digital OOH", "url": "/ooh/digital-ooh"}
    ]},
    {"label": "Industries", "url": "/industries", "children": [
      {"label": "All Industries", "url": "/industries"}
    ]},
    {"label": "About", "url": "/about", "children": [
      {"label": "About Us", "url": "/about"},
      {"label": "How We Work", "url": "/how-we-work"},
      {"label": "Contact", "url": "/contact"},
      {"label": "FAQs", "url": "/faqs"}
    ]},
    {"label": "Blog", "url": "/blog"},
    {"label": "Rates", "url": "/media-buying-rates-london"}
  ]'::jsonb
)
WHERE setting_key = 'main_navigation' AND is_active = true;