-- Fix River Bus Advertising rate to £675
UPDATE rate_cards 
SET sale_price = 675
WHERE media_format_id IN (
  SELECT id FROM media_formats WHERE format_name = 'River Bus Advertising'
);