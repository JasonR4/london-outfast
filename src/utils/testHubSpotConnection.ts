import { supabase } from '@/integrations/supabase/client';

// Test HubSpot connection immediately
async function testHubSpotConnection() {
  console.log('🔍 Testing HubSpot connection now...');
  
  try {
    const { data, error } = await supabase.functions.invoke('test-hubspot-connection', {
      body: {}
    });
    
    if (error) {
      console.error('❌ HubSpot connection test failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ HubSpot connection test result:', data);
      console.log('Full result:', JSON.stringify(data, null, 2));
    }
    
    return { data, error };
  } catch (e) {
    console.error('🚨 HubSpot test exception:', e);
    return { data: null, error: e };
  }
}

// Execute immediately
testHubSpotConnection().then(result => {
  console.log('🎯 HubSpot test completed:', result);
}).catch(error => {
  console.error('💥 HubSpot test failed:', error);
});

export { testHubSpotConnection };