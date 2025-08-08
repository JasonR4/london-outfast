import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Manual sync for missed quote - DISABLED to prevent app crashes
// import './utils/manualHubSpotSync.ts'

createRoot(document.getElementById("root")!).render(<App />);
