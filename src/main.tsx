import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Test HubSpot connection immediately on app load
import('./utils/triggerHubSpotTests.ts').then(() => {
  console.log('🚀 HubSpot tests triggered NOW!');
}).catch(console.error);

// Also test HubSpot connection
import { supabase } from './integrations/supabase/client';
supabase.functions.invoke('test-hubspot-connection', { body: {} })
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ HubSpot connection test failed:', error);
    } else {
      console.log('🔍 HubSpot connection test result:', data);
    }
  });

createRoot(document.getElementById("root")!).render(<App />);
