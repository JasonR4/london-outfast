-- Update the footer configuration to better organize the links and ensure all sections appear
UPDATE global_settings 
SET setting_value = jsonb_set(
  jsonb_set(
    jsonb_set(
      setting_value,
      '{links,services}',
      '[
        {"label": "OOH Quote", "url": "/quote"},
        {"label": "Campaign Configurator", "url": "/configurator"},
        {"label": "Format Directory", "url": "/outdoor-media"},
        {"label": "Industries", "url": "/industries"}
      ]'::jsonb
    ),
    '{links,industries}',
    '[
      {"label": "View All Industries", "url": "/industries"},
      {"label": "Retail & Shopping", "url": "/industries/retail"},
      {"label": "Technology", "url": "/industries/technology"},
      {"label": "Finance & Banking", "url": "/industries/finance"},
      {"label": "Food & Beverage", "url": "/industries/food-beverage"}
    ]'::jsonb
  ),
  '{links,company}',
  '[
    {"label": "OOH Environmental Hub", "url": "/ooh"},
    {"label": "What is Media Buying in London?", "url": "/what-is-media-buying"},
    {"label": "OOH Advertising London", "url": "/ooh-advertising-london"},
    {"label": "Corporate Investment", "url": "/corporate-investment"},
    {"label": "About Us", "url": "/about"},
    {"label": "Contact", "url": "/contact"},
    {"label": "Blog", "url": "/blog"},
    {"label": "FAQs", "url": "/faqs"},
    {"label": "London OOH Specialists", "url": "/london-ooh-specialists"}
  ]'::jsonb
)
WHERE setting_key = 'main_footer' AND is_active = true;