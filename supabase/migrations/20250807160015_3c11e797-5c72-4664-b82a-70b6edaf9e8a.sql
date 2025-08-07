-- Create SEO data for main website pages that are missing

INSERT INTO seo_pages (
  page_slug,
  meta_title,
  meta_description,
  keywords,
  focus_keyword,
  h1_heading,
  h2_headings,
  h3_headings,
  content_structure,
  london_locations,
  schema_markup,
  canonical_url,
  og_title,
  og_description,
  twitter_title,
  twitter_description,
  created_by,
  updated_by
) VALUES 
-- Homepage SEO
(
  '/',
  'London''s Fastest OOH Media Buying Agency | Media Buying London',
  'London''s fastest out-of-home media buying agency. Unbeaten on price, unmatched on speed. Same-day quotes for all OOH formats across Greater London.',
  ARRAY[
    'ooh advertising london',
    'outdoor advertising agency london',
    'billboard advertising london',
    'bus shelter ads london',
    'tube advertising london',
    'digital billboards london',
    'media buying agency london',
    'london outdoor advertising',
    'out of home advertising london',
    'london billboard rates',
    'outdoor media london',
    'london advertising agency',
    'ooh media buying',
    'outdoor advertising rates london',
    'london media agency'
  ],
  'ooh advertising london',
  'London''s Fastest OOH Media Buying Agency | Unbeaten Prices & Speed',
  ARRAY[
    'Why Choose Media Buying London for OOH?',
    'Complete Outdoor Advertising Solutions',
    'London Coverage Across All Zones',
    'Fast Quote Process & Campaign Setup',
    'Unbeaten Pricing & Premium Service'
  ],
  ARRAY[
    'Billboards & 48-Sheet Advertising',
    'Bus Shelter & Transport Media',
    'Digital OOH & LED Screens',
    'Tube & Underground Advertising',
    'Street Furniture & Ambient Media',
    'Zone 1 Premium Locations',
    'Zone 2-3 High Traffic Routes',
    'Central London Business Districts',
    'East London Creative Quarters',
    'West London Shopping Areas',
    'Same-Day Quote Guarantee',
    '48-Hour Campaign Launch',
    'Competitive Rate Matching',
    'End-to-End Campaign Management',
    'ROI Tracking & Analytics'
  ],
  JSON_BUILD_OBJECT(
    'word_count', 950,
    'readability_score', 85,
    'keyword_density', 2.1
  ),
  ARRAY[
    'Central London',
    'Westminster',
    'Camden',
    'Islington',
    'Hackney',
    'Tower Hamlets',
    'Greenwich',
    'Lewisham',
    'Southwark',
    'Lambeth',
    'Wandsworth',
    'Hammersmith and Fulham',
    'Kensington and Chelsea',
    'City of London',
    'Canary Wharf',
    'Shoreditch',
    'Brick Lane',
    'Oxford Street',
    'Regent Street',
    'Bond Street',
    'Piccadilly Circus',
    'Leicester Square',
    'Covent Garden',
    'London Bridge',
    'Borough Market'
  ],
  JSON_BUILD_OBJECT(
    '@context', 'https://schema.org',
    '@type', ARRAY['LocalBusiness', 'MarketingAgency'],
    'name', 'Media Buying London',
    'description', 'London''s fastest out-of-home media buying agency specializing in outdoor advertising campaigns across Greater London.',
    'address', JSON_BUILD_OBJECT(
      '@type', 'PostalAddress',
      'addressLocality', 'London',
      'addressCountry', 'GB'
    ),
    'geo', JSON_BUILD_OBJECT(
      '@type', 'GeoCoordinates',
      'latitude', 51.5074,
      'longitude', -0.1278
    ),
    'telephone', '+442080680220',
    'url', 'https://mediabuyinglondon.co.uk',
    'areaServed', 'Greater London',
    'serviceType', 'Out-of-Home Media Buying',
    'priceRange', '£100-£50000',
    'offers', JSON_BUILD_OBJECT(
      '@type', 'Offer',
      'description', 'Out-of-home advertising campaigns across London',
      'areaServed', 'Greater London'
    )
  ),
  'https://mediabuyinglondon.co.uk/',
  'London''s Fastest OOH Media Buying Agency | Unbeaten Prices',
  'Get same-day quotes for outdoor advertising across London. Premium OOH campaigns from billboard to digital with unmatched speed and pricing.',
  'London''s Fastest OOH Media Buying Agency',
  'London''s fastest outdoor advertising agency. Same-day quotes, unbeaten prices, 48-hour campaign launch across Greater London.',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000'
),

-- Quote Page SEO
(
  '/quote',
  'Get Your OOH Quote | Fast London Outdoor Advertising Quotes',
  'Get instant quotes for outdoor advertising in London. Same-day pricing for billboards, digital OOH, transport media and more. Fast, competitive, reliable.',
  ARRAY[
    'ooh quote london',
    'outdoor advertising quote',
    'billboard quote london',
    'digital ooh pricing',
    'london advertising rates',
    'outdoor media quote',
    'ooh pricing london',
    'advertising quote london',
    'billboard rates london',
    'transport advertising quote'
  ],
  'ooh quote london',
  'Get Your London OOH Quote | Same-Day Pricing Guarantee',
  ARRAY[
    'Quick Quote Process',
    'Competitive OOH Pricing',
    'London Coverage Options',
    'Campaign Planning Tools',
    'Instant Rate Calculations'
  ],
  ARRAY[
    'Select Your Media Format',
    'Choose London Locations',
    'Pick Campaign Duration',
    'Review Pricing Options',
    'Submit Quote Request',
    'Same-Day Response Guarantee',
    'Competitive Rate Matching',
    'No Hidden Fees Policy',
    'Flexible Payment Terms',
    'Expert Campaign Advice'
  ],
  JSON_BUILD_OBJECT(
    'word_count', 650,
    'readability_score', 88,
    'keyword_density', 1.9
  ),
  ARRAY['Central London', 'Westminster', 'Camden', 'Islington', 'Hackney', 'Canary Wharf', 'Shoreditch'],
  JSON_BUILD_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'WebPage',
    'name', 'OOH Quote Request - London Outdoor Advertising',
    'description', 'Request instant quotes for outdoor advertising campaigns across London with same-day response guarantee.'
  ),
  'https://mediabuyinglondon.co.uk/quote',
  'Get Your London OOH Quote | Same-Day Response',
  'Request instant quotes for outdoor advertising in London. Same-day response, competitive pricing, expert advice for all OOH formats.',
  'Get Your London OOH Quote',
  'Fast quotes for outdoor advertising in London. Same-day response, competitive rates for billboards, digital OOH and transport media.',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000'
),

-- Outdoor Media Directory SEO
(
  '/outdoor-media',
  'Outdoor Media Directory | All OOH Formats London | Media Buying London',
  'Complete directory of outdoor advertising formats in London. From billboards to digital OOH, transport media to ambient advertising - explore all options.',
  ARRAY[
    'outdoor media formats london',
    'ooh formats directory',
    'billboard types london',
    'digital ooh formats',
    'transport advertising formats',
    'ambient advertising london',
    'outdoor advertising options',
    'london ooh directory',
    'advertising formats guide',
    'outdoor media types'
  ],
  'outdoor media formats london',
  'Complete London Outdoor Media Directory | All OOH Formats',
  ARRAY[
    'Billboard & Large Format Options',
    'Digital OOH & LED Displays',
    'Transport & Underground Media',
    'Street Furniture & Ambient',
    'Specialist & Premium Formats'
  ],
  ARRAY[
    '48-Sheet & 96-Sheet Billboards',
    '6-Sheet Poster Sites',
    'Digital LED Screens',
    'Bus Shelter Advertising',
    'Tube Car Panels',
    'Platform Advertising',
    'Street Furniture Options',
    'Ambient & Guerrilla Media',
    'Premium London Locations',
    'High-Traffic Routes',
    'Business District Coverage',
    'Residential Area Targeting',
    'Tourist Hotspot Exposure',
    'Transport Hub Advertising',
    'Shopping Centre Media'
  ],
  JSON_BUILD_OBJECT(
    'word_count', 750,
    'readability_score', 86,
    'keyword_density', 2.0
  ),
  ARRAY['Central London', 'Westminster', 'Camden', 'Islington', 'Hackney', 'City of London', 'Canary Wharf'],
  JSON_BUILD_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'WebPage',
    'name', 'Outdoor Media Directory - London OOH Formats',
    'description', 'Complete directory of outdoor advertising formats available in London with pricing and coverage information.'
  ),
  'https://mediabuyinglondon.co.uk/outdoor-media',
  'London Outdoor Media Directory | All OOH Formats',
  'Complete guide to outdoor advertising formats in London. From billboards to digital displays, transport media to ambient options.',
  'London Outdoor Media Directory',
  'Complete directory of outdoor advertising formats in London. Billboards, digital OOH, transport media and more with instant quotes.',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000'
),

-- Industries Page SEO
(
  '/industries',
  'Industry-Specific OOH Solutions | Targeted Outdoor Advertising London',
  'Specialized outdoor advertising solutions for every industry. From automotive to technology, retail to finance - expert OOH campaigns across London.',
  ARRAY[
    'industry outdoor advertising',
    'sector specific ooh london',
    'automotive advertising london',
    'retail outdoor advertising',
    'finance ooh campaigns',
    'technology billboard advertising',
    'property advertising london',
    'entertainment ooh london',
    'healthcare advertising outdoor',
    'education outdoor media'
  ],
  'industry outdoor advertising',
  'Industry-Specific OOH Solutions | Expert Sector Targeting',
  ARRAY[
    'Automotive & Transport Advertising',
    'Retail & Consumer Brand Campaigns',
    'Finance & Professional Services',
    'Technology & Innovation Sector',
    'Property & Real Estate Marketing'
  ],
  ARRAY[
    'Automotive Dealership Campaigns',
    'Retail Store Promotions',
    'Financial Services Branding',
    'Tech Company Launches',
    'Property Development Marketing',
    'Entertainment & Events',
    'Healthcare & Wellness',
    'Education & Training',
    'Food & Beverage Campaigns',
    'Fashion & Lifestyle Brands',
    'B2B Service Providers',
    'Start-up Brand Building',
    'Corporate Reputation Management',
    'Product Launch Campaigns',
    'Seasonal Promotions'
  ],
  JSON_BUILD_OBJECT(
    'word_count', 800,
    'readability_score', 84,
    'keyword_density', 1.8
  ),
  ARRAY['Central London', 'Canary Wharf', 'Shoreditch', 'Westminster', 'City of London'],
  JSON_BUILD_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'WebPage',
    'name', 'Industry-Specific OOH Solutions London',
    'description', 'Specialized outdoor advertising solutions tailored for different industries across London.'
  ),
  'https://mediabuyinglondon.co.uk/industries',
  'Industry-Specific OOH Solutions | Targeted London Campaigns',
  'Expert outdoor advertising solutions for every industry. Automotive, retail, finance, tech and more with specialized London campaigns.',
  'Industry-Specific OOH Solutions',
  'Specialized outdoor advertising for every industry in London. Expert campaigns for automotive, retail, finance, tech and more.',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000'
),

-- About Page SEO
(
  '/about',
  'About Media Buying London | Leading OOH Agency | Expert Team',
  'Meet London''s leading outdoor advertising agency. Expert team, proven results, unmatched speed. Learn why we''re the fastest OOH media buying agency in London.',
  ARRAY[
    'about media buying london',
    'london ooh agency team',
    'outdoor advertising experts',
    'ooh agency london',
    'media buying specialists',
    'advertising agency london',
    'outdoor media experts',
    'billboard agency london',
    'ooh media professionals',
    'london advertising specialists'
  ],
  'about media buying london',
  'About Media Buying London | Leading OOH Specialists',
  ARRAY[
    'Our Expert Team',
    'Company Mission & Values',
    'Proven Track Record',
    'Industry Recognition',
    'Client Success Stories'
  ],
  ARRAY[
    'Founded by Industry Veterans',
    'Award-Winning Campaigns',
    'Client-First Approach',
    'Innovative Solutions',
    'Proven Results',
    'Industry Partnerships',
    'Technology-Driven Processes',
    'Same-Day Response Guarantee',
    'Competitive Pricing Promise',
    'Expert Account Management',
    'Creative Design Support',
    'Campaign Optimization',
    'Performance Analytics',
    'Client Testimonials',
    'Industry Recognition'
  ],
  JSON_BUILD_OBJECT(
    'word_count', 700,
    'readability_score', 82,
    'keyword_density', 1.7
  ),
  ARRAY['London'],
  JSON_BUILD_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'AboutPage',
    'name', 'About Media Buying London',
    'description', 'Learn about London''s fastest outdoor advertising agency and our expert team of OOH specialists.'
  ),
  'https://mediabuyinglondon.co.uk/about',
  'About Media Buying London | Expert OOH Team',
  'Meet London''s leading outdoor advertising agency. Expert team, proven results, same-day quotes and unmatched campaign speed.',
  'About Media Buying London',
  'London''s fastest outdoor advertising agency. Expert team, proven results, same-day quotes for all OOH formats across London.',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000'
)

ON CONFLICT (page_slug) DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  keywords = EXCLUDED.keywords,
  focus_keyword = EXCLUDED.focus_keyword,
  h1_heading = EXCLUDED.h1_heading,
  h2_headings = EXCLUDED.h2_headings,
  h3_headings = EXCLUDED.h3_headings,
  content_structure = EXCLUDED.content_structure,
  london_locations = EXCLUDED.london_locations,
  schema_markup = EXCLUDED.schema_markup,
  canonical_url = EXCLUDED.canonical_url,
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description,
  twitter_title = EXCLUDED.twitter_title,
  twitter_description = EXCLUDED.twitter_description,
  updated_at = NOW(),
  updated_by = EXCLUDED.updated_by;