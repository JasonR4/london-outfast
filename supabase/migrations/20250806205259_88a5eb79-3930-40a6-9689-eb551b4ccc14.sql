-- Update the legal links in footer settings to match the correct routes
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{links,legal}',
  '[
    {"label": "Privacy Policy", "url": "/privacy-policy"},
    {"label": "Terms of Service", "url": "/terms-of-service"},
    {"label": "Cookie Policy", "url": "/cookie-policy"},
    {"label": "Disclaimer", "url": "/disclaimer"}
  ]'::jsonb
)
WHERE setting_key = 'main_footer';