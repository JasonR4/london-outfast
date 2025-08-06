-- Add category column to production_cost_tiers table
ALTER TABLE public.production_cost_tiers 
ADD COLUMN category TEXT;