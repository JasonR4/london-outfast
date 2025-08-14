import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// COMPREHENSIVE HUBSPOT TEST WITH PROPER CONTACT NAMES
import('./utils/comprehensiveHubSpotTest.ts').then(() => {
  console.log('🧪 Comprehensive HubSpot test with proper contact names executed!');
});

createRoot(document.getElementById("root")!).render(<App />);
