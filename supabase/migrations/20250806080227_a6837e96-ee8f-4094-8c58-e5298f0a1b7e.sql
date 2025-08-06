-- Create homepage content table
CREATE TABLE public.homepage_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active homepage content" 
ON public.homepage_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can view all homepage content" 
ON public.homepage_content 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create homepage content" 
ON public.homepage_content 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update homepage content" 
ON public.homepage_content 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete homepage content" 
ON public.homepage_content 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY(ARRAY['super_admin'::text, 'admin'::text])
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_homepage_content_updated_at
BEFORE UPDATE ON public.homepage_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default homepage content
INSERT INTO public.homepage_content (section_key, content, created_by, updated_by) 
VALUES 
(
  'hero',
  '{
    "badge_text": "Buy smarter. Plan faster.",
    "main_title": "MEDIA BUYING LONDON",
    "subtitle": "London''s Fastest, Leanest OOH Media Buying Specialists",
    "description": "We don''t build brands — we get them seen. From 6-sheets to Digital 48s, we buy media that gets noticed. Fast turnarounds, insider rates, zero delay.",
    "primary_button_text": "GET MY MEDIA QUOTE",
    "secondary_button_text": "REQUEST CALLBACK",
    "browse_button_text": "Browse All OOH Formats →"
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'services',
  '{
    "badge_text": "OOH ADVERTISING FORMATS",
    "title": "Out-of-Home Media That Gets Noticed",
    "description": "From tube panels to digital billboards — we cover every format across London",
    "services": [
      {
        "title": "Transport & Commuter Hubs",
        "description": "High-impact advertising in London''s busiest transport networks",
        "formats": ["Tube Station Advertising", "Bus Stop Advertising", "Train Station Displays", "Airport Advertising"]
      },
      {
        "title": "Roadside & Bus Formats",
        "description": "Premium roadside visibility across London''s major routes",
        "formats": ["48 Sheet Billboards", "6 Sheet Posters", "Bus Advertising", "Mega 6 Roadside"]
      },
      {
        "title": "Digital & LED Displays",
        "description": "Dynamic digital advertising for maximum engagement",
        "formats": ["Digital 48 Sheets", "LED Screens", "Digital 6 Sheets", "Interactive Displays"]
      },
      {
        "title": "Retail & High Street",
        "description": "Strategic placement in London''s shopping districts",
        "formats": ["Shopping Centre Ads", "High Street Posters", "Retail Park Advertising", "Phone Kiosk Panels"]
      }
    ]
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'why_choose_us',
  '{
    "badge_text": "THE ALTERNATIVE TO SLOW-MOVING RETAINERS",
    "title": "We''re Media Buyers. That''s the Point.",
    "description": "No meetings about meetings. No fluff. No retainers. We don''t build brands — we get them seen. You bring the brief, we bring the space.",
    "features": [
      {
        "title": "Fast Turnarounds",
        "description": "Quotes within hours. Book today, live next week.",
        "highlight": "Same-day quotes"
      },
      {
        "title": "Best Price Guarantee",
        "description": "We beat any agency quote. No middleman fees.",
        "highlight": "Unbeatable rates"
      },
      {
        "title": "100% London Coverage",
        "description": "From Croydon to Camden. Full TfL access.",
        "highlight": "Complete coverage"
      },
      {
        "title": "All Budgets Welcome",
        "description": "From £500 local buys to £500K takeovers.",
        "highlight": "No minimum spend"
      },
      {
        "title": "Performance Focused",
        "description": "Plan by audience, postcode, footfall & WMI (Weighted Media Index).",
        "highlight": "Data-driven planning"
      },
      {
        "title": "Expert Planning",
        "description": "15+ years buying London media. We know every site.",
        "highlight": "Insider knowledge"
      }
    ],
    "clients_badge": "WHO USES US?",
    "clients_title": "From Startups to Enterprise",
    "clients": [
      "Local businesses launching in London",
      "National brands running metro-led activity",
      "Event promoters (clubs, gigs, activations)",
      "Retail chains pushing store traffic",
      "PR & media agencies outsourcing fast-turn buys",
      "Start-ups making noise with lean budgets"
    ]
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'how_it_works',
  '{
    "badge_text": "SIMPLE 4-STEP PROCESS",
    "title": "How We Get Your Campaign Live",
    "description": "From brief to live campaign in record time",
    "steps": [
      {
        "number": "01",
        "title": "Brief & Budget",
        "description": "Tell us your target audience, budget, and objectives. We''ll handle the rest."
      },
      {
        "number": "02", 
        "title": "Site Selection",
        "description": "We select the best performing sites based on your audience and footfall data."
      },
      {
        "number": "03",
        "title": "Quote & Book",
        "description": "Receive your quote within hours. Approve and we''ll book your media immediately."
      },
      {
        "number": "04",
        "title": "Go Live",
        "description": "Your campaign goes live with full reporting and performance tracking."
      }
    ],
    "addons_title": "Optional Add-Ons",
    "addons": [
      "Creative design and production",
      "Real-time campaign monitoring",
      "Advanced audience analytics", 
      "Multi-format campaign management",
      "Performance optimization"
    ]
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'format_links',
  '{
    "badge_text": "POPULAR OOH FORMATS",
    "title": "Quick Links to London OOH Advertising",
    "description": "Explore our most popular Out-of-Home advertising formats across London",
    "formats": [
      {
        "name": "6 Sheet Tube Panel",
        "slug": "6-sheet-tube-panel"
      },
      {
        "name": "Digital 48 Sheet", 
        "slug": "digital-48-sheet"
      },
      {
        "name": "Bus Superside",
        "slug": "bus-superside"
      },
      {
        "name": "Phone Kiosk Panels",
        "slug": "phone-kiosk-panels"
      },
      {
        "name": "Digital Escalator Panels",
        "slug": "digital-escalator-panels"
      },
      {
        "name": "Mega 6 Roadside",
        "slug": "mega-6-roadside"
      }
    ],
    "view_all_text": "View All Format Options"
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'cta',
  '{
    "badge_text": "READY TO GET STARTED?",
    "title": "Get Your London OOH Quote Today",
    "description": "Join hundreds of brands who trust us with their Out-of-Home media buying in London",
    "primary_button_text": "GET INSTANT QUOTE",
    "secondary_button_text": "SPEAK TO AN EXPERT"
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
);