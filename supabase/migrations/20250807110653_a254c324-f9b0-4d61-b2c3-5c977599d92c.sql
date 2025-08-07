-- Allow NULL values in cost_per_unit column for creative_design_cost_tiers table
-- This enables bulk uploads with default/placeholder values that can be configured later
ALTER TABLE creative_design_cost_tiers ALTER COLUMN cost_per_unit DROP NOT NULL;