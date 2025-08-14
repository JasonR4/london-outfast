// FINAL LINE ITEMS TEST
import { supabase } from '@/integrations/supabase/client';

console.log('🔧 FINAL LINE ITEMS TEST - MUST WORK!');
console.log('=====================================================');

const timestamp = Date.now();

console.log('📦 Testing line items creation with detailed logging...');

supabase.functions.invoke('sync-hubspot-contact', {
  body: {
    firstName: 'Final',
    lastName: 'Test',
    email: `final.test.${timestamp}@example.com`,
    phone: '+442045243019',
    company: 'Line Items Test Co',
    submissionType: 'format_quote',
    quoteDetails: {
      formatName: '48-Sheet Billboard',
      totalCost: 15000,
      itemCount: 5,
      selectedLocations: ['Westminster', 'Camden', 'King\'s Cross'],
      additionalDetails: 'FINAL TEST - Line items MUST appear in deal'
    }
  }
}).then(({ data, error }) => {
  console.log('🔧 FINAL TEST RESULT:');
  if (error) {
    console.error('❌ ERROR:', error);
  } else {
    console.log('✅ SUCCESS:', data);
  }
  
  setTimeout(() => {
    console.log('=====================================================');
    console.log('🎯 FINAL LINE ITEMS TEST COMPLETED');
    console.log('');
    console.log('👤 CONTACT: Final Test');
    console.log('🤝 DEAL: [outdoor-media] Format Quote - Associated');
    console.log('📦 LINE ITEMS: 48-Sheet Billboard (5x)');
    console.log('📍 LOCATIONS: Westminster, Camden, King\'s Cross');
    console.log('💷 AMOUNT: £15,000');
    console.log('');
    console.log('🚨 CHECK: Line items tab in deal record!');
    console.log(`🔍 Search: ${timestamp}`);
    console.log('=====================================================');
  }, 2000);
});

console.log(`🔍 Final test timestamp: ${timestamp}`);