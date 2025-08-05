import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import oohNetwork from "@/assets/ooh-network.jpg";

const CTA = () => {
  const taglines = [
    "Your Brand. On London's Streets. For Less.",
    "Buy Fast. Pay Less. Go Big.",
    "OOH in London, Without the Agency Overhead.",
    "Seen in London. Booked by You. Delivered by Us."
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${oohNetwork})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <Badge variant="secondary" className="mb-6 text-lg px-6 py-2">
          📞 READY TO LAUNCH?
        </Badge>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
          Get Your Quote Today
        </h2>
        
        <p className="text-xl md:text-2xl text-foreground font-semibold mb-4">
          We don't do "rate cards." We do real-time pricing, on your terms.
        </p>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          Get a custom OOH quote today — no obligation, no pressure.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 shadow-glow animate-pulse-glow"
            onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            GET MY MEDIA QUOTE
          </Button>
          <Button variant="outline" size="lg" className="text-xl px-12 py-8">
            REQUEST CALLBACK
          </Button>
        </div>
        
        {/* Taglines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {taglines.map((tagline, index) => (
            <div key={index} className="bg-gradient-card p-6 rounded-lg border border-border">
              <p className="text-lg font-medium text-accent">{tagline}</p>
            </div>
          ))}
        </div>
        
        {/* Contact Info */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-muted-foreground mb-2">
            Same-day quotes • Best price guarantee • 100% London coverage
          </p>
          <p className="text-sm text-muted-foreground">
            Media Buying London - London's fastest OOH media buying agency
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;