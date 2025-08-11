import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string; // e.g. "R4 Advertising <no-reply@r4advertising.agency>"
  cc?: string[];
  bcc?: string[];
  reply_to?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();

    if (!body?.to || !body?.subject || (!body.html && !body.text)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, and html or text" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const fromAddress = body.from || "R4 Advertising <no-reply@r4advertising.agency>";

    const sendResult = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject: body.subject,
      html: body.html,
      text: body.text,
      cc: body.cc,
      bcc: body.bcc,
      reply_to: body.reply_to,
    } as any);

    return new Response(JSON.stringify({ ok: true, result: sendResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
