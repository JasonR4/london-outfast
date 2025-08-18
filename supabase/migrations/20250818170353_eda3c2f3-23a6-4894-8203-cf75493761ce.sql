UPDATE global_settings 
SET setting_value = jsonb_set(
  setting_value,
  '{menu_items}',
  (
    SELECT jsonb_agg(item)
    FROM jsonb_array_elements(setting_value->'menu_items') AS item
    WHERE item->>'label' != 'Configurator'
  )
)
WHERE setting_key = 'main_navigation' AND is_active = true;