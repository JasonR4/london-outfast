-- Remove duplicate rate cards, keeping only the oldest record for each unique combination
WITH duplicates_to_remove AS (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY media_format_id, location_area, base_rate_per_incharge, incharge_period, sale_price, reduced_price
        ORDER BY created_at ASC  -- Keep the oldest record
      ) as row_num
    FROM rate_cards 
    WHERE is_active = true
  ) ranked
  WHERE row_num > 1  -- Remove all but the first (oldest) record
)
DELETE FROM rate_cards 
WHERE id IN (SELECT id FROM duplicates_to_remove);

-- Log the cleanup results
SELECT 
  'Cleanup completed' as status,
  COUNT(*) as remaining_rate_cards
FROM rate_cards 
WHERE is_active = true;