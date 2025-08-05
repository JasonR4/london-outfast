import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import londonHero from "@/assets/london-hero.jpg";

const Hero = () => {
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
          📍 London's Fastest Out-of-Home Media Buying Agency
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
          MEDIA BUYING LONDON
        </h1>
        
        <p className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
          Unbeaten on Price. Unmatched on Speed.
        </p>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
          From a 6-sheet in Zone 1 to premium Digital 48s in Shoreditch, we plan and book OOH campaigns 
          across Greater London at unbeatable rates. Same-day quotes and guaranteed best pricing.
        </p>
        
        <p className="text-xl font-medium mb-12 text-accent">
          No delays. No mark-ups. No agency fluff.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-glow"
            onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            GET MY MEDIA QUOTE
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            REQUEST CALLBACK
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