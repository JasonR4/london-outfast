// SINGLE CONTROLLED TEST - NO LOOPS
import { supabase } from '@/integrations/supabase/client';

console.log('🧪 SINGLE CONTROLLED TEST - ASSOCIATION + LINE ITEMS');
console.log('=====================================================');

const timestamp = Date.now();

// Just one simple test with debugging
console.log('📝 Creating ONE test with full debug info...');

supabase.functions.invoke('sync-hubspot-contact', {
  body: {
    firstName: 'Debug',
    lastName: 'Test',
    email: `debug.test.${timestamp}@example.com`,
    phone: '+442045243019',
    company: 'Debug Test Company',
    submissionType: 'format_quote',
    quoteDetails: {
      formatName: '48-Sheet Billboard',
      totalCost: 12000,
      itemCount: 3,
      selectedLocations: ['Westminster', 'Camden'],
      additionalDetails: 'Debug test with line items'
    }
  }
}).then(({ data, error }) => {
  console.log('🧪 DEBUG TEST RESULT:');
  if (error) {
    console.error('❌ ERROR:', error);
  } else {
    console.log('✅ SUCCESS:', data);
  }
  
  setTimeout(() => {
    console.log('=====================================================');
    console.log('🎯 DEBUG TEST COMPLETED');
    console.log('👤 CONTACT: Debug Test');
    console.log('🤝 DEAL: Should be associated');
    console.log('📋 LINE ITEMS: 48-Sheet Billboard (3x)');
    console.log('💷 AMOUNT: £12,000');
    console.log(`🔍 Search: ${timestamp}`);
    console.log('=====================================================');
  }, 1000);
});

console.log(`🔍 Debug timestamp: ${timestamp}`);