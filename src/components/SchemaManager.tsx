import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { usePageSchema } from '@/hooks/usePageSchema';

export const SchemaManager = () => {
  const location = useLocation();
  const { footer } = useGlobalSettings();
  
  // Extract page key from pathname
  const getPageKey = (pathname: string) => {
    if (pathname === '/') return null; // Homepage handled separately
    if (pathname === '/outdoor-media') return 'outdoor_media';
    if (pathname === '/london-ooh-specialists') return 'london_ooh_specialists';
    if (pathname === '/ooh-advertising-london') return 'ooh_advertising_london';
    if (pathname === '/media-buying-rates-london') return 'media_buying_rates_london';
    if (pathname === '/london-ooh-deals') return 'london_ooh_deals';
    if (pathname === '/ooh') return 'ooh_hub';
    if (pathname.startsWith('/ooh/')) {
      const slug = pathname.replace('/ooh/', '').replace(/-/g, '_');
      return `ooh_${slug}`;
    }
    if (pathname.startsWith('/outdoor-media/')) {
      // Handle dynamic format pages
      return null; // These have their own canonical handling
    }
    if (pathname.startsWith('/industries/')) {
      return null; // Industry pages handle their own canonicals
    }
    if (pathname.startsWith('/blog/')) {
      return null; // Blog posts handle their own canonicals
    }
    if (pathname === '/industries') return 'industries';
    if (pathname === '/about') return 'about';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/blog') return 'blog';
    if (pathname === '/faqs') return 'faqs';
    if (pathname === '/brief') return 'brief';
    if (pathname === '/how-we-work') return 'how_we_work';
    if (pathname === '/what-is-media-buying-in-london') return 'what_is_media_buying';
    if (pathname === '/quote') return 'quote';
    if (pathname === '/configurator') return 'configurator';
    if (pathname.startsWith('/privacy-') || pathname.startsWith('/terms-') || 
        pathname.startsWith('/cookie-') || pathname.startsWith('/disclaimer') ||
        pathname.startsWith('/legal/')) {
      return null; // Legal pages handle their own canonicals
    }
    return null;
  };

  const pageKey = getPageKey(location.pathname);
  const { pageData } = usePageSchema(pageKey || '');

  const autoCanonicalFromSlug = () => {
    // Always ensure canonical URL points to non-www version
    const cleanPath = location.pathname.endsWith('/') && location.pathname !== '/' 
      ? location.pathname.slice(0, -1) 
      : location.pathname;
    return `https://mediabuyinglondon.co.uk${cleanPath}`;
  };

  const canonicalUrl = pageData?.seo?.canonical ? 
    `https://mediabuyinglondon.co.uk${pageData.seo.canonical}` : 
    autoCanonicalFromSlug();

  // Add redirect meta tag if accessed via www or ooh subdomain
  const currentHost = typeof window !== 'undefined' ? window.location.host : '';
  const needsRedirect = currentHost.includes('www.') || currentHost.includes('ooh.');

  // Generate Organization schema for homepage
  const generateOrganizationSchema = () => {
    if (location.pathname !== '/') return null;

    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Media Buying London",
      "url": "https://mediabuyinglondon.co.uk",
      "logo": "https://mediabuyinglondon.co.uk/favicon.png",
      "description": "London's fastest out-of-home media buying specialists",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "London",
        "addressCountry": "GB"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": footer?.company?.phone || "+44 20 7183 1022",
        "contactType": "Customer Service",
        "areaServed": "GB"
      },
      "sameAs": [
        footer?.social?.twitter,
        footer?.social?.linkedin,
        footer?.social?.facebook
      ].filter(Boolean)
    };
  };

  // Generate WebSite schema for homepage
  const generateWebSiteSchema = () => {
    if (location.pathname !== '/') return null;

    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Media Buying London",
      "url": "https://mediabuyinglondon.co.uk",
      "description": "London's fastest out-of-home media buying specialists",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://mediabuyinglondon.co.uk/quote?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  };

  // Generate BreadcrumbList schema
  const generateBreadcrumbSchema = () => {
    if (!pageData?.schema?.breadcrumb || pageData.schema.breadcrumb.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": pageData.schema.breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://mediabuyinglondon.co.uk${item.url}`
      }))
    };
  };

  // Generate FAQPage schema
  const generateFAQSchema = () => {
    if (!pageData?.schema?.faq_enabled || !pageData?.schema?.faq_items || pageData.schema.faq_items.length === 0) {
      return null;
    }

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pageData.schema.faq_items.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
  };

  // Collect all schemas
  const schemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    generateBreadcrumbSchema(),
    generateFAQSchema()
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* JSON-LD Schemas */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};