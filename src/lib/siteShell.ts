// Single source of truth for site navigation and footer data
// Fetches from production endpoints with fallbacks

const LIVE_NAV = {
  logo: { text: 'Media Buying London', url: '/' },
  menu_items: [
    { 
      label: 'Services', 
      type: 'dropdown' as const, 
      submenu: [
        { label: 'London Underground', url: '/london-underground-advertising' },
        { label: 'Bus Advertising', url: '/bus-advertising' },
        { label: 'Roadside Advertising', url: '/roadside-advertising' },
        { label: 'Digital OOH', url: '/digital-ooh' },
        { label: 'Rail Advertising', url: '/rail-advertising-london' },
        { label: 'Taxi Advertising', url: '/taxi-advertising' },
        { label: 'Lamp Post Banners', url: '/lamp-post-banner-advertising' },
        { label: 'Airport Advertising', url: '/airport-advertising' },
        { label: 'Stadium Advertising', url: '/stadium-advertising' },
        { label: 'Shopping Mall', url: '/shopping-mall-advertising' },
        { label: 'Supermarket Advertising', url: '/supermarket-advertising' },
        { label: 'Street Furniture', url: '/street-furniture' },
        { label: 'City Posters', url: '/city-posters' },
        { label: 'Experiential & Sampling', url: '/experiential-sampling' },
        { label: 'Projection Mapping', url: '/projection-mapping-advertising' },
        { label: 'Bike Hire Dock', url: '/bike-hire-dock-advertising' }
      ]
    },
    { 
      label: 'Industries', 
      type: 'component' as const,
      component: 'IndustriesDropdown'
    },
    { 
      label: 'Company', 
      type: 'dropdown' as const, 
      submenu: [
        { label: 'About Us', url: '/about' },
        { label: 'How We Work', url: '/how-we-work' },
        { label: 'Contact', url: '/contact' },
        { label: 'FAQs', url: '/faqs' }
      ]
    },
    { label: 'Rates', url: '/media-buying-rates-london', type: 'link' as const },
    { label: 'Blog', url: '/blog', type: 'link' as const }
  ]
};

const LIVE_FOOTER = {
  company: { 
    name: 'Media Buying London', 
    description: 'London\'s dedicated out-of-home advertising specialists. We buy billboard, tube, bus, taxi, and digital OOH media with transparent pricing and same-day quotes.',
    phone: '+44 20 3488 8306',
    email: 'hello@mediabuyinglondon.co.uk'
  },
  links: {
    services: [
      { label: 'London Underground', url: '/london-underground-advertising' },
      { label: 'Bus Advertising', url: '/bus-advertising' },
      { label: 'Roadside Advertising', url: '/roadside-advertising' },
      { label: 'Digital OOH', url: '/digital-ooh' },
      { label: 'Rail Advertising', url: '/rail-advertising-london' },
      { label: 'Taxi Advertising', url: '/taxi-advertising' },
      { label: 'Street Furniture', url: '/street-furniture' },
      { label: 'City Posters', url: '/city-posters' }
    ],
    company: [
      { label: 'About Us', url: '/about' },
      { label: 'How We Work', url: '/how-we-work' },
      { label: 'OOH Hub', url: '/ooh-hub' },
      { label: 'Contact', url: '/contact' },
      { label: 'FAQs', url: '/faqs' }
    ],
    legal: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Cookie Policy', url: '/cookies' }
    ]
  },
  copyright: '© 2024 Media Buying London. All rights reserved.'
};

export interface SiteShellData {
  navigation: typeof LIVE_NAV;
  footer: typeof LIVE_FOOTER;
}

let shellDataCache: SiteShellData | null = null;

export const fetchSiteShellData = async (): Promise<SiteShellData> => {
  // Clear any cached nav flags
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nav_fallback_used');
    localStorage.removeItem('footer_fallback_used');
  }

  // For now, return the live data directly
  // In production, this would fetch from CMS endpoints
  const data = {
    navigation: LIVE_NAV,
    footer: LIVE_FOOTER
  };

  shellDataCache = data;
  return data;
};

export const getSiteShellData = (): SiteShellData => {
  return shellDataCache || {
    navigation: LIVE_NAV,
    footer: LIVE_FOOTER
  };
};