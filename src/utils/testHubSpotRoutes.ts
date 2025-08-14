import { supabase } from '@/integrations/supabase/client';

export async function testAllHubSpotRoutes() {
  try {
    console.log('🧪 Starting HubSpot route tests...');
    
    const { data, error } = await supabase.functions.invoke('test-hubspot-routes', {
      body: {}
    });
    
    if (error) {
      console.error('❌ HubSpot test error:', error);
      throw error;
    }
    
    console.log('✅ HubSpot test results:', data);
    return data;
  } catch (error) {
    console.error('Failed to test HubSpot routes:', error);
    throw error;
  }
}

// Execute immediately for testing
if (typeof window !== 'undefined') {
  // Only run in browser environment
  testAllHubSpotRoutes().then(result => {
    console.log('🎯 All HubSpot routes tested:', result);
  }).catch(error => {
    console.error('🚨 HubSpot test failed:', error);
  });
}