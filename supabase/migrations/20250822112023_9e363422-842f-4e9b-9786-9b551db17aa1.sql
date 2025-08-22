-- Update River Bus Advertising sale price to £2000
UPDATE rate_cards 
SET sale_price = 2000.00,
    updated_at = now(),
    updated_by = auth.uid()
WHERE media_format_id IN (
  SELECT id FROM media_formats 
  WHERE format_name ILIKE '%river bus%' 
  OR format_slug ILIKE '%river-bus%'
);