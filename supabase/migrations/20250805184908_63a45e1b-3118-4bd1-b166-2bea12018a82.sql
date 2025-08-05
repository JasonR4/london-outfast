-- Create SEO pages table for managing SEO data
CREATE TABLE public.seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schema_markup JSONB DEFAULT '{}',
  focus_keyword TEXT NOT NULL,
  london_locations TEXT[] DEFAULT '{}',
  competitor_analysis JSONB DEFAULT '{}',
  content_score INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view SEO pages" 
ON public.seo_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create SEO pages" 
ON public.seo_pages 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update SEO pages" 
ON public.seo_pages 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete SEO pages" 
ON public.seo_pages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('super_admin', 'admin')
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_seo_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_seo_pages_updated_at
BEFORE UPDATE ON public.seo_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_seo_pages_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_seo_pages_slug ON public.seo_pages(page_slug);
CREATE INDEX idx_seo_pages_focus_keyword ON public.seo_pages(focus_keyword);
CREATE INDEX idx_seo_pages_keywords ON public.seo_pages USING GIN(keywords);
CREATE INDEX idx_seo_pages_london_locations ON public.seo_pages USING GIN(london_locations);