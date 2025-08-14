// IMMEDIATE EXECUTION OF ALL HUBSPOT TESTS
import { supabase } from '@/integrations/supabase/client';

console.log('🚀 EXECUTING ALL HUBSPOT TESTS NOW...');
console.log('=====================================================');

const timestamp = Date.now();

// Test 1: Brief Route - Should create Contact + Deal + Task with [brief] prefix
console.log('📝 Test 1: BRIEF SUBMISSION...');
supabase.functions.invoke('submit-brief', {
  body: {
    firstname: 'John',
    lastname: 'Smith',
    email: `john.smith.${timestamp}@testcompany.com`,
    phone: '+442045243019',
    company: 'Brief Test Company',
    website: 'https://brieftest.com',
    jobtitle: 'Marketing Director',
    budget_band: '£30,000+',
    objective: 'Brand awareness campaign',
    target_areas: ['Westminster', 'Camden', 'Islington'],
    formats: ['48-sheet', '6-sheet', 'digital-48-sheet'],
    start_month: '2025-03-01',
    creative_status: 'Ready to proceed',
    notes: `Test submission ${timestamp}: Brief route should create contact + deal + task`,
    mbl: true,
    source_path: `/brief?test=${timestamp}`
  }
}).then(({ data, error }) => {
  console.log('📝 BRIEF RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
});

// Test 2: Format Pages Route - Should create Contact + Deal + Task with [outdoor-media] prefix
setTimeout(() => {
  console.log('🏢 Test 2: FORMAT PAGES (outdoor-media)...');
  supabase.functions.invoke('submit-quote', {
    body: {
      quoteSessionId: `format-test-${timestamp}`,
      contact: {
        firstName: 'Jane',
        lastName: 'Wilson',
        email: `jane.wilson.${timestamp}@formattest.com`,
        phone: '+442045243019',
        company: 'Format Pages Test Ltd',
        website: 'https://formattest.com',
        notes: `Test submission ${timestamp}: Format pages route should create contact + deal + task`
      },
      source: 'outdoor-media'
    }
  }).then(({ data, error }) => {
    console.log('🏢 FORMAT PAGES RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
  });
}, 1000);

// Test 3: Configurator Route - Should create Contact + Deal + Task with [configurator] prefix
setTimeout(() => {
  console.log('⚙️ Test 3: CONFIGURATOR...');
  supabase.functions.invoke('submit-quote', {
    body: {
      quoteSessionId: `config-test-${timestamp}`,
      contact: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: `mike.johnson.${timestamp}@configtest.com`,
        phone: '+442045243019',
        company: 'Configurator Test Group',
        website: 'https://configtest.com',
        notes: `Test submission ${timestamp}: Configurator route should create contact + deal + task`
      },
      source: 'configurator'
    }
  }).then(({ data, error }) => {
    console.log('⚙️ CONFIGURATOR RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
  });
}, 2000);

// Test 4: Smart Quote Route - Should create Contact + Deal + Task with [smart-quote] prefix
setTimeout(() => {
  console.log('🧠 Test 4: SMART QUOTE...');
  supabase.functions.invoke('submit-quote', {
    body: {
      quoteSessionId: `smart-test-${timestamp}`,
      contact: {
        firstName: 'Sarah',
        lastName: 'Davis',
        email: `sarah.davis.${timestamp}@smarttest.com`,
        phone: '+442045243019',
        company: 'Smart Quote Solutions',
        website: 'https://smarttest.com',
        notes: `Test submission ${timestamp}: Smart quote route should create contact + deal + task`
      },
      source: 'smart-quote'
    }
  }).then(({ data, error }) => {
    console.log('🧠 SMART QUOTE RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
    
    // Final summary after all tests
    setTimeout(() => {
      console.log('=====================================================');
      console.log('🎯 ALL 4 HUBSPOT TESTS COMPLETED!');
      console.log('📊 EXPECTED RESULTS IN HUBSPOT:');
      console.log('');
      console.log('📝 BRIEF: John Smith + Deal "[brief] Brief Quote Request" + Task');
      console.log('🏢 FORMAT: Jane Wilson + Deal "[outdoor-media] Format Quote" + Task');
      console.log('⚙️ CONFIG: Mike Johnson + Deal "[configurator] Configurator Quote" + Task');
      console.log('🧠 SMART: Sarah Davis + Deal "[smart-quote] General Quote" + Task');
      console.log('');
      console.log('💡 All tasks assigned to Matt @ r4advertising.agency');
      console.log('🔍 Search HubSpot for timestamp:', timestamp);
      console.log('=====================================================');
    }, 1000);
  });
}, 3000);

console.log(`🔍 Test timestamp: ${timestamp}`);