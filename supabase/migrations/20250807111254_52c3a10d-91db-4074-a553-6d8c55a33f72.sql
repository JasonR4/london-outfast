-- Add foreign key relationship between quantity_discount_tiers and media_formats
-- This enables proper joins between the tables
ALTER TABLE quantity_discount_tiers 
ADD CONSTRAINT fk_quantity_discount_tiers_media_format 
FOREIGN KEY (media_format_id) REFERENCES media_formats(id);