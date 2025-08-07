import { useEffect } from 'react';
import { useAnalyticsCodes } from '@/hooks/useAnalyticsCodes';

export function AnalyticsScripts() {
  const { analyticsCodes, loading } = useAnalyticsCodes();

  useEffect(() => {
    if (loading) {
      console.log('Analytics: Still loading...');
      return;
    }
    
    if (analyticsCodes.length === 0) {
      console.log('Analytics: No codes found in database');
      return;
    }

    console.log('Analytics: Found codes:', analyticsCodes);

    // Remove existing analytics scripts first
    const existingScripts = document.querySelectorAll('[data-analytics-id]');
    existingScripts.forEach(script => {
      console.log('Removing existing script:', script);
      script.remove();
    });

    // Process each analytics code
    analyticsCodes.forEach(code => {
      console.log(`Processing ${code.code_type} code for ${code.placement}:`, code.name);
      
      if (code.code_type === 'google_analytics' || code.code_type === 'gtm') {
        // Handle Google Analytics and GTM with special parsing
        const container = document.createElement('div');
        container.setAttribute('data-analytics-id', code.id);
        container.style.display = 'none';
        
        // Parse the tracking code to extract scripts
        const parser = new DOMParser();
        const doc = parser.parseFromString(code.tracking_code, 'text/html');
        const scripts = doc.querySelectorAll('script');
        
        scripts.forEach(originalScript => {
          const newScript = document.createElement('script');
          
          // Copy all attributes
          Array.from(originalScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Handle async/src scripts (like gtag.js)
          if (originalScript.src) {
            newScript.src = originalScript.src;
            newScript.async = true;
            console.log('Adding external script:', originalScript.src);
          } else {
            // Handle inline scripts
            newScript.textContent = originalScript.textContent;
            console.log('Adding inline script');
          }
          
          // Add to appropriate location
          if (code.placement === 'head') {
            document.head.appendChild(newScript);
          } else if (code.placement === 'body_start') {
            if (document.body.firstChild) {
              document.body.insertBefore(newScript, document.body.firstChild);
            } else {
              document.body.appendChild(newScript);
            }
          } else {
            document.body.appendChild(newScript);
          }
          
          container.appendChild(newScript.cloneNode(true));
        });
        
        console.log(`${code.code_type} scripts injected successfully`);
      } else {
        // Handle other tracking codes
        const container = document.createElement('div');
        container.innerHTML = code.tracking_code;
        container.setAttribute('data-analytics-id', code.id);
        container.style.display = 'none';
        
        if (code.placement === 'head') {
          document.head.appendChild(container);
        } else if (code.placement === 'body_start') {
          if (document.body.firstChild) {
            document.body.insertBefore(container, document.body.firstChild);
          } else {
            document.body.appendChild(container);
          }
        } else {
          document.body.appendChild(container);
        }
      }
    });

    // Verify Google Analytics is loaded
    setTimeout(() => {
      if ((window as any).gtag) {
        console.log('✅ Google Analytics (gtag) successfully loaded');
      } else if ((window as any).ga) {
        console.log('✅ Google Analytics (ga) successfully loaded');  
      } else {
        console.warn('⚠️ Google Analytics not detected in window object');
      }
    }, 2000);

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('[data-analytics-id]');
      scripts.forEach(script => script.remove());
    };
  }, [analyticsCodes, loading]);

  // This component only handles DOM injection via useEffect
  return null;
}