-- Update About page to use accordion for "Who We Help" section
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{sections}',
  '[
    {
      "id": "hero_ctas",
      "type": "text_with_media",
      "title": "Ready to Get Started?",
      "content": "Choose your next step:",
      "layout": "text_only",
      "cta_buttons": [
        {
          "text": "Get a Quote",
          "url": "/quote",
          "style": "primary"
        },
        {
          "text": "See Media Formats", 
          "url": "/formats",
          "style": "secondary"
        }
      ]
    },
    {
      "id": "mbl_difference",
      "type": "text_with_media",
      "title": "We''re Not an Agency. That''s the Point.",
      "content": "No meetings about meetings.\nNo fluff. No retainers.\nWe don''t build brands — we get them seen.\n\nWe''re media buyers and planners. And we''re very, very good at it.",
      "layout": "text_only"
    },
    {
      "id": "mission",
      "type": "text_with_media", 
      "title": "OOH, Done Differently",
      "content": "Our mission is simple:\nBuy smarter. Plan faster. Cut out the middle.\n\nWe deliver out-of-home campaigns across London with unmatched access, insider rates, and zero delay.",
      "layout": "text_only"
    },
    {
      "id": "who_we_help",
      "type": "industries_accordion",
      "title": "Who We Help",
      "subtitle": "Full Industry List",
      "industries": [
        {
          "id": "startups",
          "icon": "🏢",
          "title": "Startups & Scaleups",
          "description": "Launching something bold? Need visibility now, not later? We get you on the map fast.",
          "url": "/industries/startups"
        },
        {
          "id": "healthcare",
          "icon": "🏥",
          "title": "Clinics & Healthcare",
          "description": "GPs, private practices, dental chains, med-tech brands — if you''re patient-facing, we''ll help you grow your list.",
          "url": "/industries/healthcare"
        },
        {
          "id": "retail",
          "icon": "🛍️",
          "title": "Retail & FMCG",
          "description": "From West End flagships to high street launches and national D2C brands — store traffic, footfall, and brand recall, sorted.",
          "url": "/industries/retail"
        },
        {
          "id": "events",
          "icon": "🎟️",
          "title": "Events, Shows & Venues",
          "description": "Festivals, exhibitions, theatre runs, club nights — if it needs bums on seats or boots on floors, we''ll drive them there.",
          "url": "/industries/events"
        },
        {
          "id": "education",
          "icon": "🧪",
          "title": "Education & Training",
          "description": "Unis, colleges, bootcamps, recruitment weeks — reach students where they live, move, and study.",
          "url": "/industries/education"
        },
        {
          "id": "beauty",
          "icon": "💄",
          "title": "Beauty & Wellness",
          "description": "Salons, skincare, supplement brands, clinics, aesthetics — visual-first campaigns that perform IRL.",
          "url": "/industries/beauty"
        },
        {
          "id": "automotive",
          "icon": "🚗",
          "title": "Automotive",
          "description": "EV rollouts, dealership campaigns, launch events — hit key commuting corridors and showroom hotspots.",
          "url": "/industries/automotive"
        },
        {
          "id": "agencies",
          "icon": "💼",
          "title": "Agencies & In-House Teams",
          "description": "Need fast-turn media buying or campaign fulfilment? White-label us, brief us, or outsource to us.",
          "url": "/industries/agencies"
        },
        {
          "id": "property",
          "icon": "🏙️",
          "title": "Property & Real Estate",
          "description": "Off-plan launches, lettings, show homes — dominate the postcodes that matter to your buyers.",
          "url": "/industries/property"
        },
        {
          "id": "travel",
          "icon": "🧳",
          "title": "Travel & Hospitality",
          "description": "Hotels, airlines, resorts, tourism boards — targeting affluent leisure audiences and mobile professionals.",
          "url": "/industries/travel"
        },
        {
          "id": "construction",
          "icon": "🛠️",
          "title": "Construction & Trade",
          "description": "From contractor recruitment to supply chain marketing — yes, even scaffold banners and wraps.",
          "url": "/industries/construction"
        },
        {
          "id": "tech",
          "icon": "📱",
          "title": "Tech & Apps",
          "description": "SaaS, fintech, delivery, or on-demand — OOH builds credibility and trust at scale, especially in launch phase.",
          "url": "/industries/tech"
        },
        {
          "id": "food",
          "icon": "🍔",
          "title": "Food & Drink",
          "description": "Fast casual, franchise rollouts, new menu promos — we''ll put your food where it belongs: in front of hungry Londoners.",
          "url": "/industries/food"
        },
        {
          "id": "government",
          "icon": "🪧",
          "title": "Local Government & Public Sector",
          "description": "Recruitment drives, public health, transport info — compliant. Efficient. Impactful.",
          "url": "/industries/government"
        },
        {
          "id": "entertainment",
          "icon": "🎧",
          "title": "Music, Media & Entertainment",
          "description": "Album drops, podcast tours, radio takeovers — London''s streets are your stage.",
          "url": "/industries/entertainment"
        },
        {
          "id": "recruitment",
          "icon": "🎓",
          "title": "Recruitment & Careers",
          "description": "Employer branding, hiring ads, job boards — from healthcare to tech to the trades.",
          "url": "/industries/recruitment"
        },
        {
          "id": "finance",
          "icon": "🏦",
          "title": "Finance & Legal",
          "description": "Credit unions, challenger banks, mortgage brands — trust-building placements in premium locations.",
          "url": "/industries/finance"
        },
        {
          "id": "fashion",
          "icon": "🪩",
          "title": "Fashion & Lifestyle",
          "description": "Collections, pop-ups, resale, collabs — turn heads in London''s highest footfall zones.",
          "url": "/industries/fashion"
        },
        {
          "id": "custom",
          "icon": "🧠",
          "title": "Need something not listed?",
          "description": "We don''t limit by sector — we only care about one thing: Does your message need to be seen in the real world? If yes, we''ll make it happen.",
          "url": "/quote"
        }
      ]
    },
    {
      "id": "closing",
      "type": "text_with_media",
      "title": "The Alternative to Slow-Moving Retainers",
      "content": "If you''re tired of slow-moving \"full-service\" retainers, welcome to the alternative.",
      "layout": "text_only"
    }
  ]'::jsonb
)
WHERE slug = 'about';