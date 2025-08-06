-- Add sample creative design cost tiers for the 48 Sheet Billboard format
INSERT INTO creative_design_cost_tiers (
  media_format_id, 
  location_area, 
  min_quantity, 
  max_quantity, 
  cost_per_unit, 
  category, 
  is_active
) VALUES 
-- General creative costs (applies to all areas)
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 1, 5, 250.00, 'Standard Design', true),
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 6, 15, 200.00, 'Standard Design', true),
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 16, NULL, 150.00, 'Standard Design', true),

-- Premium creative options
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 1, 5, 450.00, 'Premium Design', true),
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 6, 15, 400.00, 'Premium Design', true),
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 16, NULL, 350.00, 'Premium Design', true),

-- Basic creative options  
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 1, 10, 125.00, 'Basic Design', true),
('d74fbd53-c726-4510-a718-d40ab1fe139b', NULL, 11, NULL, 100.00, 'Basic Design', true);