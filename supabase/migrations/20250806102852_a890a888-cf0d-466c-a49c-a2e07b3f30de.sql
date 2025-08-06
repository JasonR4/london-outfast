-- Add date fields to rate_cards table for incharge period management
ALTER TABLE public.rate_cards 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN incharge_period INTEGER DEFAULT 1,
ADD COLUMN is_date_specific BOOLEAN DEFAULT false;

-- Add comment to explain the new fields
COMMENT ON COLUMN public.rate_cards.start_date IS 'Start date for this rate card period (used for incharge-based media)';
COMMENT ON COLUMN public.rate_cards.end_date IS 'End date for this rate card period (used for incharge-based media)';
COMMENT ON COLUMN public.rate_cards.incharge_period IS 'Which incharge period this rate applies to (1, 2, 3, etc.)';
COMMENT ON COLUMN public.rate_cards.is_date_specific IS 'Whether this rate card has specific dates (true for incharge media, false for gorilla/ambient)';

-- Create index for date-based queries
CREATE INDEX idx_rate_cards_dates ON public.rate_cards(media_format_id, start_date, end_date) WHERE is_date_specific = true;