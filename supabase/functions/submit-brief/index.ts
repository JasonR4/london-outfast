// supabase/functions/submit-brief/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// HubSpot
const HUBSPOT_TOKEN = Deno.env.get('HUBSPOT_ACCESS_TOKEN')
const HS_BASE = 'https://api.hubapi.com'

// Supabase (service role used for DB inserts and invoking other functions)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase URL or Service Role Key in function env')
}

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false }
})

// Types
interface BriefPayload {
  firstname: string
  lastname: string
  email: string
  phone: string
  company: string
  website?: string
  jobtitle?: string
  budget_band: string
  objective: string
  target_areas?: string[]
  formats?: string[]
  start_month?: string | null // expect YYYY-MM or YYYY-MM-DD
  creative_status: string
  notes?: string
  source_path?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  mbl?: boolean
  hp?: string // honeypot
}

function required(v?: string) { return !!v && String(v).trim().length > 0 }
function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function normaliseMonthDate(v?: string | null): string | null {
  if (!v) return null
  // Accept YYYY-MM or YYYY-MM-DD, convert to YYYY-MM-01 for DB date
  if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01`
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return null
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]+/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string))
}

function formatBriefHtml(b: BriefPayload) {
  const rows = [
    ['Name', `${escapeHtml(b.firstname)} ${escapeHtml(b.lastname)}`],
    ['Company', escapeHtml(b.company)],
    ['Email', escapeHtml(b.email)],
    ['Phone', escapeHtml(b.phone)],
    ['Website', escapeHtml(b.website || '-')],
    ['Role/Title', escapeHtml(b.jobtitle || '-')],
    ['Budget band', escapeHtml(b.budget_band)],
    ['Objective', escapeHtml(b.objective)],
    ['Target areas', escapeHtml((b.target_areas || []).join(', ') || '-')],
    ['Preferred formats', escapeHtml((b.formats || []).join(', ') || '-')],
    ['Start month', escapeHtml(normaliseMonthDate(b.start_month) || '-')],
    ['Creative status', escapeHtml(b.creative_status)],
    ['Notes', escapeHtml(b.notes || '-')],
    ['Source path', escapeHtml(b.source_path || '-')],
    ['UTM', escapeHtml([
      b.utm_source && `utm_source=${b.utm_source}`,
      b.utm_medium && `utm_medium=${b.utm_medium}`,
      b.utm_campaign && `utm_campaign=${b.utm_campaign}`,
      b.utm_term && `utm_term=${b.utm_term}`,
      b.utm_content && `utm_content=${b.utm_content}`,
    ].filter(Boolean).join('&') || '-')],
  ]
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111">
      <h2 style="margin:0 0 12px;font-size:18px">New Brief Submission</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows.map(([k,v]) => `
          <tr>
            <td style="border:1px solid #eee;padding:8px;font-weight:600;white-space:nowrap">${k}</td>
            <td style="border:1px solid #eee;padding:8px">${v}</td>
          </tr>`).join('')}
      </table>
    </div>
  `
}

async function upsertHubSpotContact(payload: BriefPayload): Promise<string | null> {
  if (!HUBSPOT_TOKEN) return null
  const headers = {
    'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
  }
  // Search by email
  const searchRes = await fetch(`${HS_BASE}/crm/v3/objects/contacts/search`, {
    method: 'POST', headers, body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: payload.email }]}],
      properties: ['email']
    })
  })
  const searchJson: any = await searchRes.json()
  const properties: Record<string, string> = {
    email: payload.email,
    firstname: payload.firstname,
    lastname: payload.lastname,
    phone: payload.phone,
    company: payload.company,
    website: payload.website || '',
    jobtitle: payload.jobtitle || '',
    mbl: 'true',
    budget_band: payload.budget_band,
    objective: payload.objective,
  }

  let contactId: string | null = null
  if (Array.isArray(searchJson?.results) && searchJson.results.length > 0) {
    contactId = searchJson.results[0].id
    // Update
    await fetch(`${HS_BASE}/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH', headers, body: JSON.stringify({ properties })
    })
  } else {
    const createRes = await fetch(`${HS_BASE}/crm/v3/objects/contacts`, {
      method: 'POST', headers, body: JSON.stringify({ properties })
    })
    const createJson: any = await createRes.json()
    contactId = createJson?.id || null
  }
  return contactId
}

async function attachHubSpotNote(contactId: string, payload: BriefPayload) {
  if (!HUBSPOT_TOKEN || !contactId) return
  const headers = { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' }
  const noteRes = await fetch(`${HS_BASE}/crm/v3/objects/notes`, {
    method: 'POST', headers, body: JSON.stringify({ properties: {
      hs_note_body: formatBriefHtml(payload),
      hs_timestamp: new Date().toISOString(),
    }})
  })
  const noteJson: any = await noteRes.json()
  const noteId = noteJson?.id
  if (!noteId) return
  await fetch(`${HS_BASE}/crm/v4/objects/notes/${noteId}/associations/contacts/${contactId}`, {
    method: 'PUT', headers, body: JSON.stringify([{ associationType: 'note_to_contact' }])
  })
}

async function getOwnerIdByEmail(email: string): Promise<string | null> {
  if (!HUBSPOT_TOKEN) return null
  try {
    const resp = await fetch(`${HS_BASE}/crm/v3/owners/?email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}` }
    })
    if (!resp.ok) return null
    const json: any = await resp.json()
    const owner = Array.isArray(json?.results)
      ? json.results.find((o: any) => (o?.email || '').toLowerCase() === email.toLowerCase())
      : null
    return owner?.id ? String(owner.id) : null
  } catch (_) { return null }
}

async function createHubSpotTask(contactId: string, payload: BriefPayload) {
  if (!HUBSPOT_TOKEN) return
  try {
    const ownerEmail = 'matt@r4advertising.agency'
    const ownerId = await getOwnerIdByEmail(ownerEmail)
    const due = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    const subject = `Work on brief: ${payload.company} — ${payload.budget_band}`
    const body = `Objective: ${payload.objective}
Formats: ${(payload.formats || []).join(', ') || '-'}
Areas: ${(payload.target_areas || []).join(', ') || '-'}
Start: ${payload.start_month || '-'} | Creative: ${payload.creative_status}
Notes: ${payload.notes || '-'}`
    const createResp = await fetch(`${HS_BASE}/crm/v3/objects/tasks`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties: {
        hs_task_subject: subject,
        hs_task_body: body,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: 'HIGH',
        hs_timestamp: due,
        ...(ownerId ? { hubspot_owner_id: ownerId } : {}),
      }})
    })
    if (!createResp.ok) {
      console.error('Task create failed:', await createResp.text())
      return
    }
    const created: any = await createResp.json()
    const taskId = created?.id
    if (!taskId) return
    await fetch(`${HS_BASE}/crm/v4/objects/tasks/${taskId}/associations/contacts/${contactId}`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ associationType: 'task_to_contact' }])
    })
  } catch (e) { console.error('Error creating task:', e) }
}

async function sendInternalEmail(payload: BriefPayload) {
  const INTERNAL_EMAILS = (Deno.env.get('INTERNAL_EMAILS') || 'matt@r4advertising.agency,shane@r4advertising.agency')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const subject = `New Brief (MBL) — ${payload.company} — ${payload.budget_band}`
  const html = formatBriefHtml(payload)
  await supabase.functions.invoke('send-email', {
    body: {
      to: INTERNAL_EMAILS,
      subject,
      html,
      brand_name: 'Media Buying London',
      brand_from: 'Media Buying London <quotes@mediabuyinglondon.co.uk>'
    }
  })
}

async function sendClientConfirmation(payload: BriefPayload) {
  const subject = `We’ve received your brief — we’ll call you today`
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 12px">Thanks ${escapeHtml(payload.firstname)}, we’ve got your brief.</h2>
      <p>One of our specialists will call you shortly on <strong>${escapeHtml(payload.phone)}</strong>. If it’s urgent, call us now on <a href="tel:+442045243019">020 4524 3019</a>.</p>
      <p style="margin-top:16px">— Media Buying London</p>
    </div>
  `
  await supabase.functions.invoke('send-email', {
    body: {
      to: payload.email,
      subject,
      html,
      brand_name: 'Media Buying London',
      brand_from: 'Media Buying London <quotes@mediabuyinglondon.co.uk>'
    }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const body = await req.json() as BriefPayload

    // Honeypot
    if (body.hp && body.hp.trim() !== '') {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Validate
    const missing: string[] = []
    if (!required(body.firstname)) missing.push('firstname')
    if (!required(body.lastname)) missing.push('lastname')
    if (!required(body.email) || !isEmail(body.email)) missing.push('email')
    if (!required(body.phone)) missing.push('phone')
    if (!required(body.company)) missing.push('company')
    if (!required(body.budget_band)) missing.push('budget_band')
    if (!required(body.objective)) missing.push('objective')
    if (!required(body.creative_status)) missing.push('creative_status')

    if (missing.length) {
      return new Response(JSON.stringify({ ok: false, error: `Missing or invalid: ${missing.join(', ')}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const startMonth = normaliseMonthDate(body.start_month)

    // Insert into DB
    const { error: insertError } = await supabase
      .from('brief_requests')
      .insert({
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        phone: body.phone,
        company: body.company,
        website: body.website || null,
        jobtitle: body.jobtitle || null,
        budget_band: body.budget_band,
        objective: body.objective,
        target_areas: body.target_areas || [],
        formats: body.formats || [],
        start_month: startMonth,
        creative_status: body.creative_status,
        notes: body.notes || null,
        source_path: body.source_path || null,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_term: body.utm_term || null,
        utm_content: body.utm_content || null,
        mbl: true,
      })

    if (insertError) {
      console.error('DB insert error', insertError)
      return new Response(JSON.stringify({ ok: false, error: insertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Kick off background processing (HubSpot sync + emails) without blocking the response
    EdgeRuntime.waitUntil((async () => {
      // HubSpot: use central sync function first, fallback to direct API (best-effort)
      try {
        const syncPayload = {
          submissionType: 'general_quote',
          firstName: body.firstname,
          lastName: body.lastname,
          email: body.email,
          phone: body.phone,
          website: body.website || '',
          company: body.company || '',
          quoteDetails: {
            selectedFormats: body.formats || [],
            selectedLocations: body.target_areas || [],
            budgetRange: body.budget_band,
            campaignObjective: body.objective,
            timeline: body.start_month || '',
            additionalDetails: `Creative: ${body.creative_status}${body.notes ? `\nNotes: ${body.notes}` : ''}`,
          },
        }
        const syncRes = await supabase.functions.invoke('sync-hubspot-contact', { body: syncPayload })
        if (!(syncRes.data as any)?.success) {
          console.warn('sync-hubspot-contact returned non-success, falling back', syncRes.data)
          const contactId = await upsertHubSpotContact(body)
          if (contactId) { await attachHubSpotNote(contactId, body); await createHubSpotTask(contactId, body); }
        } else {
          const cid = (syncRes.data as any)?.contactId as string | undefined
          if (cid) { try { await createHubSpotTask(cid, body) } catch (e) { console.error('create task after sync failed', e) } }
        }
      } catch (e) {
        console.error('HubSpot sync via function failed, falling back to direct', e)
        try {
          const contactId = await upsertHubSpotContact(body)
          if (contactId) { await attachHubSpotNote(contactId, body); await createHubSpotTask(contactId, body); }
        } catch (inner) {
          console.error('HubSpot direct fallback failed', inner)
        }
      }

      // Emails (best-effort)
      try { await sendInternalEmail(body) } catch (e) { console.error('Internal email error', e) }
      try { await sendClientConfirmation(body) } catch (e) { console.error('Client email error', e) }
    })());

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    console.error('submit-brief error:', err)
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
