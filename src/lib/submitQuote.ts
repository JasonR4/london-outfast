import { supabase } from '@/integrations/supabase/client';

export type SubmitContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  notes?: string; // additional requirements
};

export type SubmitPayload = {
  // quote/session IDs come from useQuotes or server
  quoteSessionId?: string | null;
  contact: SubmitContact;
  source: 'smart-quote' | 'outdoor-media' | 'configurator';
};

export async function submitDraftQuote(payload: SubmitPayload) {
  // Persist for Create Account prefill (guest path)
  try {
    localStorage.setItem('submitted_quote_data', JSON.stringify(payload.contact));
    if (payload.quoteSessionId) {
      localStorage.setItem('quote_session_id_submitted', payload.quoteSessionId);
    }
  } catch {}

  // One RPC/Edge Function for everything (idempotent server-side)
  // Server will: lock draft, compute versions, sync HubSpot, snapshot PDF, return redirect hints
  const { data, error } = await supabase.functions.invoke('submit-quote', {
    body: payload,
  });

  if (error) throw error;
  return data || {};
}
