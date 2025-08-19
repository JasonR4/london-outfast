-- Remove dropdown from OOH HUB, make it just a link to /ooh
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  '[
    {"label": "OOH HUB", "url": "/ooh"},
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