import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { submitDraftQuote, SubmitContact } from '@/lib/submitQuote';
import { useQuotes } from '@/hooks/useQuotes';

type Props = {
  source: 'smart-quote' | 'outdoor-media' | 'configurator';
  className?: string;
};

const inputCls =
  'w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/70';

const row = 'grid grid-cols-1 gap-3 sm:grid-cols-2';
const panel =
  'rounded-lg border border-gray-200 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm';

export const SubmitGate: React.FC<Props> = ({ source, className }) => {
  const nav = useNavigate();
  const { submitQuote: submitQuoteDb } = useQuotes();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'guest' | 'signin' | 'authed'>('guest');
  const formRef = useRef<HTMLFormElement>(null);

  const [contact, setContact] = useState<SubmitContact>(() => {
    try {
      const pre = localStorage.getItem('submitted_quote_data');
      return pre ? JSON.parse(pre) : { firstName: '', lastName: '', email: '' } as SubmitContact;
    } catch {
      return { firstName: '', lastName: '', email: '' } as SubmitContact;
    }
  });

  // Helpers
  function getCurrentQuoteSessionId() {
    try {
      return localStorage.getItem('quote_session_id');
    } catch {
      return null;
    }
  }

  function mapToDbContact(c: SubmitContact) {
    return {
      contact_name: `${c.firstName} ${c.lastName}`.trim(),
      contact_email: c.email,
      contact_phone: c.phone,
      contact_company: c.company,
      additional_requirements: c.notes,
      website: c.website,
    };
  }

  // Resolve auth mode on mount
  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setMode(data.session ? 'authed' : 'guest');
    })();
  }, []);

  async function handleAuthedSubmit() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const quoteSessionId = getCurrentQuoteSessionId();

      // Persist in DB quotes table via existing hook with minimal account details
      await submitQuoteDb({
        contact_name: `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || (user?.email || ''),
        contact_email: user?.email || '',
      });

      // Call unified server function for side-effects (pdf, hubspot, versioning)
      await submitDraftQuote({
        quoteSessionId,
        contact: {
          firstName: user?.user_metadata?.first_name || '',
          lastName: user?.user_metadata?.last_name || '',
          email: user?.email || '',
        },
        source,
      });
      nav('/client-portal');
    } catch (e) {
      console.error(e);
      alert('There was a problem submitting your quote. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.firstName || !contact.lastName || !contact.email) {
      alert('Please complete first name, last name, and email.');
      return;
    }
    setLoading(true);
    try {
      // Persist for /create-account prefill
      try { localStorage.setItem('submitted_quote_data', JSON.stringify(contact)); } catch {}
      const quoteSessionId = getCurrentQuoteSessionId();
      await submitQuoteDb(mapToDbContact(contact)); // updates quotes table with guest details
      await submitDraftQuote({ quoteSessionId, contact, source });
      nav('/quote-submitted'); // always the same for guests
    } catch (e) {
      console.error(e);
      alert('There was a problem submitting your quote. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Keep their draft session so we can link it post-login
      const sid = getCurrentQuoteSessionId();
      if (sid) localStorage.setItem('quote_session_id_pre_auth', sid);
      nav('/auth?next=/client-portal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      {/* Mobile sticky submit on small screens */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-screen-sm p-3 flex gap-2">
          {mode === 'authed' ? (
            <button
              onClick={handleAuthedSubmit}
              disabled={loading}
              className="flex-1 rounded-md bg-black text-white py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit plan'}
            </button>
          ) : (
            <>
              <button
                onClick={() => setMode('signin')}
                className="w-1/3 rounded-md border border-gray-300 py-3 text-sm"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  if (loading) return;
                  formRef.current?.requestSubmit();
                }}
                disabled={loading}
                className="flex-1 rounded-md bg-black text-white py-3 text-sm font-medium disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit plan'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop / full panel */}
      <div className={`${panel} sm:mt-0 mt-3`}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Submit your plan</h3>
          {mode !== 'authed' && (
            <button
              onClick={() => setMode(mode === 'signin' ? 'guest' : 'signin')}
              className="hidden sm:inline-flex text-sm underline"
            >
              {mode === 'signin' ? 'Use details instead' : 'Have an account? Sign in'}
            </button>
          )}
        </div>

        {mode === 'authed' ? (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-4">
              You're signed in. We'll use your account details for the submission.
            </p>
            <button
              onClick={handleAuthedSubmit}
              disabled={loading}
              className="w-full sm:w-auto rounded-md bg-black text-white px-5 py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit plan'}
            </button>
          </div>
        ) : mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="mt-4">
            <p className="text-sm text-gray-600 mb-4">
              Sign in to submit with one click.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-md border border-gray-300 px-5 py-3 text-sm font-medium disabled:opacity-60"
            >
              Continue to sign in
            </button>
          </form>
        ) : (
          <form ref={formRef} onSubmit={handleGuestSubmit} className="mt-4 space-y-4" noValidate>
            <p className="text-sm text-gray-600">
              Don't have an account? No problem. Enter your details and submit.
              You'll be able to create a password after submitting.
            </p>

            <div className={row}>
              <input
                className={inputCls}
                placeholder="First name*"
                value={contact.firstName}
                onChange={(e) => setContact(c => ({ ...c, firstName: e.target.value }))}
                required
              />
              <input
                className={inputCls}
                placeholder="Last name*"
                value={contact.lastName}
                onChange={(e) => setContact(c => ({ ...c, lastName: e.target.value }))}
                required
              />
            </div>

            <div className={row}>
              <input
                className={inputCls}
                type="email"
                placeholder="Work email*"
                value={contact.email}
                onChange={(e) => setContact(c => ({ ...c, email: e.target.value }))}
                required
              />
              <input
                className={inputCls}
                type="tel"
                placeholder="Phone (optional)"
                value={contact.phone || ''}
                onChange={(e) => setContact(c => ({ ...c, phone: e.target.value }))}
              />
            </div>

            <div className={row}>
              <input
                className={inputCls}
                placeholder="Company (optional)"
                value={contact.company || ''}
                onChange={(e) => setContact(c => ({ ...c, company: e.target.value }))}
              />
              <input
                className={inputCls}
                placeholder="Website (optional)"
                value={contact.website || ''}
                onChange={(e) => setContact(c => ({ ...c, website: e.target.value }))}
              />
            </div>

            <textarea
              className={inputCls}
              rows={3}
              placeholder="Additional requirements (optional)"
              value={contact.notes || ''}
              onChange={(e) => setContact(c => ({ ...c, notes: e.target.value }))}
            />

            <div className="hidden sm:flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="rounded-md border border-gray-300 px-5 py-3 text-sm"
              >
                Sign in
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-black text-white px-5 py-3 text-sm font-medium disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit plan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitGate;
