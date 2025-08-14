import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// TEST BRIEF DEAL CREATION
import('./utils/testBriefDealCreation.ts').then(() => {
  console.log('🧪 Brief deal creation test executed!');
});

createRoot(document.getElementById("root")!).render(<App />);
