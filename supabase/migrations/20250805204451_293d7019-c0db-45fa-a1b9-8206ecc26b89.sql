-- Update main_footer global settings to include legal pages and complete footer information
INSERT INTO public.global_settings (setting_key, setting_value, setting_type, is_active, created_by, updated_by)
VALUES (
  'main_footer',
  '{
    "company": {
      "name": "Media Buying London",
      "description": "London''s fastest OOH media buying agency. Unbeaten on price, unmatched on speed.",
      "phone": "020 7946 0465",
      "email": "hello@mediabuyinglondon.co.uk",
      "address": "London, UK"
    },
    "links": {
      "services": [
        {"label": "Billboard Advertising", "url": "/outdoor-media/48-sheet-billboard"},
        {"label": "Transport Advertising", "url": "/outdoor-media/bus-advertising"},
        {"label": "Digital OOH", "url": "/outdoor-media/digital-billboard"},
        {"label": "Street Furniture", "url": "/outdoor-media/6-sheet-poster"}
      ],
      "company": [
        {"label": "About Us", "url": "/about"},
        {"label": "Case Studies", "url": "/case-studies"},
        {"label": "Contact", "url": "/contact"},
        {"label": "Get Quote", "url": "/quote"}
      ],
      "legal": [
        {"label": "Privacy Policy", "url": "/privacy-policy"},
        {"label": "Terms of Service", "url": "/terms-of-service"},
        {"label": "Cookie Policy", "url": "/cookie-policy"},
        {"label": "Disclaimer", "url": "/disclaimer"}
      ]
    },
    "social": {
      "twitter": "https://twitter.com/mediabuyinglondon",
      "linkedin": "https://linkedin.com/company/mediabuyinglondon",
      "facebook": "https://facebook.com/mediabuyinglondon"
    },
    "copyright": "© 2024 Media Buying London. All rights reserved."
  }',
  'footer',
  true,
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();