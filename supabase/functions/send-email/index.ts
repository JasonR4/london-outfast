// supabase/functions/send-email/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { serve } from 'jsr:@supabase/functions-js/edge'
import { Resend } from 'npm:resend@3.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type EmailRequest = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  cc?: string[]
  bcc?: string[]
  reply_to?: string
  // optional brand tokens (fallback to env if omitted)
  brand_name?: string
  brand_from?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const body = (await req.json()) as EmailRequest
    if (!body?.to || !body?.subject || (!body.html && !body.text)) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: to, subject, and html or text'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const brandName = body.brand_name || Deno.env.get('BRAND_NAME') || 'Media Buying London'
    const brandFrom = body.from || body.brand_from || Deno.env.get('BRAND_FROM')
      || `Media Buying London <quotes@mediabuyinglondon.co.uk>`

    const resend = new Resend(RESEND_API_KEY)

    const result = await resend.emails.send({
      from: brandFrom,
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject: body.subject,
      html: body.html,
      text: body.text,
      cc: body.cc,
      bcc: body.bcc,
      reply_to: body.reply_to,
      headers: {
        'X-Brand': brandName
      }
    } as any)

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    console.error('send-email error:', err)
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})