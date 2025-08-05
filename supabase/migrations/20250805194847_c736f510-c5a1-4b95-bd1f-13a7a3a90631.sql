-- Add heading structure fields to seo_pages table for complete SEO optimization
ALTER TABLE public.seo_pages 
ADD COLUMN IF NOT EXISTS h1_heading TEXT,
ADD COLUMN IF NOT EXISTS h2_headings TEXT[],
ADD COLUMN IF NOT EXISTS h3_headings TEXT[],
ADD COLUMN IF NOT EXISTS content_structure JSONB DEFAULT '{"word_count": 0, "readability_score": 0, "keyword_density": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS alt_texts TEXT[],
ADD COLUMN IF NOT EXISTS internal_links_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_links_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS page_speed_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mobile_friendly BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ssl_enabled BOOLEAN DEFAULT true;