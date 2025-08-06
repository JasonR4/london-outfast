-- Create quotes table for storing user plans
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session_id TEXT NOT NULL,
  user_id UUID,
  total_cost NUMERIC DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'draft',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_company TEXT,
  additional_requirements TEXT,
  timeline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_items table for individual format selections
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  format_name TEXT NOT NULL,
  format_slug TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_periods INTEGER[] NOT NULL DEFAULT '{}',
  selected_areas TEXT[] NOT NULL DEFAULT '{}',
  production_cost NUMERIC DEFAULT 0.00,
  creative_cost NUMERIC DEFAULT 0.00,
  base_cost NUMERIC DEFAULT 0.00,
  total_cost NUMERIC DEFAULT 0.00,
  campaign_start_date DATE,
  campaign_end_date DATE,
  creative_needs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes
CREATE POLICY "Anyone can create quotes" 
ON public.quotes 
FOR INSERT 
USING (true);

CREATE POLICY "Users can view their session quotes" 
ON public.quotes 
FOR SELECT 
USING (
  user_session_id = current_setting('request.headers')::json->>'x-session-id'
  OR user_id = auth.uid()
);

CREATE POLICY "Users can update their session quotes" 
ON public.quotes 
FOR UPDATE 
USING (
  user_session_id = current_setting('request.headers')::json->>'x-session-id'
  OR user_id = auth.uid()
);

-- Create policies for quote_items
CREATE POLICY "Anyone can create quote items" 
ON public.quote_items 
FOR INSERT 
USING (true);

CREATE POLICY "Users can view their quote items" 
ON public.quote_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND (
      quotes.user_session_id = current_setting('request.headers')::json->>'x-session-id'
      OR quotes.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their quote items" 
ON public.quote_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND (
      quotes.user_session_id = current_setting('request.headers')::json->>'x-session-id'
      OR quotes.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their quote items" 
ON public.quote_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND (
      quotes.user_session_id = current_setting('request.headers')::json->>'x-session-id'
      OR quotes.user_id = auth.uid()
    )
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_items_updated_at
BEFORE UPDATE ON public.quote_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();