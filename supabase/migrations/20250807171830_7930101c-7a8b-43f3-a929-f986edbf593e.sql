-- Fix existing rate cards with empty location_area
UPDATE rate_cards 
SET location_area = 'GD' 
WHERE location_area = '' OR location_area IS NULL;

-- Add constraint to prevent empty location_area values in the future
ALTER TABLE rate_cards 
ADD CONSTRAINT rate_cards_location_area_not_empty 
CHECK (location_area IS NOT NULL AND location_area != '');

-- Update the default value for location_area to be 'GD'
ALTER TABLE rate_cards 
ALTER COLUMN location_area SET DEFAULT 'GD';

-- Fix any existing production cost tiers with empty location_area
UPDATE production_cost_tiers 
SET location_area = 'GD' 
WHERE location_area = '';

-- Fix any existing creative design cost tiers with empty location_area  
UPDATE creative_design_cost_tiers 
SET location_area = 'GD' 
WHERE location_area = '';

-- Fix any existing quantity discount tiers with empty location_area
UPDATE quantity_discount_tiers 
SET location_area = 'GD' 
WHERE location_area = '';