-- Allow NULL values in category column for creative_design_cost_tiers table
-- This enables bulk uploads with default/placeholder values that can be configured later
ALTER TABLE creative_design_cost_tiers ALTER COLUMN category DROP NOT NULL;