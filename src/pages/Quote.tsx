import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartQuoteForm } from "@/components/SmartQuoteForm";
import londonHero from "@/assets/london-hero.jpg";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const Quote = () => {
  return (
    <>
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${londonHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
            Get Your London OOH Quote
          </h1>
          
          <p className="text-xl md:text-2xl font-semibold mb-4 text-foreground">
            Same-Day Quotes • Best Price Guarantee • 100% London Coverage
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Select your preferred OOH formats below and get a custom quote within hours. 
            From Zone 1 tube stations to Shoreditch digital screens - we cover it all.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Quotes within hours, not days</p>
            </div>
            <div className="bg-gradient-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Best Prices</h3>
              <p className="text-sm text-muted-foreground">We beat any agency quote</p>
            </div>
            <div className="bg-gradient-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Full Coverage</h3>
              <p className="text-sm text-muted-foreground">Every format across London</p>
            </div>
          </div>
          
          <div className="mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/quote-plan">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Your Current Plan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <SmartQuoteForm />

      {/* Additional SEO Content */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Our OOH Quote Service?</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Transparent Pricing:</strong> No hidden fees, no mark-ups. 
                  Just honest, competitive rates for every OOH format across London.
                </p>
                <p>
                  <strong className="text-foreground">Expert Planning:</strong> Our team knows London's OOH landscape 
                  inside out. We'll recommend the best formats for your budget and objectives.
                </p>
                <p>
                  <strong className="text-foreground">Same-Day Service:</strong> Submit your brief today, 
                  get your quote today. We move at the speed of London business.
                </p>
                <p>
                  <strong className="text-foreground">Full Service Support:</strong> From planning to posting, 
                  we handle everything so you can focus on your business.
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">London OOH Coverage Areas</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  "Zone 1 Central", "Zone 2 Inner", "Zone 3-6 Outer", "Canary Wharf",
                  "Shoreditch", "Camden", "Clapham", "Brixton", "Croydon", "Heathrow",
                  "Gatwick", "London City Airport", "King's Cross", "Liverpool Street",
                  "Waterloo", "Victoria", "Oxford Street", "Regent Street"
                ].map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-london-red rounded-full"></div>
                    <span className="text-muted-foreground">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Quote;