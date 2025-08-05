-- Create FAQs page content with correct page_type
INSERT INTO content_pages (
  slug,
  title,
  meta_description,
  page_type,
  status,
  created_by,
  updated_by,
  content
) VALUES (
  'faqs',
  'FAQs – Media Buying London',
  'Straight-talking answers to your biggest questions about media buying in London. No jargon. No fluff. Just clarity.',
  'standard',
  'published',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '{
    "hero_title": "You''ve Got Questions.\nWe''ve Got Answers — No Waffle.",
    "hero_description": "This is where we cut the jargon and give it to you straight.\nMedia buying shouldn''t feel like a maze — here''s everything you need to know before you book.",
    "sections": [
      {
        "id": "hero_ctas",
        "type": "text_with_media",
        "title": "Ready to Get Started?",
        "content": "Choose your next step:",
        "layout": "text_only",
        "cta_buttons": [
          {
            "text": "Still Got a Question?",
            "url": "/contact",
            "style": "primary"
          },
          {
            "text": "Get a Quote",
            "url": "/quote",
            "style": "secondary"
          }
        ]
      },
      {
        "id": "faqs",
        "type": "faq_accordion",
        "title": "Frequently Asked Questions",
        "faqs": [
          {
            "id": "not-agency",
            "question": "Are you really not an agency?",
            "answer": "Correct. No retainers. No strategy decks. No time-wasting. We buy media and plan campaigns, fast. That''s it."
          },
          {
            "id": "media-formats",
            "question": "What kind of media formats do you offer?",
            "answer": "Everything that gets your brand seen:\n\n• Digital 48s\n• Classic 6-sheets\n• Tube escalator panels (DEPs)\n• X-track projectors (XTPs)\n• Bus sides, taxis, phone boxes\n• Mall screens, supermarket panels\n\nIf it''s out there in London — we can book it."
          },
          {
            "id": "campaign-speed",
            "question": "How fast can I get a campaign live?",
            "answer": "We can quote you today. Most bookings go live within 48–72 hours. Need it sooner? Try us."
          },
          {
            "id": "small-budget",
            "question": "Can I book with a small budget?",
            "answer": "100%. We build around budgets — not minimums. Whether you''ve got £500 or £50,000, we''ll make it work."
          },
          {
            "id": "creative-support",
            "question": "Do you offer creative support?",
            "answer": "Yes — we can connect you to fast-turn creative partners or build static/digital assets for you at speed.\nNeed motion, animation or layouts? Sorted."
          },
          {
            "id": "london-coverage",
            "question": "Do you cover all of London?",
            "answer": "Yes — all 32 boroughs plus Greater London commuter zones.\nWe book TfL, roadside, rail, retail, and everything in between."
          },
          {
            "id": "white-label",
            "question": "Can you white-label for agencies?",
            "answer": "Absolutely. We handle buying, planning, and POP delivery while you keep the credit.\nCall us your secret weapon — we don''t mind."
          },
          {
            "id": "reporting",
            "question": "Will I get reporting or proof of play?",
            "answer": "Always. You''ll get:\n\n• Proof of Posting (POP)\n• Schedule data\n• Locations confirmed pre-launch\n• Photos or digital reports depending on format"
          }
        ]
      },
      {
        "id": "final_cta",
        "type": "text_with_media",
        "title": "Still Got a Question?\nOr Want a Quote That''ll Shock Your Agency?",
        "content": "Let''s talk. We''re fast, friendly, and we''ll never waste your time.",
        "layout": "text_only",
        "cta_buttons": [
          {
            "text": "Book a Call",
            "url": "/contact",
            "style": "primary"
          },
          {
            "text": "Send a Quick Message",
            "url": "/contact",
            "style": "secondary"
          }
        ]
      }
    ]
  }'::jsonb
);