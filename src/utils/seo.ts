import { supabase } from "@/integrations/supabase/client";

export const generateSitemapUrls = async () => {
  const baseUrl = "https://mediabuyinglondon.co.uk";
  
  // Fetch media formats from database
  const { data: mediaFormats } = await supabase
    .from('media_formats')
    .select('format_slug')
    .eq('is_active', true);

  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/quote`,
    `${baseUrl}/outdoor-media`,
    ...(mediaFormats || []).map(format => `${baseUrl}/outdoor-media/${format.format_slug}`)
  ];
  return urls;
};

export const getSEODataForPage = async (pageSlug: string) => {
  try {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .eq('page_slug', pageSlug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching SEO data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return null;
  }
};

export const generateStructuredData = (format?: any, seoData?: any) => {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Media Buying London",
    "description": "London's fastest out-of-home media buying agency. Unbeaten on price, unmatched on speed.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "London",
      "addressCountry": "GB"
    },
    "telephone": "+442045243019",
    "url": "https://mediabuyinglondon.co.uk",
    "areaServed": "London",
    "serviceType": "Out-of-Home Media Buying"
  };

  // Use CMS SEO data if available
  if (seoData?.schema_markup) {
    return seoData.schema_markup;
  }

  if (format) {
    return {
      ...baseStructuredData,
      "@type": ["LocalBusiness", "Service"],
      "name": `${format.name} in London | Media Buying London`,
      "description": format.metaDescription,
      "offers": {
        "@type": "Offer",
        "description": `${format.name} advertising in London`,
        "areaServed": "London"
      }
    };
  }

  return baseStructuredData;
};

export const updateMetaTags = (title: string, description: string, url?: string, seoData?: any) => {
  document.title = title;
  
  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Update meta keywords if available
  if (seoData?.keywords && seoData.keywords.length > 0) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seoData.keywords.join(', '));
  }

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', seoData?.canonical_url || url || window.location.href);

  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]') || createMetaTag('property', 'og:title');
  ogTitle.setAttribute('content', seoData?.og_title || title);

  const ogDesc = document.querySelector('meta[property="og:description"]') || createMetaTag('property', 'og:description');
  ogDesc.setAttribute('content', seoData?.og_description || description);

  const ogUrl = document.querySelector('meta[property="og:url"]') || createMetaTag('property', 'og:url');
  ogUrl.setAttribute('content', url || window.location.href);

  if (seoData?.og_image) {
    const ogImage = document.querySelector('meta[property="og:image"]') || createMetaTag('property', 'og:image');
    ogImage.setAttribute('content', seoData.og_image);
  }

  // Update Twitter Card tags
  const twitterCard = document.querySelector('meta[name="twitter:card"]') || createMetaTag('name', 'twitter:card');
  twitterCard.setAttribute('content', 'summary_large_image');

  const twitterTitle = document.querySelector('meta[name="twitter:title"]') || createMetaTag('name', 'twitter:title');
  twitterTitle.setAttribute('content', seoData?.twitter_title || title);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]') || createMetaTag('name', 'twitter:description');
  twitterDesc.setAttribute('content', seoData?.twitter_description || description);

  if (seoData?.twitter_image) {
    const twitterImage = document.querySelector('meta[name="twitter:image"]') || createMetaTag('name', 'twitter:image');
    twitterImage.setAttribute('content', seoData.twitter_image);
  }

  // Update structured data
  let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
  if (!structuredDataScript) {
    structuredDataScript = document.createElement('script');
    structuredDataScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(structuredDataScript);
  }
  
  const structuredData = generateStructuredData(null, seoData);
  structuredDataScript.textContent = JSON.stringify(structuredData);
};

const createMetaTag = (attrName: string, attrValue: string) => {
  const meta = document.createElement('meta');
  meta.setAttribute(attrName, attrValue);
  document.head.appendChild(meta);
  return meta;
};