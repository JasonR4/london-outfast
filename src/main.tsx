import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Test HubSpot connection immediately on app load
import('./utils/testHubSpotConnection.ts').then(() => {
  console.log('🔍 HubSpot connection test initiated!');
}).catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
