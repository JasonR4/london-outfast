-- Create media format categories table for proper category management
CREATE TABLE public.media_format_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_format_id UUID NOT NULL REFERENCES public.media_formats(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL CHECK (category_type IN ('location', 'format')),
  category_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Ensure no duplicate categories per format
  UNIQUE(media_format_id, category_type, category_name)
);

-- Enable RLS
ALTER TABLE public.media_format_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for media format categories
CREATE POLICY "Anyone can view active media format categories"
ON public.media_format_categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can view all media format categories"
ON public.media_format_categories
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create media format categories"
ON public.media_format_categories
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update media format categories"
ON public.media_format_categories
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete media format categories"
ON public.media_format_categories
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('super_admin', 'admin')
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_media_format_categories_updated_at
BEFORE UPDATE ON public.media_format_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for media_formats table
ALTER publication supabase_realtime ADD TABLE public.media_formats;

-- Enable realtime for media_format_categories table  
ALTER publication supabase_realtime ADD TABLE public.media_format_categories;