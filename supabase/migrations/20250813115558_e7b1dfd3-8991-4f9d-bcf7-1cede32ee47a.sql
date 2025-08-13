INSERT INTO seo_pages (page_slug, meta_title, meta_description, h1_heading, focus_keyword, keywords, og_title, og_description, twitter_title, twitter_description, created_by, updated_by)
VALUES ('/outdoor-media', 'Outdoor Media Buying London | Billboard & OOH Campaign Planning', 'Plan and buy outdoor media in London with unbeatable market rates. From billboards to transport and street furniture, we manage OOH campaigns that deliver maximum reach and ROI.', 'Outdoor Media Buying & Advertising in London', 'outdoor media buying london', ARRAY['outdoor media buying london', 'outdoor advertising london', 'billboard advertising london', 'OOH campaign management', 'london outdoor media', 'billboard buying london', 'transport advertising london', 'street furniture advertising', 'outdoor media planning', 'OOH media buying'], 'Outdoor Media Buying London | Billboard & OOH Campaign Planning', 'Plan and buy outdoor media in London with unbeatable market rates. From billboards to transport and street furniture, we manage OOH campaigns that deliver maximum reach and ROI.', 'Outdoor Media Buying London | Billboard & OOH Campaign Planning', 'Plan and buy outdoor media in London with unbeatable market rates. From billboards to transport and street furniture, we manage OOH campaigns that deliver maximum reach and ROI.', '920f996a-5909-4313-9b00-6511c9cabff4', '920f996a-5909-4313-9b00-6511c9cabff4')
ON CONFLICT (page_slug) 
DO UPDATE SET 
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  h1_heading = EXCLUDED.h1_heading,
  focus_keyword = EXCLUDED.focus_keyword,
  keywords = EXCLUDED.keywords,
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description,
  twitter_title = EXCLUDED.twitter_title,
  twitter_description = EXCLUDED.twitter_description,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();