import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testing all HubSpot routes...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const results = [];

    // Test 1: Brief Route
    console.log('🔍 Testing Brief Route...');
    try {
      const briefPayload = {
        firstname: 'Test',
        lastname: 'Brief Route',
        email: 'test.brief.route@example.com',
        phone: '+442045243019',
        company: 'Test Company Brief Route',
        website: 'https://test-brief-route.com',
        jobtitle: 'Marketing Manager',
        budget_band: '15000',
        objective: 'Brand awareness',
        target_areas: ['Westminster', 'Camden'],
        formats: ['48-sheet', '6-sheet'],
        start_month: '2025-03-01',
        creative_status: 'Ready',
        notes: 'Testing brief route HubSpot integration - [brief] route',
        mbl: true,
        source_path: '/brief?test=hubspot-sync'
      };
      
      const { data: briefData, error: briefError } = await supabase.functions.invoke('submit-brief', {
        body: briefPayload
      });
      
      results.push({
        route: 'brief',
        status: briefError ? 'error' : 'success',
        data: briefData,
        error: briefError?.message
      });
      
      console.log('✅ Brief route result:', briefError ? briefError : 'Success');
    } catch (e) {
      console.error('❌ Brief route error:', e);
      results.push({ route: 'brief', status: 'error', error: e.message });
    }

    // Test 2: Format Route (outdoor-media)
    console.log('🔍 Testing Format Route...');
    try {
      const formatPayload = {
        quoteSessionId: 'test-format-session-001',
        contact: {
          firstName: 'Test',
          lastName: 'Format Route',
          email: 'test.format.route@example.com',
          phone: '+442045243019',
          company: 'Test Company Format Route',
          website: 'https://test-format-route.com',
          notes: 'Testing format route HubSpot integration - [outdoor-media] route'
        },
        source: 'outdoor-media'
      };
      
      const { data: formatData, error: formatError } = await supabase.functions.invoke('submit-quote', {
        body: formatPayload
      });
      
      results.push({
        route: 'outdoor-media (format)',
        status: formatError ? 'error' : 'success',
        data: formatData,
        error: formatError?.message
      });
      
      console.log('✅ Format route result:', formatError ? formatError : 'Success');
    } catch (e) {
      console.error('❌ Format route error:', e);
      results.push({ route: 'outdoor-media (format)', status: 'error', error: e.message });
    }

    // Test 3: Configurator Route
    console.log('🔍 Testing Configurator Route...');
    try {
      const configPayload = {
        quoteSessionId: 'test-config-session-002',
        contact: {
          firstName: 'Test',
          lastName: 'Configurator Route',
          email: 'test.config.route@example.com',
          phone: '+442045243019',
          company: 'Test Company Configurator Route',
          website: 'https://test-config-route.com',
          notes: 'Testing configurator route HubSpot integration - [configurator] route'
        },
        source: 'configurator'
      };
      
      const { data: configData, error: configError } = await supabase.functions.invoke('submit-quote', {
        body: configPayload
      });
      
      results.push({
        route: 'configurator',
        status: configError ? 'error' : 'success',
        data: configData,
        error: configError?.message
      });
      
      console.log('✅ Configurator route result:', configError ? configError : 'Success');
    } catch (e) {
      console.error('❌ Configurator route error:', e);
      results.push({ route: 'configurator', status: 'error', error: e.message });
    }

    // Test 4: Smart Quote Route
    console.log('🔍 Testing Smart Quote Route...');
    try {
      const smartPayload = {
        quoteSessionId: 'test-smart-session-003',
        contact: {
          firstName: 'Test',
          lastName: 'Smart Quote Route',
          email: 'test.smart.route@example.com',
          phone: '+442045243019',
          company: 'Test Company Smart Quote Route',
          website: 'https://test-smart-route.com',
          notes: 'Testing smart quote route HubSpot integration - [smart-quote] route'
        },
        source: 'smart-quote'
      };
      
      const { data: smartData, error: smartError } = await supabase.functions.invoke('submit-quote', {
        body: smartPayload
      });
      
      results.push({
        route: 'smart-quote',
        status: smartError ? 'error' : 'success',
        data: smartData,
        error: smartError?.message
      });
      
      console.log('✅ Smart quote route result:', smartError ? smartError : 'Success');
    } catch (e) {
      console.error('❌ Smart quote route error:', e);
      results.push({ route: 'smart-quote', status: 'error', error: e.message });
    }

    // Summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`🎯 Testing complete: ${successCount} success, ${errorCount} errors`);
    
    return new Response(JSON.stringify({
      status: "testing_complete",
      summary: {
        total_routes: results.length,
        successful: successCount,
        failed: errorCount
      },
      results: results,
      message: "HubSpot integration test completed for all 4 routes"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Test function error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});