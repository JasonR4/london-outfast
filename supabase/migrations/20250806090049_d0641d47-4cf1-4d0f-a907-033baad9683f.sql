-- Update rate_cards table to include location percentage markup
ALTER TABLE public.rate_cards ADD COLUMN location_markup_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Add comment explaining the markup system
COMMENT ON COLUMN public.rate_cards.location_markup_percentage IS 'Percentage markup applied to base rate for specific location areas. GD has 0%, boroughs can have custom markups.';

-- Update the trigger to handle the new column
CREATE OR REPLACE FUNCTION public.update_rate_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;