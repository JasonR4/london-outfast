UPDATE global_settings 
SET setting_value = '{
  "logo": {
    "text": "Media Buying London",
    "url": "/"
  },
  "menu_items": [
    {
      "label": "Home",
      "url": "/",
      "type": "internal"
    },
    {
      "label": "OOH Formats",
      "url": "/outdoor-media",
      "type": "internal"
    },
    {
      "label": "Industries",
      "url": "/industries/automotive",
      "type": "internal"
    },
    {
      "label": "About",
      "url": "/about",
      "type": "internal"
    },
    {
      "label": "Get Quote",
      "url": "/quote",
      "type": "internal",
      "style": "primary"
    }
  ],
  "phone": "020 7946 0465",
  "cta_text": "Get Quote",
  "cta_url": "/quote"
}'
WHERE setting_key = 'main_navigation' AND is_active = true;