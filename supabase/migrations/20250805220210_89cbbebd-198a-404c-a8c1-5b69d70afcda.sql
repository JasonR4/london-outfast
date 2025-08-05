-- Update remaining industry pages with text blocks

-- Automotive
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🚗 Automotive\nFrom EV rollouts to dealership offers, the automotive sector thrives on OOH visibility. Whether you''re promoting a new model, finance package or booking test drives, our media buying puts your brand in front of drivers, passengers and high-intent buyers. We place ads across roadside billboards, petrol stations, high-traffic junctions and commuter routes — including D48s, bus rears and rail station formats. We can also target by postcode or proximity to dealerships. Whether you''re a manufacturer, franchise group, or auto service brand, we''ll get your message seen in the moments that matter."'::jsonb
)
WHERE slug = 'automotive' AND page_type = 'industry';

-- Agencies & In-House Teams
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"💼 Agencies & In-House Teams\nNeed rapid, no-fuss OOH buying support? We white-label, plug in, or power up your existing team. Whether you''re pitching, fulfilling, or scaling, we provide strategy, media plans, inventory access, booking and POP. Our clients include brand teams, media planners, marketing managers and full-service agencies. You keep the client. We keep you covered. Need us client-facing or completely silent? Your call. We move quickly, protect margins, and make you look good. If you''re short on time, access or resource — we''re the media buying arm you wish you had in-house."'::jsonb
)
WHERE slug = 'agencies' AND page_type = 'industry';

-- Property & Real Estate
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🏙️ Property & Real Estate\nFrom residential launches to off-plan investment campaigns, we help property developers, agents and estate marketers dominate the locations that matter. We buy out-of-home placements around specific postcodes, boroughs, station exits and commuter corridors — perfect for site sales, lettings or brand awareness. Whether you''re promoting a new development, building a reputation in new areas or driving showhome visits, we''ll get you seen by buyers, landlords, and renters alike. Our team understands the pressure of lead-gen, handover deadlines, and multiple stakeholders. Let us take care of the media — so you can focus on closing."'::jsonb
)
WHERE slug = 'property' AND page_type = 'industry';

-- Travel & Hospitality
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🧳 Travel & Hospitality\nWe help hotels, airlines, tourism boards and operators build unforgettable campaigns across London''s transport network and premium retail environments. Whether you''re targeting high-income leisure travellers, commuters, or international visitors, OOH delivers real-world reach with minimal waste. We place your brand across airports, stations, roadside screens and city zones frequented by your audience. Want to build trust? Dominate TfL corridors. Want bookings? Hit D48s near transport and footfall zones. Whether you''re launching a new destination or filling rooms midweek — we''ll deliver clarity, speed and bookings you can track."'::jsonb
)
WHERE slug = 'travel' AND page_type = 'industry';

-- Construction & Trade
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🛠️ Construction & Trade\nThe construction and trade industries need to reach site managers, contractors, tradespeople and suppliers — and we know where they are. From scaffold wraps and roadside panels to targeted geo-based DOOH, we place your ads around sites, depots, wholesalers and hire locations. Promote services, grow your workforce or get noticed by procurement teams. OOH helps build visibility in a sector that values credibility and contact. Whether you''re recruiting, rebranding or scaling into new areas, we''ll help you build fast — and without the fluff."'::jsonb
)
WHERE slug = 'construction' AND page_type = 'industry';

-- Tech & Apps (mapping to 'technology' slug)
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"📱 Tech & Apps\nLaunching a new app, SaaS tool or digital product? OOH advertising builds trust, fast. Whether you''re fintech, edtech, healthtech or marketplace-based, our campaigns bring real-world visibility to digital-first brands. We target by user base, geography, lifestyle, and footfall — placing your ads across London''s highest-exposure formats. From pre-seed launches to unicorn-level rollouts, we''ve planned campaigns for apps that needed awareness, installs, traffic or credibility. OOH is physical proof of scale — and that matters when you''re trying to win trust in a competitive market."'::jsonb
)
WHERE slug = 'technology' AND page_type = 'industry';