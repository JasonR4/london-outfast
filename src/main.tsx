import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// MANUAL TEST INSTRUCTIONS - NO AUTO EXECUTION
import('./utils/manualTestInstructions.ts');

createRoot(document.getElementById("root")!).render(<App />);
