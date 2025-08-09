-- Add proper footer content for global settings
UPDATE global_settings 
SET setting_value = '{
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
}'::jsonb
WHERE setting_key = 'main_footer';

-- Update hero background image to use proper CMS asset path
UPDATE homepage_content 
SET content = content || '{"background_image": "/assets/london-hero.jpg"}'::jsonb
WHERE section_key = 'hero';