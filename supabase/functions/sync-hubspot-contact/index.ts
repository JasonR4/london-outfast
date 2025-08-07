import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  website?: string;
  company?: string;
  message: string;
  urgency: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const hubspotApiKey = Deno.env.get("HUBSPOT_API_KEY");
    if (!hubspotApiKey) {
      throw new Error("HubSpot API key not configured");
    }

    const formData: ContactFormData = await req.json();

    // Prepare notes with header and campaign information
    const notes = `Contact Page - OOH MBL
    
Campaign Information:
${formData.message}

Urgency: ${formData.urgency}
Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}`;

    // Prepare contact properties for HubSpot
    const contactProperties: any = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      hs_lead_status: "NEW",
      lifecyclestage: "lead",
      notes: notes
    };

    // Add optional fields if provided
    if (formData.phone) {
      contactProperties.phone = formData.phone;
    }
    if (formData.website) {
      contactProperties.website = formData.website;
    }
    if (formData.company) {
      contactProperties.company = formData.company;
    }

    // Add custom properties for OOH campaign data
    contactProperties.campaign_urgency = formData.urgency;
    contactProperties.lead_source = "Contact Page - OOH MBL";

    // Create or update contact in HubSpot
    const hubspotResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hubspotApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: contactProperties
        }),
      }
    );

    if (!hubspotResponse.ok) {
      const errorText = await hubspotResponse.text();
      console.error("HubSpot API error:", errorText);
      
      // If contact already exists, try to update instead
      if (hubspotResponse.status === 409) {
        // Search for existing contact by email
        const searchResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/search`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${hubspotApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filterGroups: [{
                filters: [{
                  propertyName: "email",
                  operator: "EQ",
                  value: formData.email
                }]
              }]
            }),
          }
        );

        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          if (searchResult.results && searchResult.results.length > 0) {
            const contactId = searchResult.results[0].id;
            
            // Update existing contact
            const updateResponse = await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
              {
                method: "PATCH",
                headers: {
                  "Authorization": `Bearer ${hubspotApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  properties: contactProperties
                }),
              }
            );

            if (updateResponse.ok) {
              const result = await updateResponse.json();
              return new Response(JSON.stringify({ 
                success: true, 
                action: "updated",
                contactId: result.id 
              }), {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              });
            }
          }
        }
      }
      
      throw new Error(`HubSpot API error: ${hubspotResponse.status} - ${errorText}`);
    }

    const result = await hubspotResponse.json();
    console.log("Contact synced to HubSpot:", result.id);

    return new Response(JSON.stringify({ 
      success: true, 
      action: "created",
      contactId: result.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in sync-hubspot-contact function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);