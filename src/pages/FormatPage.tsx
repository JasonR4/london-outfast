import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getFormatBySlug } from "@/data/oohFormats";
import { generateStructuredData, updateMetaTags } from "@/utils/seo";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, MapPin, Users, Clock, Target, ArrowRight, Phone } from "lucide-react";

const FormatPage = () => {
  const { formatSlug } = useParams<{ formatSlug: string }>();
  const navigate = useNavigate();
  
  const format = formatSlug ? getFormatBySlug(formatSlug) : null;

  useEffect(() => {
    if (!format) {
      navigate("/404");
      return;
    }
    
    // Update meta tags and structured data
    updateMetaTags(format.metaTitle, format.metaDescription, `https://yoursite.com/outdoor-media/${format.slug}`);
    
    // Add structured data
    const structuredData = generateStructuredData(format);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      // Cleanup structured data script
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, [format, navigate]);

  if (!format) {
    return null;
  }

  const handleGetQuote = () => {
    navigate("/quote");
  };

  const handleCallNow = () => {
    window.location.href = "tel:+442080680220";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-6">
                {format.category}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
                {format.name} in London
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Get your brand seen across London with premium {format.shortName} placements. Fast quotes. Best rates guaranteed. Coverage across Zones 1–6.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
                  Get Instant Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleCallNow} variant="outline" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now: 020 8068 0220
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <span className="text-muted-foreground">
                  {format.shortName} Location Image
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About This Format */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-6">
                What Is {format.name}?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {format.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {format.physicalSize && (
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Physical Size</h3>
                    <p className="text-muted-foreground">{format.physicalSize}</p>
                  </div>
                )}
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Format Type</h3>
                  <Badge variant={format.type === 'digital' ? 'default' : 'secondary'}>
                    {format.type === 'digital' ? 'Digital' : 'Static'}
                  </Badge>
                </div>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Placement</h3>
                  <p className="text-muted-foreground">{format.placement}</p>
                </div>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Dwell Time</h3>
                  <p className="text-muted-foreground">{format.dwellTime}</p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {format.effectiveness}
              </p>
            </div>

            <div>
              <Card className="bg-gradient-card border-border sticky top-6">
                <CardHeader>
                  <CardTitle>Quick Quote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Get instant pricing for {format.shortName} campaigns across London
                  </p>
                  <Button onClick={handleGetQuote} className="w-full">
                    Request Custom Quote
                  </Button>
                  <Button onClick={handleCallNow} variant="outline" className="w-full">
                    Speak to a Planner
                  </Button>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Same-day quotes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Best price guarantee
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Full London coverage
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Booking Info */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {format.name} Costs in London
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Pricing varies by location, duration, and availability. We leverage our volume buying power to secure the best rates for our clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary mb-2">£</div>
                <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground">No hidden fees or middleman markups</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Volume Buying Power</h3>
                <p className="text-sm text-muted-foreground">Better rates through direct relationships</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary mb-2">📅</div>
                <h3 className="font-semibold mb-2">Flexible Booking</h3>
                <p className="text-sm text-muted-foreground">Short-term & long-term campaigns</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Expert Planning</h3>
                <p className="text-sm text-muted-foreground">Strategic location selection included</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-lg mb-6">
              <strong>Typical {format.shortName} pricing:</strong> {format.priceRange}
            </p>
            <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
              Request a Custom Quote for {format.shortName}
            </Button>
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Where Can You Book {format.shortName} in London?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {format.londonCoverage}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>All 32 London boroughs covered</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Premium Zone 1-3 locations available</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>High-footfall commuter corridors</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Real-time inventory checking</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 p-8 rounded-lg">
              <h3 className="font-semibold mb-4">Available Networks:</h3>
              <div className="space-y-2">
                {format.networks.map((network, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{network}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Uses This Format */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Who Uses {format.shortName} Ads?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {format.whoUsesIt.map((use, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{use}</h3>
                  <p className="text-sm text-muted-foreground">
                    Perfect for targeting London audiences
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Book Your {format.shortName} Ads With Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fast Quotes & Turnaround</h3>
              <p className="text-muted-foreground">Same-day quotes and rapid campaign setup</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Lowest Media Rates</h3>
              <p className="text-muted-foreground">Guaranteed best prices in London</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Transparent Process</h3>
              <p className="text-muted-foreground">Clear booking with no hidden costs</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Full Network Coverage</h3>
              <p className="text-muted-foreground">Access to all major OOH networks</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Creative Support</h3>
              <p className="text-muted-foreground">Full creative production available</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Proof of Posting</h3>
              <p className="text-muted-foreground">Full campaign reporting included</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Launch Your {format.shortName} Campaign?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get instant pricing and expert campaign planning for London's best {format.shortName} locations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
              GET QUOTE
            </Button>
            <Button onClick={handleCallNow} variant="outline" size="lg">
              SPEAK TO PLANNER
            </Button>
          </div>
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              📞 Call: 020 8068 0220 | ✅ Same-Day Quotes | 🎯 Best Price Guarantee | 🚀 Full London Coverage
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormatPage;