import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Testing HubSpot connection...');
    
    const hubspotToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN');
    console.log('HubSpot token available:', !!hubspotToken);
    console.log('HubSpot token length:', hubspotToken?.length || 0);
    
    if (!hubspotToken) {
      return new Response(JSON.stringify({
        error: "HubSpot access token not configured",
        available_env_vars: Object.keys(Deno.env.toObject()).filter(key => key.includes('HUBSPOT'))
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Test HubSpot API connection
    console.log('🔍 Testing HubSpot API connection...');
    const testResponse = await fetch('https://api.hubapi.com/crm/v3/owners', {
      headers: { 
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('HubSpot API response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('HubSpot API error:', errorText);
      
      return new Response(JSON.stringify({
        error: "HubSpot API test failed",
        status: testResponse.status,
        response: errorText,
        token_configured: true,
        token_length: hubspotToken.length
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    const owners = await testResponse.json();
    console.log('✅ HubSpot API test successful. Found owners:', owners.results?.length || 0);
    
    // Look for Matt's owner ID
    const mattOwner = owners.results?.find((owner: any) => 
      (owner.email || '').toLowerCase().includes('matt@r4advertising.agency')
    );
    
    console.log('Matt owner found:', !!mattOwner);
    if (mattOwner) {
      console.log('Matt owner ID:', mattOwner.id);
    }
    
    return new Response(JSON.stringify({
      status: "success",
      hubspot_connection: "working",
      token_configured: true,
      api_accessible: true,
      owners_count: owners.results?.length || 0,
      matt_owner_found: !!mattOwner,
      matt_owner_id: mattOwner?.id || null,
      test_timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("HubSpot test error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        stack: error.stack
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});