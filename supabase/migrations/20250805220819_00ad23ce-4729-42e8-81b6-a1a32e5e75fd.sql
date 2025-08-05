-- Add descriptions to remaining general industry pages - Part 3

-- Food
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🍔 Food & Drink\nRestaurants, QSRs, dark kitchens, and FMCG food brands all benefit from OOH''s visual power. Whether it''s a menu launch, new opening or full campaign, we''ll put your food in front of hungry Londoners. Formats include mall D6s, bus rears, station takeovers, and retail-dense placements. We can even target by time of day, footfall heatmaps or competitor proximity. Need to drive bookings, walk-ins, or just awareness? We''ll get you seen at scale — and we''ll do it faster than your agency ever could."'::jsonb
)
WHERE slug = 'food' AND page_type = 'general';

-- Government
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🪧 Local Government & Public Sector\nWe support councils, departments, and government suppliers with fast, compliant OOH campaigns across London. From recruitment drives and public information campaigns to health messaging, transport safety, and environmental initiatives — we deliver responsible, impactful messaging in the places that matter. Our team understands ASA regulations, regional authority procurement, and the pressures of deadlines. We plan and buy with precision, and always deliver POP. If you need mass visibility with zero room for error, we''ll take care of it — without the delays you''ve come to expect."'::jsonb
)
WHERE slug = 'government' AND page_type = 'general';

-- Entertainment
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🎧 Music, Media & Entertainment\nAlbum drops, podcast tours, film releases, club nights — whatever you''re launching, we''ll help you fill the room (or the charts). We specialise in fast-turn media for launches, takeovers and teaser campaigns. From flyposting and street panels to Tube takeovers and D48s, we get creative messages in front of real audiences, fast. Want to target East London creatives or city-centre professionals? We''ve got the data and placements to back you. Let''s make your drop unmissible — visually, geographically, and culturally."'::jsonb
)
WHERE slug = 'entertainment' AND page_type = 'general';

-- Financial Services (mapping to finance content)
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🏦 Finance & Legal\nTrust matters — and out-of-home media builds it. We help challenger banks, law firms, mortgage advisers, brokers and insurance brands raise visibility and credibility in London''s most competitive markets. Whether you need retail branch traffic, app downloads or D2C trust, we plan media that reaches the right financial audiences. Formats include roadside D48s, station panels, business zones, and commuter-dense placements. We can also support brand-led campaigns around funding rounds, rebrands or partnerships. If you''re serious about growth, OOH can get you taken seriously."'::jsonb
)
WHERE slug = 'financial-services' AND page_type = 'general';

-- Fashion
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🪩 Fashion & Lifestyle\nWe work with fashion brands, lifestyle startups, and global labels to drive bold, visual OOH across London''s high-impact zones. Think Brick Lane, Soho, Shoreditch, Westfield, and retail-heavy boroughs. Use Tube panels, flyposting, mall screens and roadside takeovers to build buzz around your next drop or campaign. Need speed, control and killer placements without agency markups? We''ve got you. Whether you''re streetwear or studio, resale or runway — your audience is out there. Let''s go get them."'::jsonb
)
WHERE slug = 'fashion' AND page_type = 'general';