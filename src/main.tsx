import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// CHECK BRIEF FIX - NO AUTO EXECUTION
import('./utils/checkBriefFix.ts');

createRoot(document.getElementById("root")!).render(<App />);
