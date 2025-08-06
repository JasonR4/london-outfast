-- Add quantity_per_medium field to rate_cards table
ALTER TABLE public.rate_cards 
ADD COLUMN quantity_per_medium integer DEFAULT 1;