import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// CRITICAL ASSOCIATION TEST - MUST WORK!
import('./utils/criticalAssociationTest.ts').then(() => {
  console.log('🚨 Critical association test with real quote data running!');
});

createRoot(document.getElementById("root")!).render(<App />);
