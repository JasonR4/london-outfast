import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Manual sync for missed quote - REMOVED to prevent auto-execution
// import './utils/manualHubSpotSync.ts'

createRoot(document.getElementById("root")!).render(<App />);
