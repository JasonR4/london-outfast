-- Update the about page with new Media Buying London content
UPDATE content_pages 
SET 
  title = 'About Media Buying London',
  meta_description = 'We''re not an agency. We''re London''s fastest media buyers and planners. No fluff. No markups. Just results.',
  content = '{
    "hero_title": "We''re Not an Agency. We''re the Ones Agencies Call.",
    "hero_description": "London''s fastest, leanest OOH media buying specialists. From Tube panels to roadside billboards, we buy media that gets seen — fast, and for less.",
    "sections": [
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
        "type": "feature_grid",
        "title": "Who''s This For?",
        "features": [
          {
            "icon": "building",
            "title": "Startups launching something new",
            "description": "Fresh brands that need maximum impact on minimal budgets"
          },
          {
            "icon": "cross",
            "title": "Clinics & retail chains scaling fast", 
            "description": "Healthcare and retail businesses expanding across London"
          },
          {
            "icon": "ticket",
            "title": "Events that need bums on seats",
            "description": "Concerts, conferences, and experiences driving attendance"
          },
          {
            "icon": "shopping-bag",
            "title": "Store launches, promos, takeovers",
            "description": "Retail activations and promotional campaigns"
          },
          {
            "icon": "briefcase",
            "title": "Agencies that need extra firepower",
            "description": "Full-service agencies requiring specialist OOH expertise"
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
    ]
  }'::jsonb,
  updated_at = now()
WHERE slug = 'about';