-- Insert About page into content_pages table
INSERT INTO content_pages (
  slug,
  title,
  meta_description,
  content,
  status,
  page_type,
  created_by,
  updated_by
) VALUES (
  'about',
  'About Us - Media Buying London',
  'Learn about Media Buying London, the fastest OOH media buying agency in London. Unbeaten on price, unmatched on speed.',
  '{
    "hero_title": "About Media Buying London",
    "hero_description": "London''s fastest OOH media buying agency. Unbeaten on price, unmatched on speed.",
    "hero_image": "",
    "sections": [
      {
        "id": "company-overview",
        "type": "text_with_media",
        "title": "Who We Are",
        "content": "Media Buying London is the capital''s premier out-of-home advertising agency, specializing in fast, cost-effective media buying solutions.",
        "media_type": "image",
        "media_url": "",
        "layout": "text_left_media_right"
      },
      {
        "id": "our-mission",
        "type": "text_with_media", 
        "title": "Our Mission",
        "content": "To revolutionize OOH advertising in London by delivering unbeatable prices and unmatched speed for all your media buying needs.",
        "media_type": "video",
        "media_url": "",
        "layout": "media_left_text_right"
      },
      {
        "id": "why-choose-us",
        "type": "feature_grid",
        "title": "Why Choose Us",
        "features": [
          {
            "title": "Fast Turnarounds",
            "description": "Get your campaigns live faster than any other agency in London",
            "icon": "clock",
            "media_url": ""
          },
          {
            "title": "Best Price Guarantee",
            "description": "We guarantee the most competitive rates in the market",
            "icon": "pound",
            "media_url": ""
          },
          {
            "title": "Expert Team",
            "description": "Experienced professionals who know the London market inside out",
            "icon": "users",
            "media_url": ""
          },
          {
            "title": "Full Service",
            "description": "From planning to execution, we handle everything",
            "icon": "service",
            "media_url": ""
          }
        ]
      },
      {
        "id": "team-gallery",
        "type": "media_gallery",
        "title": "Meet Our Team",
        "content": "The experts behind London''s fastest OOH media buying.",
        "gallery": []
      },
      {
        "id": "office-tour",
        "type": "video_section",
        "title": "Our London Office",
        "content": "Take a virtual tour of our offices in the heart of London.",
        "video_url": "",
        "thumbnail": ""
      },
      {
        "id": "testimonials",
        "type": "testimonial_carousel",
        "title": "What Our Clients Say",
        "testimonials": [
          {
            "quote": "Outstanding service and incredible value. They delivered our campaign ahead of schedule.",
            "author": "Sarah Johnson",
            "company": "TechStart London",
            "avatar": ""
          },
          {
            "quote": "The best rates in London, hands down. Professional team that really understands OOH.",
            "author": "Michael Chen", 
            "company": "Retail Giant",
            "avatar": ""
          }
        ]
      }
    ],
    "gallery": [],
    "custom_html": ""
  }'::jsonb,
  'published',
  'general',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000'
);