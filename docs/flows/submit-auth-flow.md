# Submit & Authentication Flow — Discovery Document

Last updated: {DATE}

Purpose: Map current “submit your plan” and authentication behavior across all quote flows before any changes.

---

Screens & Order (by flow)

1) Format Page flow
- /outdoor-media/:formatSlug (src/pages/FormatPage.tsx)
  - Adds a configured line item via useQuotes.addQuoteItem
  - Navigates to /quote-plan on success
- /quote-plan (src/pages/QuotePlan.tsx)
  - Plan review + per-format breakdown
  - Submission panel uses <QuoteSubmissionForm />
    - Guest: form submit -> supabase update -> /quote-submitted
    - Authenticated: single button -> supabase update -> /client-portal
- /quote-submitted (src/pages/QuoteSubmitted.tsx)
  - Post-submit confirmation + CTA to /create-account
- /create-account (src/pages/CreateAccount.tsx)
  - Account creation (prefills from localStorage if available) -> /account-created
- /account-created (src/pages/AccountCreated.tsx)
  - Email verification instructions -> Sign in to /auth -> /client-portal
- /client-portal (src/pages/ClientPortal.tsx)
  - Submitted quotes visible; auto-linking of pending/draft quotes to user

2) Smart Quote flow (Direct quote page)
- /quote (src/pages/Quote.tsx) renders <SmartQuoteForm />
  - Adds items to quote via useQuotes
  - handleSubmitQuote:
    - If user authenticated: submit -> /client-portal
    - If guest: submit -> /create-account (not /quote-submitted)

3) Configurator flow
- /configurator (src/pages/Configurator.tsx) renders <OOHConfigurator />
  - Generates plan preview via <MediaPlanModal />
  - onSubmitPlan adds items to quote (useQuotes.addQuoteItem)
  - Then Configurator shows a submission step with <QuoteSubmissionForm /> (same behavior as QuotePlan)

Primary UI Components in the flows
- QuotePlan review: src/pages/QuotePlan.tsx
- Submission form: src/components/QuoteSubmissionForm.tsx
- Smart quote: src/components/SmartQuoteForm.tsx
- Configurator: src/components/OOHConfigurator.tsx + src/components/MediaPlanModal.tsx

---

Data Sources & Persistence

- useQuotes (src/hooks/useQuotes.tsx)
  - Tables: quotes, quote_items in Supabase
  - Core ops:
    - createOrGetQuote(): ensures a draft quote exists for current session
    - addQuoteItem(): inserts into quote_items, recalculates totals via calculateVAT, updates quotes
    - updateQuoteTotalCost(): recalculates discounts (via discount_tiers table) and VAT, updates items and quote
    - fetchCurrentQuote(): loads latest draft for user or session
    - submitQuote(contactDetails): updates quotes.status to 'submitted', persists submission footprints
  - Local/session storage keys:
    - 'quote_session_id' (active draft session id)
    - 'quote_session_id_submitted' (last-submitted session id)
    - 'submitted_quote_data' (guest form details for CreateAccount prefill)
    - 'submitted_quote_details' (summary for CreateAccount)
    - 'quote_session_id_pre_auth' (pre-login session id for linking)
    - 'pending_quote_link' (link session-to-user after signup)

- usePlanDraft (src/state/plan.ts)
  - Client-only draft builder (not persisted to DB)
  - sessionStorage key: 'mbl.quote.plan.v1'
  - Used by QuickSummary and MiniConfigurator; separate from Supabase-backed quotes

- usePlanStore (src/state/planStore.ts)
  - Legacy/alt store for planned items
  - sessionStorage via Zustand persist key: 'mbl-plan-v1'

Analytics & Tracking
- src/utils/analytics.ts
  - trackQuoteItemAdded (add_to_cart)
  - trackQuoteSubmission (generate_lead / conversion)
  - Campaign params first_touch_utm stored in localStorage

---

Form Fields & Validation

- QuoteSubmissionForm (src/components/QuoteSubmissionForm.tsx)
  - Guest fields (HTML required):
    - first_name*, last_name*, contact_email*
    - Optional: contact_phone, company_name, website, additional_requirements
  - Authenticated path: no form; “Submit Plan” button uses user metadata (name/email)
  - Basic checks only (presence); no GDPR checkbox present

- CreateAccount (src/pages/CreateAccount.tsx)
  - Prefills from 'submitted_quote_data' if present
  - Required: email, password (min 6), confirmPassword, firstName, lastName
  - Optional: company
  - Redirect: emailRedirectTo -> /client-portal; then /account-created screen prior to verification

- Auth (src/pages/Auth.tsx)
  - Email/password sign in and sign up
  - Phone OTP flow supported (E.164 normalization + verifyOTP)
  - Redirect logic: role-aware (/cms for admins on allowed domains; otherwise /client-portal)

---

Auth Branching & Existing User Handling

- QuotePlan & Configurator submission:
  - If supabase.auth.getSession() truthy → single-click submit; navigate to /client-portal
  - Else → guest form; on success navigate to /quote-submitted
- SmartQuoteForm:
  - If authenticated → submit → /client-portal
  - Else → submit → /create-account (different from QuoteSubmissionForm’s /quote-submitted)
- Existing users can sign in from submission panels (/auth). No pre-submit email lookup.
- ClientPortal links any draft/unlinked quotes to the signed-in user and marks them submitted.

---

APIs/Functions Called

- Supabase DB
  - quotes: status transitions (draft → submitted), contact fields stored
  - quote_items: per-item costs, discounts, VAT
  - discount_tiers: fetched to compute period-based discounts per format group
- Edge Function: supabase.functions.invoke('sync-hubspot-contact')
  - Payloads defined in src/utils/hubspotSync.ts
  - Handles both contact and quote submissions; writes/updates HubSpot contact with properties and notes

---

Known Issues / Observations

- Inconsistent post-submit route:
  - QuoteSubmissionForm (guest): /quote-submitted
  - SmartQuoteForm (guest): /create-account
- Two parallel plan stores:
  - Supabase-backed draft quotes vs usePlanDraft/usePlanStore in sessionStorage (QuickSummary, MiniConfigurator)
  - Risk of UI showing draft-store data while submission uses Supabase quote data
- Session key lifecycle:
  - 'quote_session_id' cleared on submit; other keys may linger ('submitted_quote_*', 'pending_quote_link')
- Discount logic depends on discount_tiers table; ensure data present to avoid 0% fallback

---

Gaps vs Desired Flow

- Desired: always capture details, optional sign-in before submit, post-submit account upsell with create password
- Current:
  - Details captured for guests via QuoteSubmissionForm; SmartQuoteForm also captures contact details inline
  - Optional sign-in is available in both QuotePlan and SmartQuoteForm panels
  - Post-submit upsell exists: /quote-submitted → CTA to /create-account, and SmartQuoteForm goes directly to /create-account
  - Gap: post-submit path consistency varies by flow (guest to /quote-submitted vs /create-account)
  - Gap: Draft stores vs Supabase quotes can drift (QuickSummary vs PlanBreakdown)

---

Navigation Entry Points (CTAs)

- Global:
  - CTA.tsx, Hero.tsx → /quote or /configurator
  - Navigation “Your Plan” → /quote-plan when quote_items exist
- FormatPage:
  - “Build Plan” (handleBuildPlan) → addQuoteItem → /quote-plan
- Configurator:
  - “Quick Quote” & MediaPlanModal → addQuoteItem → internal submission step

---

Appendix — Storage Keys & Where Used

- localStorage
  - 'quote_session_id' (useQuotes session id for draft quotes)
  - 'quote_session_id_submitted' (last submit; used by QuoteSubmitted → CreateAccount CTA)
  - 'submitted_quote_data' (guest form data → CreateAccount prefill)
  - 'submitted_quote_details' (quote summary → CreateAccount)
  - 'quote_session_id_pre_auth' (pre-login link helper)
  - 'pending_quote_link' (flag checked by ClientPortal after signup)
  - 'first_touch_utm' (campaign params)
- sessionStorage
  - 'mbl.quote.plan.v1' (usePlanDraft)
  - 'mbl-plan-v1' (usePlanStore)

---

One-Screen Summary

- Routes: /quote, /quote-plan, /quote-submitted, /create-account, /account-created, /auth, /client-portal, /configurator, /outdoor-media/:formatSlug
- Stores: useQuotes (Supabase-backed), usePlanDraft (session), usePlanStore (session)
- Keys: quote_session_id, quote_session_id_submitted, submitted_quote_data, submitted_quote_details, quote_session_id_pre_auth, pending_quote_link, first_touch_utm, mbl.quote.plan.v1, mbl-plan-v1

