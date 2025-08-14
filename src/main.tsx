import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// RUNNING ALL HUBSPOT TESTS NOW
import('./utils/triggerHubSpotTests.ts').then(() => {
  console.log('🧪 All HubSpot tests are now running!');
});

createRoot(document.getElementById("root")!).render(<App />);
