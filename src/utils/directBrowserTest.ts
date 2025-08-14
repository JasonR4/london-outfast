// DIRECT BROWSER TEST - NO IMPORTS
const timestamp = Date.now();

console.log('🔧 DIRECT BROWSER TEST - ONE SHOT');
console.log('================================');

// Direct function call - no loops possible
const runDirectTest = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('📦 Testing direct function call...');
    
    const result = await supabase.functions.invoke('sync-hubspot-contact', {
      body: {
        firstName: 'Direct',
        lastName: 'Test',
        email: `direct.test.${timestamp}@example.com`,
        phone: '+442045243019',
        company: 'Direct Test Company',
        submissionType: 'format_quote',
        quoteDetails: {
          formatName: '48-Sheet Billboard',
          totalCost: 8500,
          itemCount: 2,
          selectedLocations: ['Westminster', 'Camden'],
          additionalDetails: 'Direct test - line items must appear'
        }
      }
    });

    console.log('🔧 DIRECT TEST RESULT:', result);
    
    if (result.error) {
      console.error('❌ DIRECT TEST ERROR:', result.error);
    } else {
      console.log('✅ DIRECT TEST SUCCESS:', result.data);
      console.log('');
      console.log('📊 EXPECTED IN HUBSPOT:');
      console.log('👤 CONTACT: Direct Test');
      console.log('🤝 DEAL: [outdoor-media] Format Quote');
      console.log('📦 LINE ITEMS: 48-Sheet Billboard (2x £8,500)');
      console.log('📍 LOCATIONS: Westminster, Camden');
      console.log(`🔍 Search timestamp: ${timestamp}`);
    }
  } catch (error) {
    console.error('❌ DIRECT TEST EXCEPTION:', error);
  }
};

// Call it once immediately
runDirectTest();

console.log(`🔍 Direct test timestamp: ${timestamp}`);