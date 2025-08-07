-- Allow NULL values in location_area column for rate_cards table
-- This enables bulk uploads with blank location areas for manual configuration
ALTER TABLE rate_cards ALTER COLUMN location_area DROP NOT NULL;