-- Add quote items for test quotes
INSERT INTO quote_items (
  quote_id, format_name, format_slug, quantity, selected_areas, 
  selected_periods, base_cost, total_cost, total_inc_vat
) 
SELECT 
  q.id,
  CASE 
    WHEN q.contact_name LIKE '%Format%' THEN '48-sheet Billboard'
    WHEN q.contact_name LIKE '%Configurator%' THEN '6-sheet Poster'
    WHEN q.contact_name LIKE '%Smart%' THEN 'Digital Bus Side'
    ELSE 'Standard Format'
  END as format_name,
  CASE 
    WHEN q.contact_name LIKE '%Format%' THEN '48-sheet-billboard'
    WHEN q.contact_name LIKE '%Configurator%' THEN '6-sheet-poster' 
    WHEN q.contact_name LIKE '%Smart%' THEN 'digital-bus-side'
    ELSE 'standard-format'
  END as format_slug,
  2 as quantity,
  ARRAY['Westminster', 'Camden'] as selected_areas,
  ARRAY[1, 2] as selected_periods,
  q.total_cost as base_cost,
  q.total_cost as total_cost,
  q.total_inc_vat as total_inc_vat
FROM quotes q 
WHERE q.user_session_id IN ('test-format-session-001', 'test-config-session-002', 'test-smart-session-003');