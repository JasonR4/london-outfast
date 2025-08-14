import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// RUNNING ALL 4 HUBSPOT ROUTES TEST NOW
import('./utils/triggerHubSpotTests.ts').then(() => {
  console.log('🚀 All 4 HubSpot route tests are now executing!');
});

createRoot(document.getElementById("root")!).render(<App />);
