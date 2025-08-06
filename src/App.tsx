import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { ScrollToTop } from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/quote-plan" element={<QuotePlan />} />
            <Route path="/quote-submitted" element={<QuoteSubmitted />} />
            <Route path="/configurator" element={<Configurator />} />
            <Route path="/outdoor-media" element={<FormatDirectory />} />
            <Route path="/outdoor-media/:formatSlug" element={<FormatPage />} />
            <Route path="/outdoor-media/industries/:industrySlug" element={<IndustryPage />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/:industrySlug" element={<IndustryPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cms" element={<CMS />} />
            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<LegalPage />} />
            <Route path="/terms-of-service" element={<LegalPage />} />
            <Route path="/cookie-policy" element={<LegalPage />} />
            <Route path="/disclaimer" element={<LegalPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
