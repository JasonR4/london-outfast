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
    { key: 'quote', heading: 'I know what I want', description: 'Get your OOH campaign booked today.', label: 'Get My Quote', route: '/quote', variant: 'default' },
    { key: 'configurator', heading: 'I need guidance', description: 'Answer a few quick questions and we’ll recommend the right formats, locations, and budget split.', label: 'Use the Configurator', route: '/configurator', variant: 'outline' },
    { key: 'browse', heading: 'I’m just exploring', description: 'Browse London’s OOH environments, formats, and placement opportunities.', label: 'Explore Outdoor Media', route: '/outdoor-media', variant: 'ghost' },
    { key: 'specialist', heading: 'Talk to an OOH specialist', description: 'Discuss your brief directly with a senior MBL media buying specialist.', label: 'Send My Brief', route: '/brief', variant: 'accent' },
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
        
        
          <div className="mt-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {ctas.map((cta) => (
                <div key={cta.key} className="flex flex-col items-center text-center gap-2">
                  <p className="text-sm font-medium">{cta.heading}</p>
                  <p className="text-sm text-muted-foreground">{cta.description}</p>
                  <Button
                    variant={cta.variant as any}
                    size="lg"
                    className="text-lg px-8 py-6 w-full sm:w-auto"
                    onClick={() => navigate(cta.route)}
                    data-cta={`hero_${cta.key}`}
                    aria-label={`${cta.heading} - ${cta.label}`}
                  >
                    {cta.label}
                  </Button>
                </div>
              ))}
            </div>
          </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-8 bg-gradient-hero rounded-full opacity-60"></div>
      </div>
    </section>
  );
};

export default Hero;