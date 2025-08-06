-- Add new quote statuses and fields for confirmed media schedules
ALTER TABLE public.quotes 
ADD COLUMN confirmed_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN confirmed_at timestamp with time zone,
ADD COLUMN confirmed_by uuid,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN rejected_at timestamp with time zone,
ADD COLUMN rejection_reason text,
ADD COLUMN contract_details jsonb DEFAULT '{}'::jsonb;

-- Add check constraint for valid statuses
ALTER TABLE public.quotes 
ADD CONSTRAINT valid_quote_status 
CHECK (status IN ('draft', 'submitted', 'confirmed', 'approved', 'rejected', 'contract', 'active', 'completed'));

-- Create index for better performance on status queries
CREATE INDEX idx_quotes_status_user ON public.quotes (status, user_id);