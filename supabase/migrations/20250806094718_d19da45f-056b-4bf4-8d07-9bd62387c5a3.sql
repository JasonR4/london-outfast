-- Add location_area column to production_cost_tiers and creative_design_cost_tiers
-- to support area-specific pricing

ALTER TABLE public.production_cost_tiers 
ADD COLUMN location_area TEXT;

ALTER TABLE public.creative_design_cost_tiers 
ADD COLUMN location_area TEXT;

-- Add indexes for better performance when querying by location and media format
CREATE INDEX idx_production_cost_tiers_location_format 
ON public.production_cost_tiers (location_area, media_format_id);

CREATE INDEX idx_creative_design_cost_tiers_location_format 
ON public.creative_design_cost_tiers (location_area, media_format_id);