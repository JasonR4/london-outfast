import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function createNoteForContact(apiKey: string, contactId: string, noteBody: string, title?: string) {
  try {
    const body = title ? `# ${title}\n\n${noteBody}` : noteBody;
    const resp = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { hs_note_body: body },
        associations: [
          {
            to: { id: contactId },
            types: [
              { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }
            ]
          }
        ]
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error('HubSpot note creation failed:', t);
    }
  } catch (e) {
    console.error('Error creating HubSpot note:', e);
  }
}

// Resolve HubSpot owner by email
async function getOwnerIdByEmail(apiKey: string, email: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://api.hubapi.com/crm/v3/owners/?email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!resp.ok) return null;
    const json: any = await resp.json();
    const owner = Array.isArray(json?.results)
      ? json.results.find((o: any) => (o?.email || '').toLowerCase() === email.toLowerCase())
      : null;
    return owner?.id ? String(owner.id) : null;
  } catch (_) {
    return null;
  }
}

async function createTaskForContact(apiKey: string, contactId: string, subject: string, body: string, ownerEmail = 'shane@r4advertising.agency') {
  try {
    const ownerId = await getOwnerIdByEmail(apiKey, ownerEmail);
    const due = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // +2h
    const createResp = await fetch('https://api.hubapi.com/crm/v3/objects/tasks', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          hs_task_subject: subject,
          hs_task_body: body,
          hs_task_status: 'NOT_STARTED',
          hs_task_priority: 'HIGH',
          hs_timestamp: due,
          ...(ownerId ? { hubspot_owner_id: ownerId } : {}),
        }
      })
    });
    if (!createResp.ok) {
      console.error('Failed to create HubSpot task:', await createResp.text());
      return;
    }
    const created: any = await createResp.json();
    const taskId = created?.id;
    if (!taskId) return;
    // Associate task -> contact
    await fetch(`https://api.hubapi.com/crm/v4/objects/tasks/${taskId}/associations/contacts/${contactId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ associationType: 'task_to_contact' }])
    });
  } catch (e) {
    console.error('Error creating HubSpot task:', e);
  }
}

async function createDealForContact(apiKey: string, contactId: string, dealName: string, amount: number, pipelineStage = "appointmentscheduled", dealContext?: string, quoteItems?: any[]): Promise<string | null> {
  try {
    const dealProps: any = {
      dealname: dealName,
      amount: Math.round(amount), // HubSpot expects integers for amount in cents
      dealstage: pipelineStage,
      hubspot_owner_id: await getOwnerIdByEmail(apiKey, 'shane@r4advertising.agency') || undefined,
      closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
    };

    // Add context as description if provided
    if (dealContext) {
      dealProps.description = dealContext;
    }

    const dealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: dealProps
      }),
    });

    if (!dealResponse.ok) {
      const errorText = await dealResponse.text();
      console.error('HubSpot deal creation failed:', errorText);
      return null;
    }

    const dealResult = await dealResponse.json();
    const dealId = dealResult.id;

    // Associate deal with contact
    await fetch(`https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ associationType: 'deal_to_contact' }])
    });

    // Create line items for quote items if provided
    if (quoteItems && quoteItems.length > 0) {
      await createLineItemsForDeal(apiKey, dealId, quoteItems);
    }

    console.log(`Created HubSpot deal: ${dealId} with amount: £${amount}`);
    return dealId;
  } catch (error) {
    console.error('Error creating HubSpot deal:', error);
    return null;
  }
}

async function createLineItemsForDeal(apiKey: string, dealId: string, quoteItems: any[]) {
  try {
    for (const item of quoteItems) {
      // Create product first (if it doesn't exist)
      const productResponse = await fetch('https://api.hubapi.com/crm/v3/objects/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            name: item.formatName || 'OOH Media Format',
            description: `${item.formatName} - ${item.selectedAreas?.join(', ') || 'Various locations'}`,
            price: Math.round((item.totalCost || 0) * 100), // Convert to cents
          }
        }),
      });

      let productId;
      if (productResponse.ok) {
        const productResult = await productResponse.json();
        productId = productResult.id;
      } else {
        // If product creation fails, skip line item creation for this item
        console.error('Failed to create product for line item:', await productResponse.text());
        continue;
      }

      // Create line item
      const lineItemResponse = await fetch('https://api.hubapi.com/crm/v3/objects/line_items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            name: item.formatName || 'OOH Media Format',
            price: Math.round((item.totalCost || 0) * 100), // Convert to cents
            quantity: item.quantity || 1,
            hs_product_id: productId,
          }
        }),
      });

      if (lineItemResponse.ok) {
        const lineItemResult = await lineItemResponse.json();
        
        // Associate line item with deal
        await fetch(`https://api.hubapi.com/crm/v4/objects/line_items/${lineItemResult.id}/associations/deals/${dealId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{ associationType: 'line_item_to_deal' }])
        });
        
        console.log(`Created line item: ${lineItemResult.id} for deal: ${dealId}`);
      } else {
        console.error('Failed to create line item:', await lineItemResponse.text());
      }
    }
  } catch (error) {
    console.error('Error creating line items for deal:', error);
  }
}

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

interface QuoteFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  website?: string;
  company?: string;
  submissionType: 'format_quote' | 'configurator_quote' | 'general_quote';
  quoteDetails: {
    selectedFormats?: string[];
    selectedLocations?: string[];
    budgetRange?: string;
    campaignObjective?: string;
    targetAudience?: string;
    timeline?: string;
    additionalDetails?: string;
    formatName?: string;
    totalCost?: number;
    itemCount?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const hubspotApiKey = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
    if (!hubspotApiKey) {
      throw new Error("HubSpot access token not configured");
    }

    const requestData = await req.json();
    
    // Determine if this is a contact form or quote submission
    const isQuoteSubmission = requestData.submissionType;
    
    if (isQuoteSubmission) {
      return handleQuoteSubmission(requestData as QuoteFormData, hubspotApiKey);
    } else {
      return handleContactSubmission(requestData as ContactFormData, hubspotApiKey);
    }
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

const handleContactSubmission = async (formData: ContactFormData, hubspotApiKey: string): Promise<Response> => {
  try {

    // Prepare notes with header and campaign information
    const notes = `Contact Page - OOH MBL
    
Campaign Information:
${formData.message}

Urgency: ${formData.urgency}
Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}`;

// Prepare contact properties for HubSpot (only standard fields)
const contactProperties: any = {
  firstname: formData.firstName,
  lastname: formData.lastName,
  email: formData.email,
  hs_lead_status: "NEW",
  lifecyclestage: "lead",
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

// (No custom properties to avoid 400 errors on unknown fields)

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
  // Create a note with the details (non-blocking)
  await createNoteForContact(hubspotApiKey, result.id, notes, 'Contact enquiry - OOH MBL');
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

// Create a note with the details (non-blocking)
await createNoteForContact(hubspotApiKey, result.id, notes, 'Contact enquiry - OOH MBL');

return new Response(JSON.stringify({ 
  success: true, 
  action: "created",
  contactId: result.id 
}), {
  status: 200,
  headers: { "Content-Type": "application/json", ...corsHeaders },
});
  } catch (error: any) {
    console.error("Error in contact submission:", error);
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

const handleQuoteSubmission = async (formData: QuoteFormData, hubspotApiKey: string): Promise<Response> => {
  try {
    // Format quote details based on submission type
    let quoteTitle = "";
    let quoteNotes = "";
    let taskSubject = "";
    let taskBody = "";
    
    switch (formData.submissionType) {
      case 'format_quote':
        quoteTitle = `Format Quote - OOH MBL - ${formData.quoteDetails.formatName || 'Custom Format'}`;
        quoteNotes = `Format Page Quote - OOH MBL

Format: ${formData.quoteDetails.formatName || 'Custom Format'}
${formData.quoteDetails.itemCount ? `Items: ${formData.quoteDetails.itemCount}` : ''}
${formData.quoteDetails.totalCost ? `Total Cost: £${formData.quoteDetails.totalCost}` : ''}
${formData.quoteDetails.selectedLocations?.length ? `Locations: ${formData.quoteDetails.selectedLocations.join(', ')}` : ''}

Campaign Details:
${formData.quoteDetails.additionalDetails || 'No additional details provided'}

Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}`;
        taskSubject = `Work on brief: ${formData.company || formData.firstName} — Format Quote`;
        taskBody = quoteNotes;
        break;
        
      case 'configurator_quote':
        quoteTitle = "Configurator Quote - OOH MBL";
        quoteNotes = `Configurator Quote - OOH MBL

Recommended Formats (${formData.quoteDetails.selectedFormats?.length || 0}):
${formData.quoteDetails.selectedFormats?.map(format => `• ${format}`).join('\n') || 'No formats selected'}

Campaign Information:
• Budget Range: ${formData.quoteDetails.budgetRange || 'Not specified'}
• Objective: ${formData.quoteDetails.campaignObjective || 'Not specified'}
• Target Audience: ${formData.quoteDetails.targetAudience || 'Not specified'}
• Timeline: ${formData.quoteDetails.timeline || 'Not specified'}

${formData.quoteDetails.selectedLocations?.length ? `Priority Locations: ${formData.quoteDetails.selectedLocations.join(', ')}` : ''}

Additional Requirements:
${formData.quoteDetails.additionalDetails || 'None specified'}

Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}`;
        taskSubject = `Work on brief: ${formData.company || formData.firstName} — Configurator`;
        taskBody = quoteNotes;
        break;
        
      case 'general_quote':
        quoteTitle = "General Quote Request - OOH MBL";
        quoteNotes = `General Quote Request - OOH MBL

Selected Formats (${formData.quoteDetails.selectedFormats?.length || 0}):
${formData.quoteDetails.selectedFormats?.map(format => `• ${format}`).join('\n') || 'No formats selected'}

Campaign Information:
• Budget Range: ${formData.quoteDetails.budgetRange || 'Not specified'}
• Objective: ${formData.quoteDetails.campaignObjective || 'Not specified'}
• Target Audience: ${formData.quoteDetails.targetAudience || 'Not specified'}
• Timeline: ${formData.quoteDetails.timeline || 'Not specified'}

${formData.quoteDetails.selectedLocations?.length ? `Target Locations: ${formData.quoteDetails.selectedLocations.join(', ')}` : ''}

Additional Details:
${formData.quoteDetails.additionalDetails || 'None provided'}

Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}`;
        taskSubject = `Work on brief: ${formData.company || formData.firstName} — General Quote`;
        taskBody = quoteNotes;
        break;
    }

    // Prepare contact properties for HubSpot (only standard fields)
    const contactProperties: any = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      hs_lead_status: "NEW",
      lifecyclestage: "lead",
    };

    // Add optional fields if provided
    if (formData.phone) { contactProperties.phone = formData.phone; }
    if (formData.website) { contactProperties.website = formData.website; }
    if (formData.company) { contactProperties.company = formData.company; }
    
    // Add event revenue if totalCost is available (like GA4 tracking)
    console.log('Checking totalCost for deal creation:', formData.quoteDetails.totalCost);
    if (formData.quoteDetails.totalCost && formData.quoteDetails.totalCost > 0) {
      console.log('Adding revenue properties:', formData.quoteDetails.totalCost);
      contactProperties.total_revenue = formData.quoteDetails.totalCost;
      contactProperties.last_deal_amount = formData.quoteDetails.totalCost;
    } else {
      console.log('No totalCost available for deal creation');
    }

    // Create or update contact in HubSpot
    const hubspotResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${hubspotApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ properties: contactProperties }),
      }
    );

    if (!hubspotResponse.ok) {
      const errorText = await hubspotResponse.text();
      console.error("HubSpot API error:", errorText);
      // If contact already exists, try to update instead
      if (hubspotResponse.status === 409) {
        const searchResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/search`,
          {
            method: "POST",
            headers: { "Authorization": `Bearer ${hubspotApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: formData.email }]}]
            }),
          }
        );

        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          if (searchResult.results && searchResult.results.length > 0) {
            const contactId = searchResult.results[0].id;
            const updateResponse = await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
              {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${hubspotApiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ properties: contactProperties }),
              }
            );

            if (updateResponse.ok) {
              const result = await updateResponse.json();
              
              // Create deal if totalCost is available
              console.log('Contact updated - checking for deal creation. totalCost:', formData.quoteDetails.totalCost);
              if (formData.quoteDetails.totalCost && formData.quoteDetails.totalCost > 0) {
                console.log('Creating deal for updated contact with amount:', formData.quoteDetails.totalCost);
                
                // Prepare quote items for line items
                const quoteItems = [{
                  formatName: formData.quoteDetails.formatName,
                  selectedAreas: formData.quoteDetails.selectedLocations,
                  totalCost: formData.quoteDetails.totalCost,
                  quantity: formData.quoteDetails.itemCount || 1
                }];
                
                await createDealForContact(
                  hubspotApiKey, 
                  result.id, 
                  quoteTitle, 
                  formData.quoteDetails.totalCost,
                  "appointmentscheduled",
                  quoteNotes,
                  quoteItems
                );
              } else {
                console.log('No deal created - totalCost not available or zero');
              }
              
              // Create task for Shane
              await createTaskForContact(hubspotApiKey, result.id, taskSubject, taskBody);
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
    console.log("Quote synced to HubSpot:", result.id);
    
    // Create deal if totalCost is available
    console.log('New contact created - checking for deal creation. totalCost:', formData.quoteDetails.totalCost);
    if (formData.quoteDetails.totalCost && formData.quoteDetails.totalCost > 0) {
      console.log('Creating deal for new contact with amount:', formData.quoteDetails.totalCost);
      
      // Prepare quote items for line items
      const quoteItems = [{
        formatName: formData.quoteDetails.formatName,
        selectedAreas: formData.quoteDetails.selectedLocations,
        totalCost: formData.quoteDetails.totalCost,
        quantity: formData.quoteDetails.itemCount || 1
      }];
      
      await createDealForContact(
        hubspotApiKey, 
        result.id, 
        quoteTitle, 
        formData.quoteDetails.totalCost,
        "appointmentscheduled",
        quoteNotes,
        quoteItems
      );
    } else {
      console.log('No deal created - totalCost not available or zero');
    }
    
    // Create task for Shane
    await createTaskForContact(hubspotApiKey, result.id, taskSubject, taskBody);

    return new Response(JSON.stringify({ 
      success: true, 
      action: "created",
      contactId: result.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in quote submission:", error);
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