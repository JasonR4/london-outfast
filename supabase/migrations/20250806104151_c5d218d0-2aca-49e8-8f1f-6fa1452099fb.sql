-- Create incharge_periods table to store predefined incharge periods
CREATE TABLE public.incharge_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_number INTEGER NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incharge_periods ENABLE ROW LEVEL SECURITY;

-- Create policies for incharge_periods (read-only for authenticated users)
CREATE POLICY "Incharge periods are viewable by authenticated users" 
ON public.incharge_periods 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create rate_card_periods junction table to link rate cards with specific incharge periods
CREATE TABLE public.rate_card_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_card_id UUID NOT NULL REFERENCES public.rate_cards(id) ON DELETE CASCADE,
  incharge_period_id UUID NOT NULL REFERENCES public.incharge_periods(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rate_card_id, incharge_period_id)
);

-- Enable RLS
ALTER TABLE public.rate_card_periods ENABLE ROW LEVEL SECURITY;

-- Create policies for rate_card_periods
CREATE POLICY "Rate card periods are viewable by authenticated users" 
ON public.rate_card_periods 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Rate card periods are manageable by authenticated users" 
ON public.rate_card_periods 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_rate_card_periods_rate_card_id ON public.rate_card_periods(rate_card_id);
CREATE INDEX idx_rate_card_periods_incharge_period_id ON public.rate_card_periods(incharge_period_id);
CREATE INDEX idx_incharge_periods_period_number ON public.incharge_periods(period_number);

-- Update discount_tiers table to use periods instead of incharges
ALTER TABLE public.discount_tiers DROP COLUMN IF EXISTS min_incharges;
ALTER TABLE public.discount_tiers DROP COLUMN IF EXISTS max_incharges;
ALTER TABLE public.discount_tiers ADD COLUMN min_periods INTEGER;
ALTER TABLE public.discount_tiers ADD COLUMN max_periods INTEGER;

-- Insert incharge periods for 2025
INSERT INTO public.incharge_periods (period_number, start_date, end_date) VALUES
(16, '2025-07-29', '2025-08-11'),
(17, '2025-08-12', '2025-08-25'),
(18, '2025-08-26', '2025-09-08'),
(19, '2025-09-09', '2025-09-22'),
(20, '2025-09-23', '2025-10-06'),
(21, '2025-10-07', '2025-10-20'),
(22, '2025-10-21', '2025-11-03'),
(23, '2025-11-04', '2025-11-17'),
(24, '2025-11-18', '2025-12-01'),
(25, '2025-12-02', '2025-12-15'),
(26, '2025-12-16', '2025-12-29');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_incharge_periods_updated_at
  BEFORE UPDATE ON public.incharge_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_card_periods_updated_at
  BEFORE UPDATE ON public.rate_card_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();