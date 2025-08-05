import { oohFormats } from "@/data/oohFormats";

export const generateSitemapUrls = () => {
  const baseUrl = "https://yoursite.com"; // Replace with actual domain
  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/quote`,
    `${baseUrl}/outdoor-media`,
    ...oohFormats.map(format => `${baseUrl}/outdoor-media/${format.slug}`)
  ];
  return urls;
};

export const generateStructuredData = (format?: any) => {
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
    "telephone": "+442080680220",
    "url": "https://yoursite.com",
    "areaServed": "London",
    "serviceType": "Out-of-Home Media Buying"
  };

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

export const updateMetaTags = (title: string, description: string, url?: string) => {
  document.title = title;
  
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', description);
  }

  if (url) {
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', url);
    }
  }
};