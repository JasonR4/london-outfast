import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      title: "Transport & Commuter Hubs",
      description: "London Underground (TfL) formats, National Rail & Overground",
      formats: ["6-sheets", "16-sheets", "Digital Escalator Panels (DEPs)", "Cross-track Projectors (XTPs)", "Tube Car Panels (TCPs)", "Rail 6s and 48s", "Station Gateway D6s", "D6 Motion formats"]
    },
    {
      title: "Roadside & Bus Formats",
      description: "Classic and digital roadside, plus comprehensive bus advertising",
      formats: ["Classic 48-sheets & Digital 48s (D48s)", "96-sheets & Mega 6s", "London Bus Supersides, T-sides, Rears", "Bus Shelter 6-sheets (JCDecaux & Clear Channel)"]
    },
    {
      title: "Retail & Lifestyle Spaces",
      description: "High-traffic retail and shopping environments",
      formats: ["Malls and Shopping Centres (Mall D6s, Portrait Panels)", "Supermarket Panels (ASDA Live, Tesco Screens)", "High Street Storefront Takeovers"]
    },
    {
      title: "Airports & Premium Environments",
      description: "Premium locations for maximum impact",
      formats: ["Heathrow, Gatwick, London City – D6s, Baggage Halls, Walkways", "Office & Corporate Towers (Elevator Screens, Reception Dominations)"]
    },
    {
      title: "Digital OOH (DOOH)",
      description: "Cutting-edge digital advertising solutions",
      formats: ["Large Format Digital (D48, D96, Mega Portraits)", "Roadside LED Screens", "Programmatic DOOH (real-time audience buys)"]
    },
    {
      title: "Street-Level Formats",
      description: "Ground-level and ambient advertising opportunities",
      formats: ["Phone kiosks (InLink & Kiosk Panels)", "Taxi liveries & tip-seats", "Ambient / guerrilla OOH (flyposting, projections)"]
    }
  ];

  return (
    <section id="services" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            OOH, DONE DIFFERENTLY
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our Mission: Buy Smarter. Plan Faster. Cut Out the Middle.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We deliver out-of-home campaigns across London with unmatched access, insider rates, and zero delay
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-gradient-card border-border hover:shadow-card transition-all duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
                <p className="text-muted-foreground">{service.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.formats.map((format, formatIndex) => (
                    <div key={formatIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-london-red rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{format}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            onClick={() => navigate('/outdoor-media')}
            size="lg"
            variant="outline"
          >
            View All OOH Formats & Pricing
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;