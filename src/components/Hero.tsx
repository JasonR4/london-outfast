import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getSEODataForPage, updateMetaTags } from "@/utils/seo";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import londonHero from "@/assets/london-hero.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { content, loading } = useHomepageContent('hero');

  useEffect(() => {
    const loadHomepageSEO = async () => {
      const seoData = await getSEODataForPage('/');
      
      const title = seoData?.meta_title || "London's Fastest Out-of-Home Media Buying Specialists | Media Buying London";
      const description = seoData?.meta_description || "TfL, Roadside, Bus, Taxi, Rail, Retail & Leisure, Airports, Street Furniture, pDOOH, Ambient — best locations, best rates, same-day quotes.";
      
      updateMetaTags(title, description, 'https://mediabuyinglondon.co.uk', seoData);
    };

    loadHomepageSEO();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <section className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Hero Image */}
      <div className="flex-1 relative min-h-[50vh] md:min-h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-right bg-no-repeat"
          style={{ backgroundImage: `url(${content?.background_image || londonHero})` }}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Right Side - Content Panel */}
      <div className="flex-1 bg-black text-white flex items-center min-h-[50vh] md:min-h-screen">
        <div className="w-full max-w-2xl mx-auto px-8 lg:px-16 py-16">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-8 leading-tight">
            REACH YOUR<br />
            <span className="text-primary">The Outdoor Advertising Specialists</span>
          </h1>
          
          <p className="font-inter text-xl md:text-2xl mb-12 leading-relaxed text-white/90 font-normal">
            With London's fastest OOH specialists,<br />
            premium locations, and same-day quotes.
          </p>
          
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-12 py-4 text-lg font-semibold rounded-lg mb-16 transition-all duration-300"
            onClick={() => navigate('/brief')}
          >
            GET STARTED
          </Button>
          
          {/* Trust Indicators */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <span className="text-sm font-medium text-white/60 tracking-wider">TRUSTED BY</span>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-white/60">
                <span className="hover:text-white/80 transition-colors">FORTUNE 500</span>
                <span className="hover:text-white/80 transition-colors">STARTUPS</span>
                <span className="hover:text-white/80 transition-colors">AGENCIES</span>
                <span className="hover:text-white/80 transition-colors">BRANDS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;