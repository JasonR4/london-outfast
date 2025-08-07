-- Update rate card for 48-sheet to have correct configuration
UPDATE rate_cards 
SET 
  is_date_specific = false,  -- false means custom dates (date-specific)
  base_rate_per_incharge = 5000.00,
  updated_at = now()
WHERE media_format_id IN (
  SELECT id FROM media_formats WHERE format_slug = '48-sheet'
);