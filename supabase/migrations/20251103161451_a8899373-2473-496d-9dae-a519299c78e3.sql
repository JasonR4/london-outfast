-- Create table for brief requests submitted via the submit-brief edge function
CREATE TABLE IF NOT EXISTS public.brief_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL,

  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company text NOT NULL,
  website text NULL,
  jobtitle text NULL,

  budget_band text NOT NULL,
  objective text NOT NULL,
  target_areas text[] NOT NULL DEFAULT '{}',
  formats text[] NOT NULL DEFAULT '{}',
  start_month date NULL,
  creative_status text NOT NULL,
  notes text NULL,
  source_path text NULL,
  utm_source text NULL,
  utm_medium text NULL,
  utm_campaign text NULL,
  utm_term text NULL,
  utm_content text NULL,
  mbl boolean NOT NULL DEFAULT true
);

-- Enable RLS (service role used by edge function bypasses RLS)
ALTER TABLE public.brief_requests ENABLE ROW LEVEL SECURITY;

-- Keep timestamps updated and track updater where available
DROP TRIGGER IF EXISTS update_brief_requests_updated_at ON public.brief_requests;
CREATE TRIGGER update_brief_requests_updated_at
BEFORE UPDATE ON public.brief_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_and_by();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_brief_requests_created_at ON public.brief_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brief_requests_email ON public.brief_requests (email);
