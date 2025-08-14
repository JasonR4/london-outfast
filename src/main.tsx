import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Trigger HubSpot tests immediately on app load
import('./utils/triggerHubSpotTests.ts').then(() => {
  console.log('🚀 HubSpot tests triggered NOW!');
}).catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
