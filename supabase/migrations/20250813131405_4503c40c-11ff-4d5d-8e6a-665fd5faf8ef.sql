-- Add FAQ data for outdoor-media page
INSERT INTO global_settings (setting_key, setting_value, setting_type, created_by, updated_by) VALUES (
'page_outdoor_media_schema',
'{
  "seo": {
    "canonical": "/outdoor-media"
  },
  "schema": {
    "faq_enabled": true,
    "faq_items": [
      {
        "question": "What is outdoor media buying?",
        "answer": "Outdoor media buying is the process of securing advertising space across out-of-home formats such as billboards, premium digital screens, street-level panels, and landmark sites to reach a defined target audience."
      },
      {
        "question": "How long does it take to launch a London OOH campaign?",
        "answer": "Campaigns can go live within days, subject to format availability, creative approval, and location booking windows."
      },
      {
        "question": "How are campaign locations selected?",
        "answer": "Locations are selected using audience, footfall, and traffic data to align sites with campaign objectives and budget."
      },
      {
        "question": "What'\''s included in the client portal?",
        "answer": "A full media schedule with precise site addresses, format specifications, campaign dates, and delivery updates."
      },
      {
        "question": "Can I book specific boroughs or postcodes?",
        "answer": "Yes. Booking can be scoped city-wide or narrowed to boroughs, districts, or postcode clusters."
      }
    ]
  }
}',
'page_schema',
'00000000-0000-0000-0000-000000000000',
'00000000-0000-0000-0000-000000000000'
) ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
updated_at = now();

-- Add FAQ data for london-ooh-specialists page  
INSERT INTO global_settings (setting_key, setting_value, setting_type, created_by, updated_by) VALUES (
'page_london_ooh_specialists_schema',
'{
  "seo": {
    "canonical": "/london-ooh-specialists"
  },
  "schema": {
    "faq_enabled": true,
    "faq_items": [
      {
        "question": "What does a London OOH specialist do?",
        "answer": "Plans and buys outdoor campaigns across billboards, premium digital, and street-level formats to deliver reach and impact in the capital."
      },
      {
        "question": "Which formats work best in London?",
        "answer": "Depends on objective: large-format billboards for mass reach; premium digital and street-level for targeted engagement."
      },
      {
        "question": "How is performance measured?",
        "answer": "Using impression models, location data, and campaign delivery reporting aligned to business outcomes."
      },
      {
        "question": "What budgets are required?",
        "answer": "Budgets vary by format and dates; plans can be built from single sites to multi-format citywide deployments."
      },
      {
        "question": "How quickly can a proposal be turned around?",
        "answer": "Quotes and draft schedules are typically produced within 24 hours, subject to brief clarity."
      }
    ]
  }
}',
'page_schema',
'00000000-0000-0000-0000-000000000000',
'00000000-0000-0000-0000-000000000000'
) ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
updated_at = now();