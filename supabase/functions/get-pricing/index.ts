import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if gating is enabled
    const gated = (Deno.env.get('GATED_QUOTES') || 'false') === 'true';
    
    if (gated) {
      // Get the authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'auth_required' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create Supabase client to verify auth
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'auth_required' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Parse request body
    const { formatSlug, location, periods, quantity } = await req.json();

    // Mock pricing calculation (replace with your actual pricing logic)
    const baseRate = 800; // Example base rate per period
    const mediaPrice = baseRate * quantity * periods.length;
    const qualifiesVolume = periods.length >= 3;
    const discount = qualifiesVolume ? mediaPrice * 0.1 : 0;
    const productionCost = quantity * 50; // Example production cost
    const creativeCost = 0; // Example creative cost

    const pricing = {
      mediaPrice,
      discount,
      productionCost,
      creativeCost,
      totalCost: mediaPrice - discount + productionCost + creativeCost,
      qualifiesVolume
    };

    return new Response(
      JSON.stringify({ success: true, pricing }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in pricing function:', error);
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});