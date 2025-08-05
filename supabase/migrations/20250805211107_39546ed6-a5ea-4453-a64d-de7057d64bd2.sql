-- Update footer settings to include FAQs link
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{links,company}',
  setting_value->'links'->'company' || '[{"label": "FAQs", "url": "/faqs"}]'::jsonb
)
WHERE setting_key = 'main_footer';