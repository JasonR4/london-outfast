-- Add foreign key constraint to creative_design_cost_tiers table
ALTER TABLE public.creative_design_cost_tiers 
ADD CONSTRAINT creative_design_cost_tiers_media_format_id_fkey 
FOREIGN KEY (media_format_id) 
REFERENCES public.media_formats(id) 
ON DELETE CASCADE;