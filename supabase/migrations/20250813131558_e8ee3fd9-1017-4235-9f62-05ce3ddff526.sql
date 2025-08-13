-- Update setting_type constraint to allow more types including schema
ALTER TABLE global_settings DROP CONSTRAINT IF EXISTS global_settings_setting_type_check;
ALTER TABLE global_settings ADD CONSTRAINT global_settings_setting_type_check 
CHECK (setting_type IN ('navigation', 'footer', 'content', 'schema', 'seo'));