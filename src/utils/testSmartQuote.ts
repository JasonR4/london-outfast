// TEST SMART QUOTE HUBSPOT SUBMISSION
import { supabase } from '@/integrations/supabase/client';

console.log('🧠 TESTING SMART QUOTE HUBSPOT SUBMISSION');
console.log('=====================================================');

const timestamp = Date.now();

console.log('📝 Creating smart quote test...');

supabase.functions.invoke('submit-quote', {
  body: {
    quoteSessionId: `smart-test-${timestamp}`,
    contact: {
      firstName: 'Smart',
      lastName: 'QuoteTest',
      email: `smart.test.${timestamp}@example.com`,
      phone: '+442045243019',
      company: 'Smart Quote Test Company',
      website: 'https://smartquotetest.com',
      notes: `Smart quote test ${timestamp}: Testing HubSpot integration`
    },
    source: 'smart-quote'
  }
}).then(({ data, error }) => {
  console.log('🧠 SMART QUOTE TEST RESULT:');
  if (error) {
    console.error('❌ ERROR:', error);
    console.error('❌ Full error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ SUCCESS:', data);
    console.log('✅ Full response:', JSON.stringify(data, null, 2));
  }
  
  setTimeout(() => {
    console.log('=====================================================');
    console.log('🎯 SMART QUOTE TEST COMPLETED');
    console.log('');
    console.log('👤 CONTACT: Smart QuoteTest');
    console.log('🤝 DEAL: Should be "[smart-quote] General Quote"');
    console.log('📋 TASK: Should be assigned to Matt');
    console.log('📝 SOURCE: smart-quote → general_quote');
    console.log('');
    console.log('🚨 CHECK: HubSpot for contact and deal creation');
    console.log(`🔍 Search: ${timestamp}`);
    console.log('=====================================================');
  }, 1000);
});

console.log(`🔍 Smart quote test timestamp: ${timestamp}`);