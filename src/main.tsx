import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// COMPREHENSIVE TEST OF ALL 4 ROUTES - EXECUTING NOW
import('./utils/comprehensiveHubSpotTest.ts').then(() => {
  console.log('🚀 Comprehensive HubSpot test initiated!');
});

createRoot(document.getElementById("root")!).render(<App />);
