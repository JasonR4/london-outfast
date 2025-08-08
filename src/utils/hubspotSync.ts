import { supabase } from "@/integrations/supabase/client";

export interface HubSpotQuoteData {
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

export const syncQuoteToHubSpot = async (
  submissionType: 'format_quote' | 'configurator_quote' | 'general_quote',
  contactData: {
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    contact_company?: string;
    website?: string;
    additional_requirements?: string;
  },
  quoteData?: {
    total_cost?: number;
    total_inc_vat?: number;
    quote_items?: Array<{
      format_name: string;
      selected_areas?: string[];
      quantity?: number;
    }>;
  }
): Promise<boolean> => {
  try {
    const nameParts = contactData.contact_name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const hubspotData: HubSpotQuoteData = {
      firstName,
      lastName,
      email: contactData.contact_email,
      phone: contactData.contact_phone,
      website: contactData.website,
      company: contactData.contact_company,
      submissionType,
      quoteDetails: {
        additionalDetails: contactData.additional_requirements,
        totalCost: quoteData?.total_inc_vat || quoteData?.total_cost,
        itemCount: quoteData?.quote_items?.length || 0,
        formatName: quoteData?.quote_items?.[0]?.format_name,
        selectedLocations: quoteData?.quote_items?.[0]?.selected_areas || [],
      }
    };

    console.log('Syncing to HubSpot:', hubspotData);

    const response = await supabase.functions.invoke('sync-hubspot-contact', {
      body: hubspotData
    });

    if (response.error) {
      console.error('Error syncing to HubSpot:', response.error);
      return false;
    } else {
      console.log('Successfully synced quote to HubSpot:', response.data);
      return true;
    }
  } catch (error) {
    console.error('Error syncing to HubSpot:', error);
    return false;
  }
};

export const manualHubSpotSync = async (quoteId: string): Promise<boolean> => {
  try {
    // Fetch quote and items from database
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_items (*)
      `)
      .eq('id', quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      console.error('Error fetching quote:', quoteError);
      return false;
    }

    const contactData = {
      contact_name: quote.contact_name || 'Unknown',
      contact_email: quote.contact_email || '',
      contact_phone: quote.contact_phone,
      contact_company: quote.contact_company,
      website: quote.website,
      additional_requirements: quote.additional_requirements
    };

    return await syncQuoteToHubSpot('format_quote', contactData, quote);
  } catch (error) {
    console.error('Error in manual HubSpot sync:', error);
    return false;
  }
};