import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// TEST FIXED ROUTE PREFIXES
import('./utils/testRoutePrefixes.ts').then(() => {
  console.log('🧪 Route prefix tests executed!');
});

createRoot(document.getElementById("root")!).render(<App />);
