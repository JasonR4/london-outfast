-- Insert all industry pages with content and SEO data
WITH inserted_pages AS (
  INSERT INTO content_pages (
    slug, title, meta_description, content, status, page_type, created_by, updated_by
  ) VALUES 
  ('retail', 'Retail Advertising in London', 'Transform your retail marketing with strategic outdoor advertising across London''s busiest shopping districts and high streets.', 
   '{"hero": {"title": "Retail Advertising in London", "subtitle": "Drive footfall and boost sales with targeted outdoor advertising in London''s premier retail locations", "image": "/assets/retail-hero.jpg"}, "sections": [{"type": "content", "title": "Retail OOH Advertising Solutions", "content": "From Oxford Street to Westfield, reach shoppers when they''re ready to buy with strategic outdoor advertising placements in London''s top retail destinations."}, {"type": "benefits", "items": ["High-footfall shopping locations", "Point-of-sale proximity", "Impulse purchase influence", "Brand visibility at retail hubs"]}]}', 
   'published', 'industry', auth.uid(), auth.uid()),
  
  ('hospitality', 'Hospitality Advertising in London', 'Attract guests and diners with premium outdoor advertising in London''s entertainment and hospitality districts.', 
   '{"hero": {"title": "Hospitality Advertising in London", "subtitle": "Fill tables and rooms with strategic outdoor advertising in London''s vibrant hospitality zones", "image": "/assets/hospitality-hero.jpg"}, "sections": [{"type": "content", "title": "Hospitality OOH Solutions", "content": "From Covent Garden to Shoreditch, capture the attention of tourists and locals in London''s dining and entertainment hotspots."}, {"type": "benefits", "items": ["Prime entertainment districts", "Tourist and local targeting", "Evening visibility", "Restaurant and hotel proximity"]}]}', 
   'published', 'industry', auth.uid(), auth.uid()),
   
  ('finance', 'Financial Services Advertising in London', 'Establish trust and credibility with professional outdoor advertising in London''s financial districts.', 
   '{"hero": {"title": "Financial Services Advertising in London", "subtitle": "Build authority and attract clients with premium outdoor advertising in the City and Canary Wharf", "image": "/assets/finance-hero.jpg"}, "sections": [{"type": "content", "title": "Financial District Advertising", "content": "Target decision-makers and high-net-worth individuals with sophisticated outdoor advertising in London''s financial centers."}, {"type": "benefits", "items": ["Business district targeting", "Professional audience reach", "Authority building", "B2B client acquisition"]}]}', 
   'published', 'industry', auth.uid(), auth.uid()),
   
  ('technology', 'Tech Advertising in London', 'Reach innovators and early adopters with cutting-edge outdoor advertising in London''s tech hubs.', 
   '{"hero": {"title": "Technology Advertising in London", "subtitle": "Connect with tech talent and innovators through strategic outdoor advertising in London''s digital districts", "image": "/assets/tech-hero.jpg"}, "sections": [{"type": "content", "title": "Tech Hub Advertising", "content": "From Silicon Roundabout to King''s Cross, reach the tech community with innovative outdoor advertising campaigns."}, {"type": "benefits", "items": ["Tech cluster targeting", "Innovation district reach", "Start-up and scale-up visibility", "Digital-savvy audience"]}]}', 
   'published', 'industry', auth.uid(), auth.uid()),
   
  ('healthcare', 'Healthcare Advertising in London', 'Build trust and awareness with compassionate outdoor advertising near London''s medical facilities.', 
   '{"hero": {"title": "Healthcare Advertising in London", "subtitle": "Reach patients and healthcare professionals with sensitive outdoor advertising near medical centers", "image": "/assets/healthcare-hero.jpg"}, "sections": [{"type": "content", "title": "Healthcare OOH Advertising", "content": "Promote health services, medical facilities, and wellness programs with strategically placed outdoor advertising near hospitals and clinics."}, {"type": "benefits", "items": ["Medical facility proximity", "Patient and visitor targeting", "Trust building", "Health awareness campaigns"]}]}', 
   'published', 'industry', auth.uid(), auth.uid()),
   
  ('education', 'Education Advertising in London', 'Inspire learning and growth with educational outdoor advertising near London''s schools and universities.', 
   '{"hero": {"title": "Education Advertising in London", "subtitle": "Reach students, parents, and educators with inspiring outdoor advertising near educational institutions", "image": "/assets/education-hero.jpg"}, "sections": [{"type": "content", "title": "Educational Institution Advertising", "content": "From primary schools to universities, connect with the education community through targeted outdoor advertising campaigns."}, {"type": "benefits", "items": ["Student and parent reach", "Educational institution proximity", "Academic year targeting", "Community engagement"]}]}', 
   'published', 'industry', auth.uid(), auth.uid()),
   
  ('automotive', 'Automotive Advertising in London', 'Drive sales and brand awareness with dynamic outdoor advertising on London''s major roads and transport hubs.', 
   '{"hero": {"title": "Automotive Advertising in London", "subtitle": "Capture drivers and commuters with high-impact outdoor advertising on London''s busiest routes", "image": "/assets/automotive-hero.jpg"}, "sections": [{"type": "content", "title": "Automotive OOH Solutions", "content": "Target drivers, commuters, and car enthusiasts with strategic outdoor advertising along London''s major arterial roads and transport corridors."}, {"type": "benefits", "items": ["High-traffic road targeting", "Driver and passenger reach", "Showroom proximity", "Commuter engagement"]}]}', 
   'published', 'industry', auth.uid(), auth.uid()),
   
  ('fashion', 'Fashion Advertising in London', 'Showcase style and trends with glamorous outdoor advertising in London''s fashion districts.', 
   '{"hero": {"title": "Fashion Advertising in London", "subtitle": "Make a statement with stunning outdoor advertising in London''s most stylish neighborhoods", "image": "/assets/fashion-hero.jpg"}, "sections": [{"type": "content", "title": "Fashion District Advertising", "content": "From Bond Street to Carnaby Street, showcase your brand in London''s most fashionable locations with eye-catching outdoor advertising."}, {"type": "benefits", "items": ["Fashion district presence", "Style-conscious targeting", "Trend-setting visibility", "Premium brand positioning"]}]}', 
   'published', 'industry', auth.uid(), auth.uid())
  RETURNING id, slug
),
seo_data AS (
  INSERT INTO seo_pages (
    page_slug, meta_title, meta_description, focus_keyword, keywords, 
    h1_heading, h2_headings, h3_headings, london_locations,
    og_title, og_description, twitter_title, twitter_description,
    schema_markup, created_by, updated_by
  ) 
  SELECT 
    p.slug,
    CASE 
      WHEN p.slug = 'retail' THEN 'Retail Advertising London | OOH Marketing for Retail Brands'
      WHEN p.slug = 'hospitality' THEN 'Hospitality Advertising London | Restaurant & Hotel OOH Marketing'
      WHEN p.slug = 'finance' THEN 'Financial Services Advertising London | Banking & Finance OOH'
      WHEN p.slug = 'technology' THEN 'Tech Advertising London | Technology Sector OOH Marketing'
      WHEN p.slug = 'healthcare' THEN 'Healthcare Advertising London | Medical & Wellness OOH'
      WHEN p.slug = 'education' THEN 'Education Advertising London | Schools & Universities OOH'
      WHEN p.slug = 'automotive' THEN 'Automotive Advertising London | Car Industry OOH Marketing'
      WHEN p.slug = 'fashion' THEN 'Fashion Advertising London | Style & Beauty OOH Marketing'
    END as meta_title,
    CASE 
      WHEN p.slug = 'retail' THEN 'Drive footfall and sales with targeted retail advertising across London''s premier shopping districts. Expert OOH solutions for retail brands.'
      WHEN p.slug = 'hospitality' THEN 'Attract guests and diners with strategic hospitality advertising in London''s entertainment districts. Premium OOH for restaurants and hotels.'
      WHEN p.slug = 'finance' THEN 'Build trust and authority with professional financial services advertising in London''s business districts. Expert OOH for banking and finance.'
      WHEN p.slug = 'technology' THEN 'Connect with innovators through strategic tech advertising in London''s digital hubs. Cutting-edge OOH for technology companies.'
      WHEN p.slug = 'healthcare' THEN 'Build trust and awareness with compassionate healthcare advertising near London''s medical facilities. Expert OOH for health services.'
      WHEN p.slug = 'education' THEN 'Inspire learning with educational advertising near London''s schools and universities. Strategic OOH for education sector.'
      WHEN p.slug = 'automotive' THEN 'Drive brand awareness with dynamic automotive advertising on London''s major roads. High-impact OOH for car industry.'
      WHEN p.slug = 'fashion' THEN 'Showcase style with glamorous fashion advertising in London''s fashion districts. Premium OOH for style and beauty brands.'
    END as meta_description,
    CASE 
      WHEN p.slug = 'retail' THEN 'retail advertising london'
      WHEN p.slug = 'hospitality' THEN 'hospitality advertising london'
      WHEN p.slug = 'finance' THEN 'financial advertising london'
      WHEN p.slug = 'technology' THEN 'tech advertising london'
      WHEN p.slug = 'healthcare' THEN 'healthcare advertising london'
      WHEN p.slug = 'education' THEN 'education advertising london'
      WHEN p.slug = 'automotive' THEN 'automotive advertising london'
      WHEN p.slug = 'fashion' THEN 'fashion advertising london'
    END as focus_keyword,
    CASE 
      WHEN p.slug = 'retail' THEN ARRAY['retail advertising', 'shopping center advertising', 'high street advertising', 'retail marketing london', 'footfall advertising']
      WHEN p.slug = 'hospitality' THEN ARRAY['hospitality advertising', 'restaurant advertising', 'hotel advertising', 'tourism marketing', 'entertainment advertising']
      WHEN p.slug = 'finance' THEN ARRAY['financial advertising', 'banking advertising', 'city advertising', 'canary wharf advertising', 'b2b advertising']
      WHEN p.slug = 'technology' THEN ARRAY['tech advertising', 'startup advertising', 'innovation advertising', 'digital advertising', 'silicon roundabout']
      WHEN p.slug = 'healthcare' THEN ARRAY['healthcare advertising', 'medical advertising', 'hospital advertising', 'wellness advertising', 'health campaigns']
      WHEN p.slug = 'education' THEN ARRAY['education advertising', 'university advertising', 'school advertising', 'student advertising', 'academic marketing']
      WHEN p.slug = 'automotive' THEN ARRAY['automotive advertising', 'car advertising', 'vehicle advertising', 'road advertising', 'transport advertising']
      WHEN p.slug = 'fashion' THEN ARRAY['fashion advertising', 'style advertising', 'beauty advertising', 'luxury advertising', 'brand advertising']
    END as keywords,
    CASE 
      WHEN p.slug = 'retail' THEN 'Retail Advertising in London'
      WHEN p.slug = 'hospitality' THEN 'Hospitality Advertising in London'
      WHEN p.slug = 'finance' THEN 'Financial Services Advertising in London'
      WHEN p.slug = 'technology' THEN 'Technology Advertising in London'
      WHEN p.slug = 'healthcare' THEN 'Healthcare Advertising in London'
      WHEN p.slug = 'education' THEN 'Education Advertising in London'
      WHEN p.slug = 'automotive' THEN 'Automotive Advertising in London'
      WHEN p.slug = 'fashion' THEN 'Fashion Advertising in London'
    END as h1_heading,
    CASE 
      WHEN p.slug = 'retail' THEN ARRAY['Why Choose Retail OOH Advertising', 'Top Retail Advertising Locations', 'Retail Campaign Success Stories']
      WHEN p.slug = 'hospitality' THEN ARRAY['Hospitality Marketing Solutions', 'Prime Entertainment Locations', 'Tourism & Local Targeting']
      WHEN p.slug = 'finance' THEN ARRAY['Financial District Advertising', 'Professional Audience Targeting', 'Trust Building Campaigns']
      WHEN p.slug = 'technology' THEN ARRAY['Tech Hub Advertising', 'Innovation District Reach', 'Digital Community Targeting']
      WHEN p.slug = 'healthcare' THEN ARRAY['Healthcare OOH Solutions', 'Medical Facility Advertising', 'Patient Engagement Strategies']
      WHEN p.slug = 'education' THEN ARRAY['Educational Institution Marketing', 'Student & Parent Targeting', 'Academic Community Reach']
      WHEN p.slug = 'automotive' THEN ARRAY['Automotive OOH Solutions', 'Road & Transport Advertising', 'Driver Engagement Strategies']
      WHEN p.slug = 'fashion' THEN ARRAY['Fashion District Advertising', 'Style & Beauty Marketing', 'Luxury Brand Positioning']
    END as h2_headings,
    CASE 
      WHEN p.slug = 'retail' THEN ARRAY['Oxford Street Advertising', 'Westfield Shopping Centers', 'High Street Locations']
      WHEN p.slug = 'hospitality' THEN ARRAY['Covent Garden', 'Shoreditch Entertainment', 'West End Theaters']
      WHEN p.slug = 'finance' THEN ARRAY['City of London', 'Canary Wharf', 'Bank Junction']
      WHEN p.slug = 'technology' THEN ARRAY['Silicon Roundabout', 'King''s Cross', 'Tech City']
      WHEN p.slug = 'healthcare' THEN ARRAY['Hospital Proximity', 'Medical Centers', 'Wellness Clinics']
      WHEN p.slug = 'education' THEN ARRAY['University Campuses', 'School Catchments', 'Student Areas']
      WHEN p.slug = 'automotive' THEN ARRAY['Major Road Networks', 'Car Dealerships', 'Transport Hubs']
      WHEN p.slug = 'fashion' THEN ARRAY['Bond Street', 'Carnaby Street', 'Fashion Districts']
    END as h3_headings,
    CASE 
      WHEN p.slug = 'retail' THEN ARRAY['Oxford Street', 'Westfield', 'Covent Garden', 'Kings Road', 'Regent Street']
      WHEN p.slug = 'hospitality' THEN ARRAY['Covent Garden', 'Soho', 'Shoreditch', 'West End', 'Greenwich']
      WHEN p.slug = 'finance' THEN ARRAY['City of London', 'Canary Wharf', 'Bank', 'Liverpool Street', 'Moorgate']
      WHEN p.slug = 'technology' THEN ARRAY['Shoreditch', 'King''s Cross', 'Clerkenwell', 'Hammersmith', 'Paddington']
      WHEN p.slug = 'healthcare' THEN ARRAY['Bloomsbury', 'Marylebone', 'Westminster', 'Lambeth', 'Camden']
      WHEN p.slug = 'education' THEN ARRAY['Bloomsbury', 'South Kensington', 'Greenwich', 'Kingston', 'Ealing']
      WHEN p.slug = 'automotive' THEN ARRAY['Park Lane', 'Great West Road', 'North Circular', 'South Circular', 'M25']
      WHEN p.slug = 'fashion' THEN ARRAY['Mayfair', 'Chelsea', 'Knightsbridge', 'Marylebone', 'Notting Hill']
    END as london_locations,
    CASE 
      WHEN p.slug = 'retail' THEN 'Retail Advertising London | Drive Footfall with Strategic OOH'
      WHEN p.slug = 'hospitality' THEN 'Hospitality Advertising London | Fill Tables with Strategic OOH'
      WHEN p.slug = 'finance' THEN 'Financial Advertising London | Build Authority with Professional OOH'
      WHEN p.slug = 'technology' THEN 'Tech Advertising London | Connect with Innovators through Strategic OOH'
      WHEN p.slug = 'healthcare' THEN 'Healthcare Advertising London | Build Trust with Compassionate OOH'
      WHEN p.slug = 'education' THEN 'Education Advertising London | Inspire Learning with Strategic OOH'
      WHEN p.slug = 'automotive' THEN 'Automotive Advertising London | Drive Awareness with Dynamic OOH'
      WHEN p.slug = 'fashion' THEN 'Fashion Advertising London | Showcase Style with Glamorous OOH'
    END as og_title,
    CASE 
      WHEN p.slug = 'retail' THEN 'Transform your retail marketing with strategic outdoor advertising across London''s busiest shopping districts and high streets.'
      WHEN p.slug = 'hospitality' THEN 'Attract guests and diners with premium outdoor advertising in London''s entertainment and hospitality districts.'
      WHEN p.slug = 'finance' THEN 'Establish trust and credibility with professional outdoor advertising in London''s financial districts.'
      WHEN p.slug = 'technology' THEN 'Reach innovators and early adopters with cutting-edge outdoor advertising in London''s tech hubs.'
      WHEN p.slug = 'healthcare' THEN 'Build trust and awareness with compassionate outdoor advertising near London''s medical facilities.'
      WHEN p.slug = 'education' THEN 'Inspire learning and growth with educational outdoor advertising near London''s schools and universities.'
      WHEN p.slug = 'automotive' THEN 'Drive sales and brand awareness with dynamic outdoor advertising on London''s major roads and transport hubs.'
      WHEN p.slug = 'fashion' THEN 'Showcase style and trends with glamorous outdoor advertising in London''s fashion districts.'
    END as og_description,
    CASE 
      WHEN p.slug = 'retail' THEN 'Retail Advertising London | Strategic OOH for Retail Brands'
      WHEN p.slug = 'hospitality' THEN 'Hospitality Advertising London | Premium OOH for Restaurants & Hotels'
      WHEN p.slug = 'finance' THEN 'Financial Advertising London | Professional OOH for Banking & Finance'
      WHEN p.slug = 'technology' THEN 'Tech Advertising London | Innovative OOH for Technology Companies'
      WHEN p.slug = 'healthcare' THEN 'Healthcare Advertising London | Compassionate OOH for Medical Services'
      WHEN p.slug = 'education' THEN 'Education Advertising London | Inspiring OOH for Schools & Universities'
      WHEN p.slug = 'automotive' THEN 'Automotive Advertising London | Dynamic OOH for Car Industry'
      WHEN p.slug = 'fashion' THEN 'Fashion Advertising London | Glamorous OOH for Style & Beauty'
    END as twitter_title,
    CASE 
      WHEN p.slug = 'retail' THEN 'Drive footfall and sales with targeted retail advertising across London''s premier shopping districts.'
      WHEN p.slug = 'hospitality' THEN 'Attract guests and diners with strategic hospitality advertising in London''s entertainment districts.'
      WHEN p.slug = 'finance' THEN 'Build trust and authority with professional financial services advertising in London''s business districts.'
      WHEN p.slug = 'technology' THEN 'Connect with innovators through strategic tech advertising in London''s digital hubs.'
      WHEN p.slug = 'healthcare' THEN 'Build trust and awareness with compassionate healthcare advertising near London''s medical facilities.'
      WHEN p.slug = 'education' THEN 'Inspire learning with educational advertising near London''s schools and universities.'
      WHEN p.slug = 'automotive' THEN 'Drive brand awareness with dynamic automotive advertising on London''s major roads.'
      WHEN p.slug = 'fashion' THEN 'Showcase style with glamorous fashion advertising in London''s fashion districts.'
    END as twitter_description,
    '{"@context": "https://schema.org", "@type": "Service", "name": "' || 
    CASE 
      WHEN p.slug = 'retail' THEN 'Retail Advertising London'
      WHEN p.slug = 'hospitality' THEN 'Hospitality Advertising London'
      WHEN p.slug = 'finance' THEN 'Financial Services Advertising London'
      WHEN p.slug = 'technology' THEN 'Technology Advertising London'
      WHEN p.slug = 'healthcare' THEN 'Healthcare Advertising London'
      WHEN p.slug = 'education' THEN 'Education Advertising London'
      WHEN p.slug = 'automotive' THEN 'Automotive Advertising London'
      WHEN p.slug = 'fashion' THEN 'Fashion Advertising London'
    END || '", "provider": {"@type": "Organization", "name": "London OOH"}, "areaServed": "London, UK"}' as schema_markup,
    auth.uid(),
    auth.uid()
  FROM inserted_pages p
  RETURNING id
)
SELECT 'Industry pages created successfully' as result;