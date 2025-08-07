-- Allow NULL values in discount_percentage column for discount_tiers table
-- This enables bulk uploads with default/placeholder values that can be configured later
ALTER TABLE discount_tiers ALTER COLUMN discount_percentage DROP NOT NULL;