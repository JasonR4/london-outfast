import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Enforces canonical domain and HTTPS redirects via JavaScript
 * Acts as backup if .htaccess redirects fail
 */
export const CanonicalRedirect = () => {
  const location = useLocation();

  useEffect(() => {
    const currentHost = window.location.host;
    const currentProtocol = window.location.protocol;
    const canonicalHost = 'mediabuyinglondon.co.uk';

    // Check if we're on wrong domain/protocol
    const needsRedirect = 
      currentHost !== canonicalHost || 
      currentProtocol !== 'https:' ||
      currentHost.startsWith('www.') ||
      currentHost.startsWith('ooh.');

    if (needsRedirect) {
      // Build canonical URL
      const canonicalUrl = `https://${canonicalHost}${location.pathname}${location.search}${location.hash}`;
      
      // Permanent redirect
      window.location.replace(canonicalUrl);
    }
  }, [location]);

  return null;
};
