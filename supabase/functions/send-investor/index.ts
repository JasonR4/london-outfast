import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvestorLead {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ticket: string;
  investor_type: string[];
  has_capital: boolean;
  accepts_nda: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: InvestorLead = await req.json();
    const { first_name, last_name, email, phone, ticket, investor_type = [], has_capital, accepts_nda } = body || {};

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !ticket || !has_capital || !accepts_nda) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Processing investor lead for:', email);

    // 1) HubSpot integration (optional - guarded by env var)
    try {
      const hubspotKey = Deno.env.get('HUBSPOT_PRIVATE_APP_TOKEN');
      if (hubspotKey) {
        console.log('Syncing to HubSpot...');
        const hsHeaders = {
          'Authorization': `Bearer ${hubspotKey}`,
          'Content-Type': 'application/json'
        };

        // Upsert contact
        const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: hsHeaders,
          body: JSON.stringify({
            properties: {
              email,
              firstname: first_name,
              lastname: last_name,
              phone,
              lifecyclestage: 'opportunity',
              mbl_investor: 'true',
              investor_ticket_size: ticket,
              investor_types: investor_type.join(', '),
              notes: 'Investor opportunity - submitted via corporate investment page'
            }
          })
        });

        if (contactResponse.ok) {
          console.log('Contact created/updated in HubSpot');
        }

        // Create deal
        const dealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
          method: 'POST',
          headers: hsHeaders,
          body: JSON.stringify({
            properties: {
              dealname: `Investor – ${first_name} ${last_name}`,
              amount: ticket,
              dealstage: 'appointmentscheduled',
              pipeline: 'default',
              notes: 'Investor opportunity - submitted via corporate investment page'
            }
          })
        });

        if (dealResponse.ok) {
          console.log('Deal created in HubSpot');
        }
      } else {
        console.log('HubSpot token not provided, skipping sync');
      }
    } catch (hubspotError) {
      console.error('HubSpot sync error (non-blocking):', hubspotError);
    }

    // 2) Email notifications using Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const from = Deno.env.get('INVESTOR_FROM') || 'Media Buying London <invest@mediabuyinglondon.co.uk>';
    const team = (Deno.env.get('INVESTOR_TEAM') || 'invest@mediabuyinglondon.co.uk').split(',').map(email => email.trim());

    // Email to investor
    const investorEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your investment interest, ${first_name}!</h2>
        <p>We have received your investor declaration for Media Buying London.</p>
        <p>Our team will review your information and contact you within 24 hours to discuss next steps.</p>
        <p>As requested, please find our NDA attached. Please review and return it signed at your earliest convenience.</p>
        <p>Best regards,<br>
        The Media Buying London Investment Team</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This email was sent because you submitted an investor declaration at mediabuyinglondon.co.uk/corporate-investment
        </p>
      </div>
    `;

    // Email to internal team
    const internalEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎯 New Investor Declaration Received</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${first_name} ${last_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Investment Amount</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${ticket}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Investor Type</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${investor_type.join(', ')}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Has Capital Ready</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${has_capital ? 'Yes' : 'No'}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Accepts NDA</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${accepts_nda ? 'Yes' : 'No'}</td>
          </tr>
        </table>
        <p><strong>Action Required:</strong> Contact investor within 24 hours to schedule follow-up call.</p>
      </div>
    `;

    // Send emails using Resend
    const resendHeaders = {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    };

    // Send investor confirmation email
    const investorEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: resendHeaders,
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'MBL • Investment Declaration Received',
        html: investorEmailHtml
      })
    });

    if (!investorEmailResponse.ok) {
      const investorEmailError = await investorEmailResponse.text();
      console.error('Failed to send investor email:', investorEmailError);
    } else {
      console.log('Investor confirmation email sent successfully');
    }

    // Send internal notification email
    const internalEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: resendHeaders,
      body: JSON.stringify({
        from,
        to: team,
        subject: 'MBL • New Investor Declaration',
        html: internalEmailHtml
      })
    });

    if (!internalEmailResponse.ok) {
      const internalEmailError = await internalEmailResponse.text();
      console.error('Failed to send internal notification:', internalEmailError);
    } else {
      console.log('Internal notification email sent successfully');
    }

    console.log('Investor lead processed successfully');

    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error processing investor lead:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);