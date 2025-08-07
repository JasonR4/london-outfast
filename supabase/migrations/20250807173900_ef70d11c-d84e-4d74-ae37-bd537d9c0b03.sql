-- Fix hand-to-hand leafleting rate card to show correct pricing
UPDATE rate_cards 
SET 
  sale_price = NULL,  -- Remove sale price to use base rate
  updated_at = now()
WHERE media_format_id = '29ac845a-2679-42ba-9a6e-949ed40aa973';