-- Clear and insert ALL 55+ media formats from oohFormats.ts
DELETE FROM public.media_formats;

INSERT INTO public.media_formats (format_name, format_slug, description, dimensions) VALUES
-- Classic & Digital Roadside
('48 Sheet Billboard Advertising', '48-sheet-billboard', '48 sheet billboards are London''s most visible large-format roadside advertising solution. Available in both classic paper and digital (D48) formats, these premium sites deliver maximum impact across major commuter routes and high-traffic corridors.', '6m x 3m (20ft x 10ft)'),
('96 Sheet Billboard Advertising', '96-sheet-billboard', '96 sheet billboards are London''s largest format roadside advertising solution. These massive displays command attention and deliver unparalleled impact for major brand campaigns and product launches.', '12m x 3m (40ft x 10ft)'),
('Digital 48 Sheet Advertising', 'digital-48-sheet', 'Digital 48 sheets (D48s) are premium large-format digital billboards positioned on London''s busiest roadside locations. With dynamic creative rotation, daypart targeting, and real-time campaign updates, D48s deliver unmatched flexibility and impact.', '6m x 3m (20ft x 10ft) LED display'),
('Mega 6 Roadside Advertising', 'mega-6-roadside', 'Mega 6 (M6) are premium large-format digital screens positioned at key roadside locations across London. These high-impact displays offer superior visibility and are ideal for brands seeking maximum presence.', '8m x 3m digital display'),
('Lamp Post Banner Advertising', 'lamp-post-banners', 'Lamp post banners provide street-level advertising along London''s main roads and high streets. These flexible formats offer local targeting and are perfect for community events, local businesses, and area-specific campaigns.', 'Various sizes from 1m x 1.5m to 2m x 3m'),
('Street Liner Advertising', 'street-liners', 'Street liners are large format banners displayed across busy London streets and junctions. These high-impact displays create impossible-to-miss brand moments for maximum awareness campaigns.', 'Varies, typically spanning 10-20m across streets'),

-- London Underground (TfL)
('6 Sheet Tube Panel Advertising', '6-sheet-tube-panel', '6 sheet tube panels (LT Panels) are strategically positioned at London Underground station entrances, exits, and platform areas. These high-impact formats capture commuters at key decision points in their journey.', '1200mm x 1800mm'),
('16 Sheet Corridor Panel Advertising', '16-sheet-corridor-panels', '16 sheet corridor panels are positioned along Underground station corridors and walkways, providing extended exposure to commuters during their journey through the station network.', '2000mm x 3000mm'),
('Digital Escalator Panel Advertising', 'digital-escalator-panels', 'Digital Escalator Panels (DEPs) create immersive animated sequences visible to passengers during escalator journeys. These premium digital formats offer unparalleled creative opportunities in London''s busiest underground stations.', 'Multiple panel sequences creating continuous motion'),
('Cross Track Projection Advertising', 'cross-track-projection', 'Cross Track Projections (XTPs) are digital displays visible from Underground platforms, delivering dynamic content to waiting passengers across the tracks. These premium formats capture commuters during their dwell time on platforms.', 'Large format digital projections varying by station layout'),
('Tube Car Panel Advertising', 'tube-car-panels', 'Tube Car Panels (TCPs) are interior advertisements displayed inside Underground train carriages. These formats provide extended exposure during passenger journeys across the London transport network.', 'Various sizes from car cards to door panels'),
('Train Wraps & External Liveries', 'train-wraps-external-liveries', 'Train wraps and external liveries transform entire Underground trains into mobile billboards. These premium takeover formats provide maximum brand exposure across the entire London transport network.', 'Full train exterior covering multiple carriages'),
('Full Station Takeover Advertising', 'full-station-takeovers', 'Full station takeovers transform entire Underground stations with comprehensive branding including wall wraps, floor vinyls, ceiling displays, and environmental graphics. These premium campaigns create immersive brand experiences.', 'Complete station environment including all available surfaces'),

-- National Rail & Commuter Rail
('Rail 6 Sheet Advertising', 'rail-6-sheets', 'Rail 6 sheets are positioned at National Rail stations across London and the surrounding commuter belt. These formats target affluent commuters traveling into London from surrounding counties.', '1200mm x 1800mm'),
('Digital Rail 6 Sheet Advertising', 'digital-rail-6-sheets', 'Digital Rail 6 sheets (D6) provide dynamic advertising at National Rail stations with real-time content updates, daypart targeting, and weather-responsive messaging for commuter audiences.', '1200mm x 1800mm digital displays'),
('Station Billboard Advertising (48/96 Sheet)', 'station-billboards-48-96-sheet', 'Large format 48 and 96 sheet billboards positioned at major National Rail stations provide high-impact advertising for brands targeting London''s commuter population.', '48 sheet (6m x 3m) or 96 sheet (12m x 3m)'),
('Station Gateway Screen Advertising', 'station-gateway-screens', 'Station Gateway Screens are large format digital displays positioned at the main entrances and exits of major National Rail stations, capturing all passengers entering and leaving.', 'Large format digital displays varying by station'),
('Platform Poster Advertising', 'platform-posters', 'Platform posters are strategically positioned along National Rail platforms providing extended exposure to waiting passengers. These formats offer excellent value for targeting commuter audiences.', 'A1 to 4-sheet formats (various sizes)'),
('Rail Panel Takeover Advertising', 'rail-panel-takeovers', 'Rail panel takeovers involve multiple advertising panels working together to create cohesive campaign messaging across entire station areas or platform sections.', 'Multiple panel formats working in sequence'),
('Passenger Bridge Panel Advertising', 'passenger-bridge-panels', 'Passenger bridge panels are positioned on footbridges and elevated walkways at National Rail stations, providing high-visibility advertising visible from platforms and station approaches.', 'Large format panels varying by bridge structure'),

-- Bus Advertising
('Bus Superside Advertising', 'bus-superside', 'Bus supersides are large-format advertisements displayed on the side of London''s iconic red buses. These mobile billboards travel across the entire London network, delivering your message to millions of people daily.', '12.2m x 2.4m'),
('Bus T-Side Advertising', 'bus-t-side', 'Bus T-sides are positioned on the side panels of London buses, offering a cost-effective mobile advertising solution with excellent coverage across London''s extensive bus network.', '1.7m x 1.2m (approximately)'),
('Bus Rear Panel Advertising', 'bus-rear-panel', 'Bus rear panels are positioned on the back of London buses, providing high-impact advertising visible to following traffic and pedestrians at bus stops and traffic lights.', '1.7m x 1.2m rear window area'),
('Bus Streetliner Advertising', 'bus-streetliner', 'Bus streetliners are full-length side advertisements that run along the entire length of London buses, creating maximum mobile billboard impact across the city.', 'Full bus length side panel (approximately 10-12m)'),
('Bus Mega Rear Advertising', 'bus-mega-rear', 'Bus mega rears are large format advertisements covering the entire rear section of London buses, providing maximum impact advertising visible to all following traffic.', 'Full rear coverage including windows and panels'),
('Bus Interior Panel Advertising', 'bus-interior-panels', 'Bus interior panels including headliners and seatback advertising provide captive audience exposure during passenger journeys across London''s extensive bus network.', 'Various sizes from seatback cards to overhead headliners'),

-- Taxi Advertising
('TX4 Taxi Advertising', 'tx4-taxi-advertising', 'TX4 taxi advertising utilizes London''s iconic black cabs for mobile brand exposure across all 32 boroughs. With 21,000 licensed vehicles, this format provides unmatched city-wide coverage.', 'Various taxi panel sizes'),
('Taxi Tip Seats', 'taxi-tip-seats', 'Taxi tip seats provide passenger-facing advertising inside London''s black cabs, delivering targeted messaging to high-value audiences during their journey across the city.', 'Interior tip seat panels'),
('Taxi Receipt Advertising', 'taxi-receipt-advertising', 'Taxi receipt advertising places your brand message on every taxi receipt, ensuring take-away brand exposure for all passengers using London''s licensed taxi services.', 'Receipt format advertising'),
('Digital Taxi Screens', 'digital-taxi-screens', 'Digital taxi screens provide dynamic content delivery inside London''s black cabs with passenger-facing displays and journey-based targeting capabilities.', 'Interior digital displays'),

-- Bus Shelter Advertising
('6 Sheet Bus Shelter Advertising', '6-sheet-bus-shelter', '6 sheet bus shelters provide advertising at London''s 17,000+ bus stops, delivering high-frequency exposure to the city''s 6.8 million daily public transport users.', '1200mm x 1800mm'),
('Digital 6 Sheet Bus Shelter', 'digital-6-sheet-bus-shelter', 'Digital 6 sheet bus shelters combine traditional poster locations with dynamic digital content delivery, providing real-time updates and creative flexibility.', '1200mm x 1800mm digital displays'),
('Adshel Live', 'adshel-live', 'Adshel Live digital bus shelters feature high-resolution screens with dynamic content rotation, weather integration, and real-time information display capabilities.', 'Full-motion digital displays'),
('Bus Shelter Supersites', 'bus-shelter-supersites', 'Bus shelter supersites are large format advertising displays at premium bus stop locations, providing enhanced visibility and impact in high-footfall areas.', 'Large format supersites'),

-- Street Furniture
('Phone Box Advertising', 'phone-box-advertising', 'Phone box advertising utilizes London''s street furniture including traditional red phone boxes and modern communication units for local advertising opportunities.', '2m x 1m approx'),
('Digital Phone Box Advertising', 'digital-phone-box-advertising', 'Digital phone box advertising modernizes street furniture with dynamic displays, interactive capabilities, and location-based content delivery.', 'Digital screen units'),
('Street Pole Banners', 'street-pole-banners', 'Street pole banners provide community-level advertising along London''s main roads and shopping areas, perfect for local businesses and area-specific campaigns.', 'Various banner sizes'),
('Pedestrian Crossing Advertising', 'pedestrian-crossing-advertising', 'Pedestrian crossing advertising captures audiences during traffic light waiting periods, providing guaranteed exposure at high-footfall crossing points.', 'Crossing panel formats'),

-- Shopping & Retail
('Shopping Centre Advertising', 'shopping-centre-advertising', 'Shopping centre advertising targets consumers in London''s major retail destinations including Westfield, capturing audiences in purchase-ready mindset.', 'Various retail formats'),
('Digital Shopping Centre Screens', 'digital-shopping-centre-screens', 'Digital shopping centre screens provide dynamic content delivery in London''s premium retail environments, perfect for retail and lifestyle brands.', 'Various digital screen sizes'),
('Mall Escalator Advertising', 'mall-escalator-advertising', 'Mall escalator advertising provides extended exposure to shoppers during vertical transportation in London''s major shopping centers.', 'Escalator panel formats'),
('Retail Park Advertising', 'retail-park-advertising', 'Retail park advertising targets shoppers at London''s major out-of-town shopping destinations, capturing audiences in purchase-ready mindset.', 'Various retail park formats'),

-- Alternative Transport
('Bike Hire Dock Panel Advertising', 'bike-hire-dock-panels', 'Bike hire dock panel advertising targets London''s cycling community at Santander Cycles docking stations across the city''s growing cycle network.', 'Docking station panels'),
('Uber/Lyft Car Advertising', 'uber-lyft-car-advertising', 'Ride-share car advertising places your brand on vehicles used by London''s app-based transport services, reaching passengers and street-level audiences.', 'Car exterior panels'),
('Scooter Advertising', 'scooter-advertising', 'Electric scooter advertising utilizes London''s growing micro-mobility fleet for modern urban advertising with environmental positioning.', 'Scooter panel formats'),
('River Bus Advertising', 'river-bus-advertising', 'River bus advertising on Thames Clippers provides unique waterway advertising opportunities targeting tourists and commuters using London''s river transport.', 'Marine vessel advertising'),

-- Ambient & Guerrilla
('Flyposting & Wildposting', 'flyposting-wildposting', 'Flyposting and wildposting create underground buzz through strategic poster placement in London''s alternative locations, perfect for youth brands and cultural campaigns.', 'Various poster sizes from A3 to large format'),
('Experiential Pop-Up Advertising', 'experiential-pop-ups', 'Experiential pop-ups create immersive brand experiences in high-footfall London locations, generating social media buzz and direct consumer engagement.', 'Varies by experience design and location requirements'),
('Projection Mapping Advertising', 'projection-mapping', 'Projection mapping transforms London buildings and landmarks into dynamic digital canvases, creating spectacular visual experiences for major brand campaigns.', 'Building-scale projections varying by target surface'),
('Chalk Stencils & Clean Graffiti', 'chalk-stencils-clean-graffiti', 'Chalk stencils and clean graffiti provide eco-friendly street-level advertising using temporary, washable techniques to create urban brand presence.', 'Various stencil sizes from small formats to large pavement displays'),
('Hand-to-Hand Leafleting', 'hand-to-hand-leafleting', 'Hand-to-hand leafleting provides direct personal interaction with target audiences in strategic London locations, ensuring message delivery and enabling immediate engagement.', 'Leaflet and promotional material sizes from A6 to A4'),
('Sampling Stunts & Flash Mobs', 'sampling-stunts-flash-mobs', 'Sampling stunts and flash mobs create memorable brand moments through live performances and product sampling in high-footfall London locations.', 'Performance area and sampling setup varying by activation'),

-- Programmatic DOOH
('Programmatic DOOH (pDOOH)', 'programmatic-dooh-pdooh', 'Programmatic Digital Out-of-Home (pDOOH) enables real-time, data-driven advertising across London''s digital inventory including D6, D48, and LFD formats with audience targeting, weather triggers, and performance optimization.', 'All digital format sizes across participating networks');