import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// FINAL LINE ITEMS TEST
import('./utils/finalLineItemsTest.ts').then(() => {
  console.log('🔧 Final line items test running!');
});

createRoot(document.getElementById("root")!).render(<App />);
