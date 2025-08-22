// Google Analytics conversion tracking utilities

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Capture and persist campaign parameters (UTM, gclid/fbclid)
export const getCampaignParams = (): Record<string, string | null> => {
  try {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    const current = {
      source: params.get('utm_source') || params.get('source'),
      medium: params.get('utm_medium') || params.get('medium'),
      campaign: params.get('utm_campaign') || params.get('campaign'),
      term: params.get('utm_term'),
      content: params.get('utm_content'),
      gclid: params.get('gclid'),
      fbclid: params.get('fbclid'),
    };

    // Store first-touch attribution once
    const stored = typeof localStorage !== 'undefined'
      ? localStorage.getItem('first_touch_utm')
      : null;

    if (!stored && (current.source || current.medium || current.campaign || current.gclid || current.fbclid)) {
      localStorage.setItem('first_touch_utm', JSON.stringify(current));
    }

    const firstTouch = stored ? JSON.parse(stored) : null;
    return firstTouch || current || {};
  } catch {
    return {};
  }
};

// Initialize campaign tracking on app load (safe no-op if already stored)
export const initCampaignTracking = () => {
  try { getCampaignParams(); } catch {}
};

// Track quote submission as a lead conversion
export const trackQuoteSubmission = (quoteData: {
  quoteId: string;
  totalValue: number;
  itemCount: number;
  contactEmail?: string;
  contactCompany?: string;
}) => {
  try {
    // Google Analytics 4 conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      const campaign = getCampaignParams();
      window.gtag('event', 'generate_lead', {
        value: quoteData.totalValue,
        currency: 'GBP',
        quote_id: quoteData.quoteId,
        item_count: quoteData.itemCount,
        contact_email: quoteData.contactEmail || 'unknown',
        contact_company: quoteData.contactCompany || 'unknown',
        ...campaign
      });

      // Also track as a conversion with proper revenue
      window.gtag('event', 'conversion', {
        value: quoteData.totalValue,
        currency: 'GBP',
        transaction_id: quoteData.quoteId
      });

      // Track as purchase for ecommerce revenue tracking (GA4 Enhanced Ecommerce)
      window.gtag('event', 'purchase', {
        transaction_id: quoteData.quoteId,
        value: quoteData.totalValue,
        currency: 'GBP',
        coupon: '',
        shipping: 0,
        tax: quoteData.totalValue * 0.2, // 20% VAT
        items: [{
          item_id: 'quote_submission',
          item_name: 'OOH Quote Submission',
          category: 'Quote',
          quantity: quoteData.itemCount || 1,
          price: quoteData.totalValue / (quoteData.itemCount || 1)
        }]
      });

      // Also send as a custom conversion for Google Ads 
      window.gtag('event', 'conversion', {
        send_to: 'G-FNYQ5VFL2F/quote_submission',
        value: quoteData.totalValue,
        currency: 'GBP',
        transaction_id: quoteData.quoteId
      });

      console.log('📊 Analytics: Quote submission tracked as lead', quoteData);
    }

    // Facebook Pixel tracking (if needed)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        value: quoteData.totalValue,
        currency: 'GBP',
        content_ids: [quoteData.quoteId],
        content_type: 'quote_request'
      });
      console.log('📊 Facebook Pixel: Lead tracked');
    }

  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

// Lightweight analytics helpers (GA4 + Pixel; dataLayer fallback)
type Dict = Record<string, any>;
export type PlanMeta = {
  plan_value?: number;      // numeric budget or quote total (ex VAT)
  formats_count?: number;
  sites_selected?: number;
  periods_count?: number;
  location?: string;
  format_slug?: string;
};

const CURRENCY = 'GBP';
const g = () => (typeof window !== 'undefined' ? (window as any) : {});

const pushDL = (event: string, params?: Dict) => {
  try {
    g().dataLayer = g().dataLayer || [];
    g().dataLayer.push({ event, ...params });
  } catch {}
};

const log = (name: string, params?: Dict) => {
  try {
    if ((g().MBL_DEBUG_EVENTS as boolean)) {
      console.log(`📈 [MBL] ${name}`, params || {});
    }
  } catch {}
};

const ga = (name: string, params?: Dict) => {
  try { g().gtag?.('event', name, { debug_mode: true, ...params }); } catch {}
  pushDL(name, params);
  log(name, params);
};

const pixel = (name: string, params?: Dict) => {
  try { g().fbq?.('track', name, params); } catch {}
  log(`fbq:${name}`, params);
};

// Shadow purchase sender to populate GA4 revenue consistently
const sendPurchase = (transactionId: string, value: number, extra: Record<string, any> = {}) => {
  try {
    g().gtag?.('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency: CURRENCY,
      items: [{ item_id: 'lead_submit', item_name: 'Lead Submission', quantity: 1 }],
      debug_mode: true,
      ...extra,
    });
  } catch {}
};

export const trackSummaryViewed = (meta: PlanMeta = {}) => {
  ga('summary_viewed', meta);
};

export const trackAccountCtaClicked = (meta: PlanMeta = {}) => {
  ga('account_cta_clicked', meta);
};

export const trackBriefCtaClicked = (meta: PlanMeta = {}) => {
  ga('brief_cta_clicked', meta);
};

export const trackAccountCreated = (meta: PlanMeta = {}) => {
  ga('account_created', meta);
  pixel('CompleteRegistration');
};

// UPDATED: plan submit uses real numeric value and sends purchase
export const trackPlanSubmitted = (planId: string, meta: PlanMeta = {}) => {
  const value = Number(meta.plan_value) || 0;
  const payload = { ...meta, value, currency: CURRENCY };
  ga('plan_submitted', payload);
  pixel('Lead', { value, currency: CURRENCY });
  sendPurchase(`plan_${planId}`, value, { format_slug: meta.format_slug });
};

// UPDATED: brief form submit uses real numeric value and sends purchase
export const trackBriefFormSubmitted = (meta: PlanMeta = {}) => {
  const value = Number(meta.plan_value) || 0;
  const payload = { ...meta, value, currency: CURRENCY };
  ga('brief_form_submitted', payload);
  pixel('Lead', { value, currency: CURRENCY });
  sendPurchase(`brief_${Date.now()}`, value, { format_slug: meta.format_slug });
};

// Track other key actions
export const trackQuoteItemAdded = (itemData: {
  formatName: string;
  quantity: number;
  value: number;
}) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        event_category: 'Quote Building',
        event_label: itemData.formatName,
        value: itemData.value,
        currency: 'GBP',
        custom_parameters: {
          format_name: itemData.formatName,
          quantity: itemData.quantity
        }
      });
      console.log('📊 Analytics: Quote item added', itemData);
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

export const trackQuoteStarted = () => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        event_category: 'Quote Building',
        event_label: 'Quote Started'
      });
      console.log('📊 Analytics: Quote started');
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      const campaign = getCampaignParams();
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
        ...campaign
      });
      console.log('📊 Analytics: Page view tracked', { pagePath, pageTitle });
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

// Track telephone link clicks to GA4
export const trackTelClick = (phone: string, placement?: string) => {
  try {
    const w = window as any;

    w.gtag?.('event', 'tel_click', {
      event_category: 'engagement',
      event_label: phone,
      value: 1,
      phone_number: phone,
      placement: placement || 'unknown',
      page_location: window.location.href,
    });

    // Debug (optional)
    if (w.MBL_DEBUG_EVENTS) {
      console.log("📞 tel_click sent to GA4:", { phone, placement });
    }
  } catch (err) {
    console.error("❌ tel_click tracking error", err);
  }
};

// --- Track deals page events ---
export const trackDealsPageView = (weekId: string) => {
  try {
    const w = window as any;
    w.gtag?.('event', 'deals_page_view', {
      event_category: 'deals',
      week_id: weekId,
      page_location: window.location.href,
    });
  } catch (err) {
    console.error("❌ deals_page_view tracking error", err);
  }
};

export const trackDealImpression = (dealSlug: string, dealRate: number, savingPct: number) => {
  try {
    const w = window as any;
    w.gtag?.('event', 'deal_impression', {
      event_category: 'deals',
      deal_slug: dealSlug,
      deal_rate: dealRate,
      saving_pct: savingPct,
    });
  } catch (err) {
    console.error("❌ deal_impression tracking error", err);
  }
};

export const trackDealCTAClick = (action: 'lock' | 'brief', dealSlug: string, dealRate: number, savingPct: number) => {
  try {
    const w = window as any;
    w.gtag?.('event', `deal_cta_${action}_clicked`, {
      event_category: 'deals',
      deal_slug: dealSlug,
      deal_rate: dealRate,
      saving_pct: savingPct,
    });
  } catch (err) {
    console.error(`❌ deal_cta_${action}_clicked tracking error`, err);
  }
};

export const trackDealLocked = (dealSlug: string, dealRate: number) => {
  try {
    const w = window as any;
    w.gtag?.('event', 'deal_locked', {
      event_category: 'deals',
      deal_slug: dealSlug,
      value: dealRate,
    });
    
    // Also send as purchase event
    w.gtag?.('event', 'purchase', {
      transaction_id: `deal_${dealSlug}_${Date.now()}`,
      value: dealRate,
      currency: 'GBP',
      items: [{
        item_id: dealSlug,
        item_name: `Deal: ${dealSlug}`,
        category: 'deals',
        quantity: 1,
        price: dealRate
      }]
    });
  } catch (err) {
    console.error("❌ deal_locked tracking error", err);
  }
};

// Generic track function for custom events
export const track = (eventName: string, parameters: Record<string, any> = {}) => {
  try {
    const w = window as any;
    w.gtag?.('event', eventName, {
      ...parameters,
      page_location: window.location.href,
    });
    
    // Debug logging
    if (w.MBL_DEBUG_EVENTS) {
      console.log(`📊 [Analytics] ${eventName}`, parameters);
    }
  } catch (err) {
    console.error(`❌ ${eventName} tracking error`, err);
  }
};