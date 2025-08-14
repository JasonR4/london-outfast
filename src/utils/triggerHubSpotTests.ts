import { supabase } from '@/integrations/supabase/client';

// Trigger HubSpot tests immediately
async function triggerHubSpotTests() {
  console.log('🚀 Starting HubSpot route tests...');
  
  // Test 1: Brief Route
  console.log('📝 Testing Brief Route...');
  try {
    const { data: briefData, error: briefError } = await supabase.functions.invoke('submit-brief', {
      body: {
        firstname: 'Test',
        lastname: 'Brief Route LIVE',
        email: 'test.brief.live.now@example.com',
        phone: '+442045243019',
        company: 'Test Company Brief LIVE',
        website: 'https://test-brief-live.com',
        jobtitle: 'Marketing Manager',
        budget_band: '15000',
        objective: 'Brand awareness',
        target_areas: ['Westminster', 'Camden'],
        formats: ['48-sheet', '6-sheet'],
        start_month: '2025-03-01',
        creative_status: 'Ready',
        notes: 'LIVE TEST NOW: Brief route HubSpot integration - [brief] route',
        mbl: true,
        source_path: '/brief?test=live-now'
      }
    });
    
    console.log('✅ Brief route result:', briefError ? briefError : briefData);
  } catch (e) {
    console.error('❌ Brief route error:', e);
  }

  // Test 2: Format Route (outdoor-media)
  console.log('🏢 Testing Format Route...');
  try {
    const { data: formatData, error: formatError } = await supabase.functions.invoke('submit-quote', {
      body: {
        quoteSessionId: 'test-format-session-001',
        contact: {
          firstName: 'Test',
          lastName: 'Format Route LIVE',
          email: 'test.format.live.now@example.com',
          phone: '+442045243019',
          company: 'Test Company Format LIVE',
          website: 'https://test-format-live.com',
          notes: 'LIVE TEST NOW: Format route HubSpot integration - [outdoor-media] route'
        },
        source: 'outdoor-media'
      }
    });
    
    console.log('✅ Format route result:', formatError ? formatError : formatData);
  } catch (e) {
    console.error('❌ Format route error:', e);
  }

  // Test 3: Configurator Route
  console.log('⚙️ Testing Configurator Route...');
  try {
    const { data: configData, error: configError } = await supabase.functions.invoke('submit-quote', {
      body: {
        quoteSessionId: 'test-config-session-002',
        contact: {
          firstName: 'Test',
          lastName: 'Configurator Route LIVE',
          email: 'test.config.live.now@example.com',
          phone: '+442045243019',
          company: 'Test Company Configurator LIVE',
          website: 'https://test-config-live.com',
          notes: 'LIVE TEST NOW: Configurator route HubSpot integration - [configurator] route'
        },
        source: 'configurator'
      }
    });
    
    console.log('✅ Configurator route result:', configError ? configError : configData);
  } catch (e) {
    console.error('❌ Configurator route error:', e);
  }

  // Test 4: Smart Quote Route
  console.log('🧠 Testing Smart Quote Route...');
  try {
    const { data: smartData, error: smartError } = await supabase.functions.invoke('submit-quote', {
      body: {
        quoteSessionId: 'test-smart-session-003',
        contact: {
          firstName: 'Test',
          lastName: 'Smart Quote Route LIVE',
          email: 'test.smart.live.now@example.com',
          phone: '+442045243019',
          company: 'Test Company Smart Quote LIVE',
          website: 'https://test-smart-live.com',
          notes: 'LIVE TEST NOW: Smart quote route HubSpot integration - [smart-quote] route'
        },
        source: 'smart-quote'
      }
    });
    
    console.log('✅ Smart quote route result:', smartError ? smartError : smartData);
  } catch (e) {
    console.error('❌ Smart quote route error:', e);
  }

  console.log('🎯 All HubSpot route tests completed!');
}

// Execute the tests
triggerHubSpotTests();