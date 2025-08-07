-- Allow NULL values in base_rate_per_incharge column for rate_cards table
-- This enables bulk uploads with default/placeholder values that can be configured later
ALTER TABLE rate_cards ALTER COLUMN base_rate_per_incharge DROP NOT NULL;