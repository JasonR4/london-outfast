// Google Analytics conversion tracking utilities

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

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
      window.gtag('event', 'generate_lead', {
        event_category: 'Lead Generation',
        event_label: 'Quote Submission',
        value: quoteData.totalValue,
        currency: 'GBP',
        custom_parameters: {
          quote_id: quoteData.quoteId,
          item_count: quoteData.itemCount,
          contact_email: quoteData.contactEmail || 'unknown',
          contact_company: quoteData.contactCompany || 'unknown'
        }
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
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle
      });
      console.log('📊 Analytics: Page view tracked', { pagePath, pageTitle });
    }
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
  }
};