-- Test data for brief submission with correct date format
INSERT INTO brief_requests (
  firstname, lastname, email, phone, company, website, jobtitle,
  budget_band, objective, target_areas, formats, start_month,
  creative_status, notes, mbl, source_path
) VALUES (
  'Test', 'Brief Route', 'test.brief@example.com', '+442045243019',
  'Test Company Brief', 'https://test-brief.com', 'Marketing Manager',
  '15000', 'Brand awareness', ARRAY['Westminster', 'Camden'], 
  ARRAY['48-sheet', '6-sheet'], '2025-03-01',
  'Ready', 'Testing brief route submission for HubSpot integration', true,
  '/brief?test=route1'
);