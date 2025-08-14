// TEST ASSOCIATION AND QUOTE DETAILS FIX
import { supabase } from '@/integrations/supabase/client';

console.log('🔧 TESTING ASSOCIATION AND QUOTE DETAILS FIX...');
console.log('=====================================================');

const timestamp = Date.now();

// Test with comprehensive quote details
console.log('🧪 Testing enhanced quote with full details...');
supabase.functions.invoke('submit-quote', {
  body: {
    quoteSessionId: `association-test-${timestamp}`,
    contact: {
      firstName: 'Alice',
      lastName: 'Thompson',
      email: `alice.thompson.${timestamp}@associationtest.com`,
      phone: '+442045243019',
      company: 'Association Test Company Ltd',
      website: 'https://associationtest.com',
      notes: `Association test ${timestamp}: Testing proper contact-deal association with detailed quote items`
    },
    source: 'outdoor-media'
  }
}).then(({ data, error }) => {
  console.log('🧪 ASSOCIATION TEST RESULT:', error ? `❌ ERROR: ${error.message}` : `✅ SUCCESS: ${JSON.stringify(data)}`);
  
  setTimeout(() => {
    console.log('=====================================================');
    console.log('🎯 ASSOCIATION TEST COMPLETED!');
    console.log('📊 EXPECTED RESULTS IN HUBSPOT:');
    console.log('');
    console.log('👤 CONTACT: Alice Thompson');
    console.log('🤝 DEAL: [outdoor-media] Format Quote - Associated with Alice');
    console.log('📋 TASK: Work on brief - Assigned to Matt');
    console.log('📝 QUOTE DETAILS: Should be visible in deal description');
    console.log('');
    console.log('💡 Check Associations tab in both contact and deal records');
    console.log(`🔍 Search for: ${timestamp}`);
    console.log('=====================================================');
  }, 1000);
});

console.log(`🔍 Association test timestamp: ${timestamp}`);