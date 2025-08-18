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
      
      const title = seoData?.meta_title || "London’s Fastest Out-of-Home Media Buying Specialists | Media Buying London";
      const description = seoData?.meta_description || "TfL, Roadside, Bus, Taxi, Rail, Retail & Leisure, Airports, Street Furniture, pDOOH, Ambient — best locations, best rates, same-day quotes.";
      
      updateMetaTags(title, description, 'https://mediabuyinglondon.co.uk', seoData);
    };

    loadHomepageSEO();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const ctas = (content?.ctas as any) ?? [
    { key: 'quote', heading: 'Get My Quote', description: 'Get your OOH campaign booked today.', label: 'Get My Quote', route: 'https://mediabuyinglondon.co.uk/quote', variant: 'default' },
    { key: 'configurator', heading: 'Use the Configurator', description: 'Answer a few quick questions and we’ll recommend the right formats, locations, and budget split.', label: 'Use the Configurator', route: 'https://mediabuyinglondon.co.uk/configurator', variant: 'secondary' },
    { key: 'browse', heading: 'Explore Outdoor Media', description: 'Browse London’s OOH environments, formats, and placement opportunities.', label: 'Explore Outdoor Media', route: 'https://mediabuyinglondon.co.uk/outdoor-media', variant: 'outline' },
    { key: 'specialist', heading: 'Send My Brief', description: 'Discuss your brief directly with a senior MBL media buying specialist.', label: 'Send My Brief', route: 'https://mediabuyinglondon.co.uk/brief', variant: 'accent' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mb-16 md:mb-24">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${content?.background_image || londonHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
          Buy smarter. Plan faster.
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
          {content?.title || "London’s Fastest Out-of-Home Media Buying Specialists"}
        </h1>
        
        <p className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
          {content?.subtitle || "From London Underground (TfL) to Classic & Digital Roadside, Bus, Taxi, National Rail, Retail & Leisure, Airports, Street Furniture, Programmatic DOOH, and Ambient OOH — we secure the best locations, the best rates, and deliver same-day quotes."}
        </p>
        
        {(content?.description && String(content.description).trim() !== "") && (
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            {content.description}
          </p>
        )}
        
        
          <section className="hero-cta mt-10">
            <div className="hero-cta__grid">

              <a 
                href="/configurator" 
                className="cta-card cta--config"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/configurator');
                }}
                data-cta="hero_configurator"
                aria-label="Use the Configurator - Answer questions for recommendations"
              >
                <h3>Use the Configurator</h3>
                <p>Answer a few quick questions and we'll recommend formats, locations, and budget split.</p>
              </a>

              <a 
                href="/outdoor-media" 
                className="cta-card cta--explore"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/outdoor-media');
                }}
                data-cta="hero_browse"
                aria-label="Explore Outdoor Media - Browse London's OOH opportunities"
              >
                <h3>Explore Outdoor Media</h3>
                <p>Browse London's OOH environments, formats, and placement opportunities.</p>
              </a>

              <a 
                href="/brief" 
                className="cta-card cta--brief"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/brief');
                }}
                data-cta="hero_specialist"
                aria-label="Send My Brief - Discuss with a specialist"
              >
                <h3>Send My Brief</h3>
                <p>Discuss your brief directly with a senior MBL media buying specialist.</p>
              </a>
            </div>
          </section>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-8 bg-gradient-hero rounded-full opacity-60"></div>
      </div>
    </section>
  );
};

export default Hero;