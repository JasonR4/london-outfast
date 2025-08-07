import { useEffect } from 'react';
import { useAnalyticsCodes } from '@/hooks/useAnalyticsCodes';

export function AnalyticsScripts() {
  const { analyticsCodes, loading } = useAnalyticsCodes();

  useEffect(() => {
    if (loading || analyticsCodes.length === 0) return;

    console.log('Analytics codes loaded:', analyticsCodes);

    // Remove existing analytics scripts first
    const existingScripts = document.querySelectorAll('[data-analytics-id]');
    existingScripts.forEach(script => script.remove());

    // Helper function to execute scripts properly
    const executeScript = (code: string, id: string, placement: string) => {
      console.log(`Injecting ${placement} script:`, code.substring(0, 100) + '...');
      
      // Create a container div
      const container = document.createElement('div');
      container.setAttribute('data-analytics-id', id);
      container.style.display = 'none';
      
      // Parse the HTML and execute scripts
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = code;
      
      // Find all script tags and recreate them to ensure execution
      const scripts = tempDiv.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        
        // Copy attributes
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy content
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        
        container.appendChild(newScript);
      });
      
      // Add non-script elements
      const nonScripts = tempDiv.querySelectorAll(':not(script)');
      nonScripts.forEach(element => {
        container.appendChild(element.cloneNode(true));
      });
      
      return container;
    };

    // Inject head scripts
    const headCodes = analyticsCodes.filter(code => code.placement === 'head');
    headCodes.forEach(code => {
      const container = executeScript(code.tracking_code, code.id, 'head');
      document.head.appendChild(container);
    });

    // Inject body_start scripts
    const bodyStartCodes = analyticsCodes.filter(code => code.placement === 'body_start');
    bodyStartCodes.forEach(code => {
      const container = executeScript(code.tracking_code, code.id, 'body_start');
      if (document.body.firstChild) {
        document.body.insertBefore(container, document.body.firstChild);
      } else {
        document.body.appendChild(container);
      }
    });

    // Inject body_end scripts  
    const bodyEndCodes = analyticsCodes.filter(code => code.placement === 'body_end');
    bodyEndCodes.forEach(code => {
      const container = executeScript(code.tracking_code, code.id, 'body_end');
      document.body.appendChild(container);
    });

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('[data-analytics-id]');
      scripts.forEach(script => script.remove());
    };
  }, [analyticsCodes, loading]);

  // This component only handles DOM injection via useEffect
  return null;
}