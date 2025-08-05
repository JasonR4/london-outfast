-- Update footer company description to include "media planners and buyers"
UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{company,description}',
  '"London''s fastest media planners and buyers. Unbeaten on price, unmatched on speed."'::jsonb
)
WHERE setting_key = 'main_footer' AND is_active = true;