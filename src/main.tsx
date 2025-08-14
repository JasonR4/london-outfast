import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// DIRECT BROWSER TEST - SINGLE EXECUTION
import('./utils/directBrowserTest.ts');

createRoot(document.getElementById("root")!).render(<App />);
