-- Fix page_type for industry pages so they show up correctly
UPDATE content_pages 
SET page_type = 'general'
WHERE page_type = 'industry' AND slug IN (
  'startups', 'healthcare', 'retail', 'events', 'education', 'beauty',
  'automotive', 'agencies', 'property', 'travel', 'construction', 'technology',
  'food', 'government', 'entertainment', 'recruitment', 'finance', 'fashion'
);