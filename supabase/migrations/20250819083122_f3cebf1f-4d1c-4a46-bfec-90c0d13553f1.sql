-- Update the phone number in the footer settings to the correct number
UPDATE global_settings 
SET setting_value = jsonb_set(
  jsonb_set(
    setting_value,
    '{company,phone}',
    '"+44 204 524 3019"'::jsonb
  ),
  '{bottom}',
  '[
    {"label": "Client Portal", "href": "/client-portal"},
    {"+44 204 524 3019": "tel:+442045243019"}
  ]'::jsonb
)
WHERE setting_key = 'main_footer' AND is_active = true;