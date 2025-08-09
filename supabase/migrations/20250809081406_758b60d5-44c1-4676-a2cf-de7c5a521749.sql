-- Update 16 Sheet rate card values per audit
UPDATE public.rate_cards
SET 
  base_rate_per_incharge = 700,
  sale_price = 578,
  reduced_price = NULL,
  is_active = TRUE
WHERE media_format_id = '2e0681d8-6476-4365-ac1f-58dc36cd59da';