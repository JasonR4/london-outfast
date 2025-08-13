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

      // Also track as a conversion (for Google Ads if configured)
      window.gtag('event', 'conversion', {
        send_to: 'GA_MEASUREMENT_ID/quote_submission', // You'll need to replace with your actual Google Analytics ID
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

// NEW: Quote gating analytics events
export const trackRateGateViewed = (page: string, format?: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'rate_gate_viewed', {
        event_category: 'gating',
        event_label: page,
        custom_parameters: {
          format: format || 'unknown'
        }
      });
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

export const trackRateGateCTAClicked = (source: 'costs_card' | 'add_to_plan' | 'summary_guard', page?: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'rate_gate_cta_clicked', {
        event_category: 'gating',
        event_label: source,
        custom_parameters: {
          page: page || window.location.pathname
        }
      });
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

export const trackAccountCreatedFromGate = (planDraft?: any) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'account_created_from_gate', {
        event_category: 'conversion',
        event_label: 'gated_signup',
        custom_parameters: {
          had_plan_draft: !!planDraft,
          formats_count: planDraft?.formats?.length || 0,
          sites_selected: planDraft?.sitesSelected || 0
        }
      });
    }
    
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'CompleteRegistration');
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

export const trackPriceRevealed = (page: string, format?: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'price_revealed', {
        event_category: 'gating',
        event_label: page,
        custom_parameters: {
          format: format || 'unknown'
        }
      });
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};

export const trackPlanSubmitted = (planId: string, totalValue: number) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'plan_submitted', {
        event_category: 'conversion',
        event_label: planId,
        value: totalValue
      });
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};