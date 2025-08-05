-- Insert core website pages into CMS using valid page_type
INSERT INTO public.content_pages (slug, title, meta_description, content, status, page_type, created_by, updated_by) VALUES
(
  'home',
  'London OOH Advertising Solutions',
  'Leading out-of-home advertising agency in London. Discover billboard, digital, transport, and ambient advertising solutions across the capital.',
  '{
    "hero_title": "London OOH Advertising Solutions",
    "hero_description": "Leading out-of-home advertising agency in London. Discover billboard, digital, transport, and ambient advertising solutions across the capital.",
    "sections": []
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'about',
  'About Us - London OOH Advertising',
  'Learn about our London-based out-of-home advertising agency. Expert team, proven results, comprehensive OOH solutions across the capital.',
  '{
    "hero_title": "About Us",
    "hero_description": "Learn about our London-based out-of-home advertising agency. Expert team, proven results, comprehensive OOH solutions across the capital.",
    "sections": []
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'contact',
  'Contact Us - London OOH Advertising',
  'Get in touch with our London OOH advertising team. Expert consultation, custom solutions, and competitive pricing for your campaign.',
  '{
    "hero_title": "Contact Us",
    "hero_description": "Get in touch with our London OOH advertising team. Expert consultation, custom solutions, and competitive pricing for your campaign.",
    "sections": []
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'case-studies',
  'Case Studies - London OOH Advertising Success Stories',
  'Explore our successful London out-of-home advertising campaigns. Real results, innovative strategies, and proven ROI across all OOH formats.',
  '{
    "hero_title": "Case Studies",
    "hero_description": "Explore our successful London out-of-home advertising campaigns. Real results, innovative strategies, and proven ROI across all OOH formats.",
    "sections": []
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'privacy-policy',
  'Privacy Policy - London OOH Advertising',
  'Privacy policy for London OOH advertising services. How we collect, use, and protect your personal information.',
  '{
    "hero_title": "Privacy Policy",
    "hero_description": "Privacy policy for London OOH advertising services. How we collect, use, and protect your personal information.",
    "sections": []
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'terms-of-service',
  'Terms of Service - London OOH Advertising',
  'Terms of service for London OOH advertising agency. Service agreements, terms and conditions for our advertising solutions.',
  '{
    "hero_title": "Terms of Service",
    "hero_description": "Terms of service for London OOH advertising agency. Service agreements, terms and conditions for our advertising solutions.",
    "sections": []
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
);