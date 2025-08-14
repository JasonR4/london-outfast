-- Create test quotes for different routes
INSERT INTO quotes (
  user_session_id, contact_name, contact_email, contact_phone, 
  contact_company, website, additional_requirements, total_cost, 
  total_inc_vat, status, user_id
) VALUES 
  -- Format Page Route Test
  ('test-format-session-001', 'Test Format Route', 'test.format@example.com', '+442045243019',
   'Test Company Format', 'https://test-format.com', 'Testing format page submission',
   5000.00, 6000.00, 'draft', null),
  
  -- Configurator Route Test  
  ('test-config-session-002', 'Test Configurator Route', 'test.config@example.com', '+442045243019',
   'Test Company Config', 'https://test-config.com', 'Testing configurator submission',
   8000.00, 9600.00, 'draft', null),
   
  -- Smart Quote Route Test
  ('test-smart-session-003', 'Test Smart Quote Route', 'test.smart@example.com', '+442045243019',
   'Test Company Smart', 'https://test-smart.com', 'Testing smart quote submission',
   12000.00, 14400.00, 'draft', null);