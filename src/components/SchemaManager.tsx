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
    return null;
  };

  const pageKey = getPageKey(location.pathname);
  const { pageData } = usePageSchema(pageKey || '');

  const autoCanonicalFromSlug = () => {
    return `https://mediabuyinglondon.co.uk${location.pathname}`;
  };

  const canonicalUrl = pageData?.seo?.canonical ? 
    `https://mediabuyinglondon.co.uk${pageData.seo.canonical}` : 
    autoCanonicalFromSlug();

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
    // Handle blog post FAQs specifically for DOOH blog post
    if (location.pathname === '/blog/dooh-advertising-london') {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is DOOH in London?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DOOH (Digital Out-of-Home) refers to digital billboards, London Underground screens, shopping mall panels, and roadside D48s that use dynamic creative and real-time triggers."
            }
          },
          {
            "@type": "Question", 
            "name": "How much does DOOH advertising cost in London?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DOOH advertising in London costs typically range from £15 to £45 CPM (cost per thousand impressions). Media Buying London guarantees discounted rates and uploads all invoices to your portal for full transparency."
            }
          },
          {
            "@type": "Question",
            "name": "Which London DOOH formats work best?",
            "acceptedAnswer": {
              "@type": "Answer", 
              "text": "The most effective DOOH formats in London include D48 roadside panels, London Underground digital escalator panels, and landmark 3D screens such as Piccadilly Circus."
            }
          },
          {
            "@type": "Question",
            "name": "Which companies own DOOH sites in London?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Major DOOH media owners in London include JCDecaux, Clear Channel, Ocean Outdoor, Global Outdoor, Limited Space, and BlowUp Media."
            }
          }
        ]
      };
    }

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