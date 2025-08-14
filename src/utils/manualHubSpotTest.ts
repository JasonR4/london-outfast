// Manual HubSpot connection test trigger
import { supabase } from '@/integrations/supabase/client';

console.log('🚀 MANUALLY TRIGGERING HUBSPOT CONNECTION TEST NOW...');

supabase.functions.invoke('test-hubspot-connection', { body: {} })
  .then(({ data, error }) => {
    console.log('=== HUBSPOT CONNECTION TEST RESULTS ===');
    if (error) {
      console.error('❌ HubSpot connection test FAILED:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ HubSpot connection test SUCCESS:', data);
      console.log('Full result details:', JSON.stringify(data, null, 2));
      
      if (data?.hubspot_connection === 'working') {
        console.log('🎉 HubSpot API is accessible!');
        console.log('📊 Token configured:', data.token_configured);
        console.log('👥 Owners found:', data.owners_count);
        console.log('👤 Matt owner found:', data.matt_owner_found);
        if (data.matt_owner_id) {
          console.log('🆔 Matt owner ID:', data.matt_owner_id);
        }
      }
    }
    console.log('=== END HUBSPOT TEST RESULTS ===');
  })
  .catch(e => {
    console.error('💥 HubSpot test EXCEPTION:', e);
  });

// Also test the quote submission functions
console.log('🚀 ALSO TESTING QUOTE SUBMISSIONS...');

// Test Brief Route
supabase.functions.invoke('submit-brief', {
  body: {
    firstname: 'Test',
    lastname: 'Manual Brief Test',
    email: 'manual.brief.test@example.com',
    phone: '+442045243019',
    company: 'Manual Test Company Brief',
    website: 'https://manual-test-brief.com',
    jobtitle: 'Test Manager',
    budget_band: '20000',
    objective: 'Brand awareness',
    target_areas: ['Westminster', 'Camden'],
    formats: ['48-sheet', '6-sheet'],
    start_month: '2025-03-01',
    creative_status: 'Ready',
    notes: 'MANUAL TEST: Brief route HubSpot integration test',
    mbl: true,
    source_path: '/brief?test=manual'
  }
}).then(({ data, error }) => {
  console.log('📝 Brief submission result:', error ? error : data);
});

// Test Quote Route  
supabase.functions.invoke('submit-quote', {
  body: {
    quoteSessionId: 'manual-test-session-001',
    contact: {
      firstName: 'Test',
      lastName: 'Manual Quote Test',
      email: 'manual.quote.test@example.com',
      phone: '+442045243019',
      company: 'Manual Test Company Quote',
      website: 'https://manual-test-quote.com',
      notes: 'MANUAL TEST: Quote route HubSpot integration test'
    },
    source: 'outdoor-media'
  }
}).then(({ data, error }) => {
  console.log('💼 Quote submission result:', error ? error : data);
});