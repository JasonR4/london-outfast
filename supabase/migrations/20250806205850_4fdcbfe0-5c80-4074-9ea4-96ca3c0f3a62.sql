-- Add VAT settings to global settings
INSERT INTO global_settings (setting_key, setting_type, setting_value, is_active)
VALUES (
  'vat_settings',
  'tax',
  '{"vat_rate": 20, "vat_enabled": true, "vat_inclusive": false}'::jsonb,
  true
)
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = '{"vat_rate": 20, "vat_enabled": true, "vat_inclusive": false}'::jsonb,
updated_at = now();

-- Add VAT columns to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5, 2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS total_inc_vat NUMERIC(10, 2);

-- Add VAT columns to quote_items table  
ALTER TABLE quote_items
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5, 2) DEFAULT 20,
ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS total_inc_vat NUMERIC(10, 2);

-- Update existing quotes to have VAT calculations
-- For existing records, assume current total_cost is excluding VAT
UPDATE quotes 
SET 
  subtotal = total_cost,
  vat_rate = 20,
  vat_amount = ROUND(total_cost * 0.20, 2),
  total_inc_vat = ROUND(total_cost * 1.20, 2)
WHERE subtotal IS NULL;

-- Update existing quote_items to have VAT calculations  
UPDATE quote_items
SET 
  subtotal = total_cost,
  vat_rate = 20,
  vat_amount = ROUND(total_cost * 0.20, 2),
  total_inc_vat = ROUND(total_cost * 1.20, 2)
WHERE subtotal IS NULL;