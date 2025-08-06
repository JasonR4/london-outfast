-- Add discount tracking columns to quote_items table
ALTER TABLE public.quote_items 
ADD COLUMN discount_percentage numeric DEFAULT 0.00,
ADD COLUMN discount_amount numeric DEFAULT 0.00,
ADD COLUMN original_cost numeric DEFAULT 0.00;