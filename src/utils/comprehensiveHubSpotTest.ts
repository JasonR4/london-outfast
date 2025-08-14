// COMPREHENSIVE TEST OF ALL 4 HUBSPOT ROUTES - EXECUTING NOW
import { supabase } from '@/integrations/supabase/client';

console.log('🚀 RUNNING COMPREHENSIVE TEST OF ALL 4 HUBSPOT ROUTES NOW...');
console.log('=====================================================');

const timestamp = Date.now();

// Route 1: Brief Route (submit-brief function)
console.log('📝 Testing Route 1: BRIEF SUBMISSION...');
supabase.functions.invoke('submit-brief', {
  body: {
    firstname: 'Route Test',
    lastname: 'Brief Complete',
    email: `route.test.brief.${timestamp}@example.com`,
    phone: '+442045243019',
    company: 'Brief Route Test Company',
    website: 'https://brief-route-test.com',
    jobtitle: 'Marketing Director',
    budget_band: '25000',
    objective: 'Brand awareness',
    target_areas: ['Westminster', 'Camden', 'Islington'],
    formats: ['48-sheet', '6-sheet', 'digital-48-sheet'],
    start_month: '2025-03-01',
    creative_status: 'Ready',
    notes: `COMPREHENSIVE TEST ${timestamp}: [brief] route - should create contact + task`,
    mbl: true,
    source_path: `/brief?test=comprehensive-${timestamp}`
  }
}).then(({ data, error }) => {
  console.log('📝 BRIEF RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
});

// Route 2: Format Pages (outdoor-media source)
setTimeout(() => {
  console.log('🏢 Testing Route 2: FORMAT PAGES (outdoor-media)...');
  supabase.functions.invoke('submit-quote', {
    body: {
      quoteSessionId: 'test-format-session-001',
      contact: {
        firstName: 'Route Test',
        lastName: 'Format Pages',
        email: `route.test.format.${timestamp}@example.com`,
        phone: '+442045243019',
        company: 'Format Pages Test Company',
        website: 'https://format-pages-test.com',
        notes: `COMPREHENSIVE TEST ${timestamp}: [outdoor-media] route - should create contact + deal + task`
      },
      source: 'outdoor-media'
    }
  }).then(({ data, error }) => {
    console.log('🏢 FORMAT PAGES RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
  });
}, 1000);

// Route 3: Configurator (configurator source)
setTimeout(() => {
  console.log('⚙️ Testing Route 3: CONFIGURATOR...');
  supabase.functions.invoke('submit-quote', {
    body: {
      quoteSessionId: 'test-config-session-002',
      contact: {
        firstName: 'Route Test',
        lastName: 'Configurator',
        email: `route.test.config.${timestamp}@example.com`,
        phone: '+442045243019',
        company: 'Configurator Test Company',
        website: 'https://configurator-test.com',
        notes: `COMPREHENSIVE TEST ${timestamp}: [configurator] route - should create contact + deal + task`
      },
      source: 'configurator'
    }
  }).then(({ data, error }) => {
    console.log('⚙️ CONFIGURATOR RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
  });
}, 2000);

// Route 4: Smart Quote (smart-quote source)
setTimeout(() => {
  console.log('🧠 Testing Route 4: SMART QUOTE...');
  supabase.functions.invoke('submit-quote', {
    body: {
      quoteSessionId: 'test-smart-session-003',
      contact: {
        firstName: 'Route Test',
        lastName: 'Smart Quote',
        email: `route.test.smart.${timestamp}@example.com`,
        phone: '+442045243019',
        company: 'Smart Quote Test Company',
        website: 'https://smart-quote-test.com',
        notes: `COMPREHENSIVE TEST ${timestamp}: [smart-quote] route - should create contact + deal + task`
      },
      source: 'smart-quote'
    }
  }).then(({ data, error }) => {
    console.log('🧠 SMART QUOTE RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
    
    // Final summary after all tests
    setTimeout(() => {
      console.log('=====================================================');
      console.log('🎯 ALL 4 ROUTE TESTS COMPLETED!');
      console.log('📊 EXPECTED RESULTS IN HUBSPOT:');
      console.log('   📝 Brief: Contact + Task (no deal)');
      console.log('   🏢 Format: Contact + Deal + Task with [outdoor-media] prefix');
      console.log('   ⚙️ Config: Contact + Deal + Task with [configurator] prefix');
      console.log('   🧠 Smart: Contact + Deal + Task with [smart-quote] prefix');
      console.log('');
      console.log('💡 Check HubSpot contacts and deals sections now!');
      console.log(`🔍 Search for emails containing: ${timestamp}`);
      console.log('=====================================================');
    }, 1000);
  });
}, 3000);

console.log(`🔍 Test timestamp: ${timestamp} (use this to find the test records in HubSpot)`);