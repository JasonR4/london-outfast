-- Add missing navigation and ensure footer data exists
INSERT INTO global_settings (setting_key, setting_type, setting_value, created_by, updated_by) VALUES 
('main_navigation', 'navigation', '{
  "logo": {
    "text": "Media Buying London",
    "image": "/lovable-uploads/28a73291-dea0-4613-86a7-66ef9fb9bb77.png"
  },
  "menu_items": [
    {"label": "Get Quote", "url": "/quote", "type": "primary"},
    {"label": "Configurator", "url": "/configurator"},
    {"label": "Formats", "url": "/outdoor-media"},
    {"label": "Industries", "url": "/industries"},
    {"label": "About", "url": "/about"},
    {"label": "Contact", "url": "/contact"},
    {"label": "Blog", "url": "/blog"}
  ],
  "cta_button": {
    "text": "Get Instant Quote",
    "url": "/quote"
  }
}'::jsonb, '00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = EXCLUDED.setting_value;

-- Ensure footer exists with proper data
INSERT INTO global_settings (setting_key, setting_type, setting_value, created_by, updated_by) VALUES 
('main_footer', 'footer', '{
  "company": {
    "name": "Media Buying London",
    "description": "London''s fastest OOH media buying agency. Unbeaten on price, unmatched on speed.",
    "phone": "020 7123 4567",
    "email": "hello@mediabuyinglondon.co.uk"
  },
  "links": {
    "services": [
      {"label": "OOH Quote", "url": "/quote"},
      {"label": "Campaign Configurator", "url": "/configurator"},
      {"label": "Format Directory", "url": "/outdoor-media"},
      {"label": "Industries", "url": "/industries"}
    ],
    "company": [
      {"label": "About Us", "url": "/about"},
      {"label": "Contact", "url": "/contact"},
      {"label": "Blog", "url": "/blog"},
      {"label": "FAQs", "url": "/faqs"}
    ],
    "legal": [
      {"label": "Privacy Policy", "url": "/privacy-policy"},
      {"label": "Terms of Service", "url": "/terms-of-service"},
      {"label": "Cookie Policy", "url": "/cookie-policy"},
      {"label": "Disclaimer", "url": "/disclaimer"}
    ]
  },
  "copyright": "© 2024 Media Buying London. All rights reserved."
}'::jsonb, '00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = EXCLUDED.setting_value;