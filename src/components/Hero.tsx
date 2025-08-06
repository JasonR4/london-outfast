import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getSEODataForPage, updateMetaTags } from "@/utils/seo";
import londonHero from "@/assets/london-hero.jpg";

const Hero = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomepageSEO = async () => {
      const seoData = await getSEODataForPage('/');
      
      const title = seoData?.meta_title || "London's Fastest OOH Media Buying Agency | Media Buying London";
      const description = seoData?.meta_description || "London's fastest out-of-home media buying agency. Unbeaten on price, unmatched on speed. Get your campaign live in 48 hours.";
      
      updateMetaTags(title, description, 'https://mediabuyinglondon.co.uk', seoData);
    };

    loadHomepageSEO();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${londonHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
          Buy smarter. Plan faster.
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
          MEDIA BUYING LONDON
        </h1>
        
        <p className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
          London's Fastest, Leanest OOH Media Buying Specialists
        </p>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
          We don't build brands — we get them seen. From 6-sheets to Digital 48s, 
          we buy media that gets noticed. Fast turnarounds, insider rates, zero delay.
        </p>
        
        <p className="text-xl font-medium mb-12 text-accent">
          Buy smarter. Plan faster. Cut out the middle.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-glow"
            onClick={() => navigate('/quote')}
          >
            GET MY MEDIA QUOTE
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate('/quote')}
          >
            REQUEST CALLBACK
          </Button>
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            className="text-accent hover:text-accent-foreground"
            onClick={() => navigate('/outdoor-media')}
          >
            Browse All OOH Formats →
          </Button>
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