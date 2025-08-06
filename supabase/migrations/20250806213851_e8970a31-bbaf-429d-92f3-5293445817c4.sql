-- Update creative design cost tiers to £85 per asset for all tiers
UPDATE creative_design_cost_tiers 
SET cost_per_unit = 85.00, updated_at = now()
WHERE media_format_id = (SELECT id FROM media_formats WHERE format_slug = '48-sheet-billboard');