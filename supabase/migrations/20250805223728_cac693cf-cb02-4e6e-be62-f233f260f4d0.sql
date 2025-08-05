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
      "url": "/industries",
      "type": "dropdown",
      "submenu": [
        {
          "label": "Automotive",
          "url": "/industries/automotive"
        },
        {
          "label": "Fashion & Retail",
          "url": "/industries/fashion-retail"
        },
        {
          "label": "Technology",
          "url": "/industries/technology"
        },
        {
          "label": "Food & Beverage",
          "url": "/industries/food-beverage"
        },
        {
          "label": "Healthcare",
          "url": "/industries/healthcare"
        },
        {
          "label": "Finance",
          "url": "/industries/finance"
        },
        {
          "label": "Entertainment",
          "url": "/industries/entertainment"
        },
        {
          "label": "Education",
          "url": "/industries/education"
        },
        {
          "label": "Property",
          "url": "/industries/property"
        },
        {
          "label": "Tourism & Travel",
          "url": "/industries/tourism-travel"
        },
        {
          "label": "Nonprofit",
          "url": "/industries/nonprofit"
        },
        {
          "label": "Professional Services",
          "url": "/industries/professional-services"
        }
      ]
    },
    {
      "label": "About",
      "url": "/about",
      "type": "internal"
    },
    {
      "label": "FAQs",
      "url": "/faqs",
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