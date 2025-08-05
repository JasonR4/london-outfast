-- Update industry pages with the new text blocks

-- Startups & Scaleups
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🏢 Startups & Scaleups\nLaunching a startup or scaling fast? Out-of-home (OOH) advertising is a powerful way to create instant visibility and build trust in competitive markets. We help ambitious founders and marketing teams get their message out across London — fast. From 6-sheets at key commuter stations to bold Digital 48s, we tailor campaigns to match your budget and goals. Whether you''re announcing a new product, entering the market, or looking to raise awareness, we make sure your brand gets seen by the right people, in the right places. Big on ambition? We''ll make sure London knows your name."'::jsonb
)
WHERE slug = 'startups' AND page_type = 'industry';

-- Clinics & Healthcare  
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🏥 Clinics & Healthcare\nWhether you''re a GP, dental chain, med-tech brand or private clinic, getting in front of the right patients matters. Our healthcare-focused OOH campaigns drive patient acquisition with trusted, hyper-local visibility. We offer placements on high-footfall streets, retail environments, and near hospitals or surgeries — all fully compliant with NHS and ASA guidelines. We understand how to target by borough, postcode or demographic, and we move fast to get your campaign live. Whether you''re launching a new location or growing patient volume, we''ll build a media plan that brings measurable results and builds your local reputation."'::jsonb
)
WHERE slug = 'healthcare' AND page_type = 'industry';

-- Retail & FMCG
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🛍️ Retail & FMCG\nFootfall, visibility and brand recall — we deliver all three for retail and FMCG brands. From West End flagships to convenience rollouts and D2C category leaders, we plan media that drives customer action. Whether it''s a time-sensitive promo, a new range, or just ongoing visibility, OOH advertising places your brand at the heart of London life. Formats include Digital 6s, mall screens, roadside D48s and more. We can geo-target around retail zones, competitor hotspots or store locations. Want to see your product dominating the city? Let''s get your campaign booked today."'::jsonb
)
WHERE slug = 'retail' AND page_type = 'industry';

-- Events, Shows & Venues
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🎟️ Events, Shows & Venues\nWhether you''re filling a festival, selling tickets to a tour, or launching a pop-up, we get people through the door. Our OOH campaigns target the audiences that matter — commuters, fans, locals, tourists — and turn awareness into footfall. We offer last-minute availability, real-time booking, and high-impact placements across London. Tube formats, street panels, venue-adjacent inventory and city-wide D48s are all in our toolkit. You tell us the vibe and budget — we''ll do the rest. If it needs an audience, we''ll make sure it gets one."'::jsonb
)
WHERE slug = 'events' AND page_type = 'industry';

-- Education & Training
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🧪 Education & Training\nColleges, universities, bootcamps and training providers all need attention — fast. We help education brands connect with future students in a smart, scalable way using out-of-home advertising. Whether you''re promoting open days, course intakes, apprenticeships or short-form training, we plan and buy media that targets the right areas — from student-heavy zones to career-changer commutes. Use digital screens, bus rears, Tube car panels and more to position your institution in the right minds. If you want to recruit, enrol or upskill — we''ll help you get seen."'::jsonb
)
WHERE slug = 'education' AND page_type = 'industry';

-- Beauty & Wellness
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"💄 Beauty & Wellness\nThe beauty industry thrives on visibility — and OOH media delivers it in style. From skincare brands and salons to aesthetics clinics and supplement launches, we help beauty and wellness businesses turn heads across the capital. Get in front of your audience with high-impact placements near gyms, shopping centres, transport hubs and social hotspots. We offer formats that work for brand awareness, new product launches, and local service promotion. Want high-glam visibility at a low-gloss price? We''ll build you a campaign that''s sleek, smart and fully aligned with your growth goals."'::jsonb
)
WHERE slug = 'beauty' AND page_type = 'industry';