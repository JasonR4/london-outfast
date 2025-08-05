-- Update the main_footer global setting with complete footer information
UPDATE global_settings 
SET setting_value = '{
  "company": {
    "name": "Media Buying London",
    "description": "London''s fastest OOH media buying agency. Unbeaten on price, unmatched on speed.",
    "phone": "020 7946 0465",
    "email": "hello@mediabuyinglondon.co.uk"
  },
  "links": {
    "services": [
      {"label": "Billboard Advertising", "url": "/formats/billboard"},
      {"label": "Transport Advertising", "url": "/formats/transport"},
      {"label": "Digital OOH", "url": "/formats/digital"},
      {"label": "Street Furniture", "url": "/formats/street-furniture"}
    ],
    "company": [
      {"label": "About Us", "url": "/about"},
      {"label": "Case Studies", "url": "/case-studies"},
      {"label": "Contact", "url": "/contact"},
      {"label": "Get Quote", "url": "/quote"}
    ],
    "legal": [
      {"label": "Privacy Policy", "url": "/legal/privacy-policy"},
      {"label": "Terms of Service", "url": "/legal/terms-of-service"},
      {"label": "Cookie Policy", "url": "/legal/cookie-policy"},
      {"label": "Disclaimer", "url": "/legal/disclaimer"}
    ]
  },
  "copyright": "© 2024 Media Buying London. All rights reserved."
}'::jsonb,
updated_at = now()
WHERE setting_key = 'main_footer';