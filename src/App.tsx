import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import ProtectedRoute from "@/components/ProtectedRoute";
import About from "./pages/About";
import FAQs from "./pages/FAQs";
import LegalPage from "./pages/LegalPage";
import WhatIsMediaBuying from "./pages/WhatIsMediaBuying";
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
import { trackPageView, initCampaignTracking } from "@/utils/analytics";
import { updateMetaTags, enforceCanonical } from "@/utils/seo";
import EmailTest from "./pages/EmailTest";
import NoInspect from "@/components/security/NoInspect";
import HtmlSitemap from "./pages/HtmlSitemap";
import Brief from "./pages/Brief";
import ThankYou from "./pages/ThankYou";
import CorporateInvestment from "./pages/CorporateInvestment";

const queryClient = new QueryClient();

const RouterAnalytics = () => {
  const location = useLocation();
  useEffect(() => { initCampaignTracking(); }, []);
  // Ensure canonical exists on first paint
  useEffect(() => { enforceCanonical(); }, []);
  useEffect(() => {
    trackPageView(location.pathname, document.title);
    const metaDesc = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || "London's fastest out-of-home media buying specialists.";
    const url = new URL(location.pathname + location.search, window.location.origin).toString();
    updateMetaTags(document.title, metaDesc, url);
    // Enforce canonical on every client-side route change
    enforceCanonical(url);
  }, [location.pathname, location.search]);
  return null;
};

const App = () => {

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
      <MediaFormatsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <RouterAnalytics />
          <NoInspect />
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
              <Route path="/what-is-media-buying-in-london" element={<WhatIsMediaBuying />} />
              <Route path="/about" element={<About />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/brief" element={<Brief />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/email-test" element={<EmailTest />} />
              <Route path="/cms" element={<ProtectedRoute><CMS /></ProtectedRoute>} />
              <Route path="/corporate-investment" element={<CorporateInvestment />} />
              <Route path="/sitemap" element={<HtmlSitemap />} />
              <Route path="/sitemap-html" element={<HtmlSitemap />} />
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
      </TooltipProvider>
    </MediaFormatsProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;