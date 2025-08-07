import { useEffect } from 'react';
import { useAnalyticsCodes } from '@/hooks/useAnalyticsCodes';

export function AnalyticsScripts() {
  const { analyticsCodes, loading } = useAnalyticsCodes();

  useEffect(() => {
    if (loading || analyticsCodes.length === 0) return;

    // Remove existing analytics scripts first
    const existingScripts = document.querySelectorAll('[data-analytics-id]');
    existingScripts.forEach(script => script.remove());

    // Inject head scripts
    const headCodes = analyticsCodes.filter(code => code.placement === 'head');
    headCodes.forEach(code => {
      const script = document.createElement('script');
      script.innerHTML = code.tracking_code;
      script.setAttribute('data-analytics-id', code.id);
      document.head.appendChild(script);
    });

    // Inject body_start scripts
    const bodyStartCodes = analyticsCodes.filter(code => code.placement === 'body_start');
    bodyStartCodes.forEach(code => {
      const div = document.createElement('div');
      div.innerHTML = code.tracking_code;
      div.setAttribute('data-analytics-id', code.id);
      div.style.display = 'none';
      
      // Insert at the beginning of body
      if (document.body.firstChild) {
        document.body.insertBefore(div, document.body.firstChild);
      } else {
        document.body.appendChild(div);
      }
    });

    // Inject body_end scripts
    const bodyEndCodes = analyticsCodes.filter(code => code.placement === 'body_end');
    bodyEndCodes.forEach(code => {
      const div = document.createElement('div');
      div.innerHTML = code.tracking_code;
      div.setAttribute('data-analytics-id', code.id);
      div.style.display = 'none';
      document.body.appendChild(div);
    });

    // Cleanup function to remove scripts when component unmounts
    return () => {
      const scripts = document.querySelectorAll('[data-analytics-id]');
      scripts.forEach(script => script.remove());
    };
  }, [analyticsCodes, loading]);

  // This component only handles DOM injection via useEffect
  return null;
}