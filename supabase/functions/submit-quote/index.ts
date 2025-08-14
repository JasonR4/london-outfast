import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  notes?: string;
}

interface SubmitPayload {
  quoteSessionId?: string | null;
  contact: SubmitContact;
  source: "smart-quote" | "outdoor-media" | "configurator";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as SubmitPayload;
    console.log('Processing quote submission:', payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get quote data if we have a session ID
    let quoteData = null;
    if (payload.quoteSessionId) {
      console.log('Fetching quote data for session:', payload.quoteSessionId);
      
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .eq('user_session_id', payload.quoteSessionId)
        .maybeSingle();

      if (quoteError) {
        console.error('Error fetching quote:', quoteError);
      } else if (quote) {
        quoteData = quote;
        console.log('Found quote data:', {
          id: quote.id,
          total_cost: quote.total_cost,
          total_inc_vat: quote.total_inc_vat,
          items_count: quote.quote_items?.length || 0
        });
      }
    }

    // Sync to HubSpot
    try {
      console.log('Syncing to HubSpot...');
      
      const hubspotPayload = {
        firstName: payload.contact.firstName,
        lastName: payload.contact.lastName,
        email: payload.contact.email,
        phone: payload.contact.phone,
        website: payload.contact.website,
        company: payload.contact.company,
        submissionType: payload.source === 'configurator' ? 'configurator_quote' : 'format_quote',
        quoteDetails: {
          additionalDetails: payload.contact.notes,
          totalCost: quoteData?.total_inc_vat || quoteData?.total_cost,
          itemCount: quoteData?.quote_items?.length || 0,
          formatName: quoteData?.quote_items?.[0]?.format_name,
          selectedLocations: quoteData?.quote_items?.[0]?.selected_areas || [],
        }
      };

      console.log('HubSpot payload:', hubspotPayload);

      const { data: hubspotResult, error: hubspotError } = await supabase.functions.invoke('sync-hubspot-contact', {
        body: hubspotPayload
      });

      if (hubspotError) {
        console.error('HubSpot sync error:', hubspotError);
      } else {
        console.log('HubSpot sync successful:', hubspotResult);
      }
    } catch (hubspotSyncError) {
      console.error('HubSpot sync failed (non-blocking):', hubspotSyncError);
      // Don't fail the whole submission if HubSpot sync fails
    }

    const response = {
      status: "ok",
      received: {
        quoteSessionId: payload.quoteSessionId || null,
        source: payload.source,
        contactEmail: payload.contact?.email || null,
      },
      quoteData: quoteData ? {
        id: quoteData.id,
        total_cost: quoteData.total_cost,
        total_inc_vat: quoteData.total_inc_vat,
        items_count: quoteData.quote_items?.length || 0
      } : null,
      message: "submit-quote processed and synced to HubSpot",
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("submit-quote error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
