import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MediaFormatsProvider } from "@/components/providers/MediaFormatsProvider";
import Navigation from "@/components/Navigation";
import { ScrollToTop } from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import Index from "./pages/Index";
import Quote from "./pages/Quote";
import FormatPage from "./pages/FormatPage";
import FormatDirectory from "./pages/FormatDirectory";
import Auth from "./pages/Auth";
import CMS from "./pages/CMS";
import About from "./pages/About";
import FAQs from "./pages/FAQs";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";
import IndustryPage from "./pages/IndustryPage";
import Industries from "./pages/Industries";
import Configurator from "./pages/Configurator";
import QuotePlan from "./pages/QuotePlan";
import QuoteSubmitted from "./pages/QuoteSubmitted";
import CreateAccount from "./pages/CreateAccount";
import AccountCreated from "./pages/AccountCreated";
import ClientPortal from "./pages/ClientPortal";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient();

const App = () => {
  // Disable right-click, inspect element, and dev tools
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable key combinations for dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12 (Dev Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+C (Element Selector)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+A (Select All)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    // Add CSS to disable text selection and dragging
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      input, textarea, [contenteditable], .input-allowed {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MediaFormatsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-background">
            <AnalyticsScripts />
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/quote" element={<Quote />} />
              <Route path="/quote-plan" element={<QuotePlan />} />
              <Route path="/quote-submitted" element={<QuoteSubmitted />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/account-created" element={<AccountCreated />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/configurator" element={<Configurator />} />
              <Route path="/outdoor-media" element={<FormatDirectory />} />
              <Route path="/outdoor-media/:formatSlug" element={<FormatPage />} />
              <Route path="/outdoor-media/industries/:industrySlug" element={<IndustryPage />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/industries/:industrySlug" element={<IndustryPage />} />
<Route path="/about" element={<About />} />
<Route path="/faqs" element={<FAQs />} />
<Route path="/contact" element={<Contact />} />
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<BlogPost />} />
<Route path="/auth" element={<Auth />} />
<Route path="/cms" element={<CMS />} />
              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<LegalPage />} />
              <Route path="/terms-of-service" element={<LegalPage />} />
              <Route path="/cookie-policy" element={<LegalPage />} />
              <Route path="/disclaimer" element={<LegalPage />} />
              {/* Legal Pages with /legal/ prefix */}
              <Route path="/legal/privacy-policy" element={<LegalPage />} />
              <Route path="/legal/terms-of-service" element={<LegalPage />} />
              <Route path="/legal/cookie-policy" element={<LegalPage />} />
              <Route path="/legal/disclaimer" element={<LegalPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
        </MediaFormatsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;