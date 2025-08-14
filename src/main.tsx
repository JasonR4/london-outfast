import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// SINGLE DEBUG TEST - NO DUPLICATES
import('./utils/singleDebugTest.ts').then(() => {
  console.log('🧪 Single debug test running');
});

createRoot(document.getElementById("root")!).render(<App />);
