import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

interface SchemaManagerProps {
  pageData?: {
    seo?: {
      canonical?: string;
    };
    schema?: {
      faq_enabled?: boolean;
      faq_items?: Array<{ question: string; answer: string; }>;
      breadcrumb?: Array<{ name: string; url: string; }>;
    };
  };
}

export const SchemaManager = ({ pageData }: SchemaManagerProps) => {
  const location = useLocation();
  const { footer } = useGlobalSettings();

  const autoCanonicalFromSlug = () => {
    return `https://mediabuyinglondon.co.uk${location.pathname}`;
  };

  const canonicalUrl = pageData?.seo?.canonical || autoCanonicalFromSlug();

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