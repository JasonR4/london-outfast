import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// TESTING ASSOCIATION FIX
import('./utils/testAssociations.ts').then(() => {
  console.log('🧪 Association test is running!');
});

createRoot(document.getElementById("root")!).render(<App />);
