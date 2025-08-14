import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// MANUAL HUBSPOT TEST - EXECUTING NOW
import('./utils/manualHubSpotTest.ts').then(() => {
  console.log('🚀 Manual HubSpot tests executed!');
});

createRoot(document.getElementById("root")!).render(<App />);
