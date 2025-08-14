import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Train, 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle,
  Monitor,
  Navigation,
  MapPin,
  Zap,
  BarChart3,
  ArrowRight
} from 'lucide-react';

const LondonUndergroundAdvertising = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add FAQ Schema
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What London Underground formats are available?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Key formats include 6 Sheet Underground panels, 16 Sheet corridor panels, Digital Escalator Panels (DEP), Cross Track Projections (XTP), full station takeovers, train wraps and in-carriage panels."
          }
        },
        {
          "@type": "Question",
          "name": "How much does London Underground advertising cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Costs depend on format, station, line, seasonality and duration. We provide transparent proposals showing the media owner rate and our commission separately."
          }
        },
        {
          "@type": "Question",
          "name": "Can we target specific lines or stations?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We plan by station, line and journey stage using Route data, Experian Mosaic and location analytics to match audience and objectives."
          }
        },
        {
          "@type": "Question",
          "name": "Do you handle TfL approvals, production and installation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We manage artwork specs, TfL approvals, print and installation across static and digital formats."
          }
        },
        {
          "@type": "Question",
          "name": "How do you measure performance?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We supply proof of posting and post-campaign summaries. Where required, we model reach and frequency using industry datasets and can align to retail or site uplift."
          }
        }
      ]
    });
    document.head.appendChild(faqScript);

    // Add Service Schema
    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AdvertisingService",
      "name": "London Underground Advertising",
      "serviceType": "Transport and Station Advertising",
      "category": "Out-of-Home Advertising",
      "provider": {
        "@type": "Organization",
        "name": "Media Buying London",
        "url": "https://mediabuyinglondon.co.uk",
        "logo": "https://mediabuyinglondon.co.uk/favicon.png"
      },
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "Greater London"
      },
      "audience": {
        "@type": "BusinessAudience",
        "audienceType": "Brands, agencies and in-house teams"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "London Underground Formats",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "6 Sheet Underground Panel (LT Panel)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "16 Sheet Corridor Panel" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Digital Escalator Panel (DEP)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cross Track Projection (XTP)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Full Station Takeover" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Train Wraps & In-Carriage Panels" } }
        ]
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock"
      }
    });
    document.head.appendChild(serviceScript);

    // Add Breadcrumb Schema
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mediabuyinglondon.co.uk/" },
        { "@type": "ListItem", "position": 2, "name": "OOH", "item": "https://mediabuyinglondon.co.uk/ooh" },
        { "@type": "ListItem", "position": 3, "name": "London Underground Advertising", "item": "https://mediabuyinglondon.co.uk/ooh/london-underground" }
      ]
    });
    document.head.appendChild(breadcrumbScript);

    return () => {
      // Clean up scripts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes('London Underground') || script.textContent?.includes('Underground Advertising')) {
          document.head.removeChild(script);
        }
      });
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>London Underground Advertising | Premium Transport OOH | Media Buying London</title>
        <meta 
          name="description" 
          content="Command attention inside London's iconic transport network. 4+ million daily passengers across 270+ stations. Expert planning, strategic placement, proven ROI."
        />
        <link rel="canonical" href="https://mediabuyinglondon.co.uk/ooh/london-underground" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-black py-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 text-sm font-medium bg-red-600/20 text-red-400 border-red-600/30">
                <Train className="w-4 h-4 mr-2" />
                London Underground Advertising
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-red-500 mb-6 leading-tight">
                Command attention inside one of the world's busiest and most iconic transport networks.
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                The London Underground moves more than 4 million passengers every day across 270+ stations, making it one of the most valuable out-of-home advertising environments in the UK.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/quote')}
                  className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white"
                >
                  Get Underground Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/configurator')}
                  className="text-lg px-8 py-6 border-red-600/50 text-red-400 hover:bg-red-600/10"
                >
                  Plan Campaign
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Underground Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why London Underground Advertising Works
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  From high-frequency commuter corridors to tourist-heavy interchange hubs, Underground advertising delivers unmatched reach, dwell time, and audience targeting potential.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Massive Daily Footfall</h3>
                    <p className="text-muted-foreground">
                      Millions of passengers across all demographics, 7 days a week.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">High Dwell Time</h3>
                    <p className="text-muted-foreground">
                      Commuters spend extended time on platforms and trains, giving campaigns more opportunity to land.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Targeted Delivery</h3>
                    <p className="text-muted-foreground">
                      Focus on specific lines, zones, or stations to reach precise audience segments.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Monitor className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Multi-Format Reach</h3>
                    <p className="text-muted-foreground">
                      Combine static and digital placements for layered brand storytelling.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Proven ROI</h3>
                    <p className="text-muted-foreground">
                      Consistently drives high recall and response rates for brand and direct-response campaigns.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">City-Wide Reach</h3>
                    <p className="text-muted-foreground">
                      Achieve awareness, targeted impact, or full station domination with strategic placement.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Key Formats */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Key London Underground Advertising Formats
                </h2>
              </div>

              <div className="space-y-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <MapPin className="w-6 h-6 text-primary mr-3" />
                    Station Environments
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-3">16-Sheet Underground Corridors</h4>
                        <p className="text-muted-foreground">
                          Positioned along high-traffic walkways for repeated impressions.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-3">6-Sheet Underground Panels (LT Panels)</h4>
                        <p className="text-muted-foreground">
                          Located at entrances, exits, and key decision points.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-3">Full Station Takeovers</h4>
                        <p className="text-muted-foreground">
                          Transform an entire station environment into a complete brand experience.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-3">Cross Track Projection (XTP)</h4>
                        <p className="text-muted-foreground">
                          Premium digital formats visible from platforms, ideal for dwell-time engagement.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-3">Digital Escalator Panels (DEP)</h4>
                        <p className="text-muted-foreground">
                          Sequential animated displays along escalators for immersive impact.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <Train className="w-6 h-6 text-primary mr-3" />
                    In-Carriage & Train Advertising
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-3">Train Wraps</h4>
                        <p className="text-muted-foreground">
                          Full exterior branding for maximum moving visibility across the network.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-3">Carriage Panels</h4>
                        <p className="text-muted-foreground">
                          Interior advertising positioned above windows, on doors, and within passenger eyeline.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Creative & Campaign Enhancements */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Creative & Campaign Enhancements
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Dynamic Digital Content</h3>
                    <p className="text-muted-foreground">
                      Integrate dayparting, weather triggers, and live updates.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Geo-Targeted Messaging</h3>
                    <p className="text-muted-foreground">
                      Adapt creative to specific station locations or journey stages.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Navigation className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Sequential Storytelling</h3>
                    <p className="text-muted-foreground">
                      Build narrative engagement across multiple passenger touchpoints.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Who Uses Underground Advertising */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Who Uses London Underground Advertising?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-3">Consumer Brands</h3>
                    <p className="text-muted-foreground">
                      For large-scale awareness campaigns.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-3">Entertainment & Media</h3>
                    <p className="text-muted-foreground">
                      Driving attendance for events, streaming launches, and film releases.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-3">Finance & Technology</h3>
                    <p className="text-muted-foreground">
                      Positioning for trust, visibility, and market leadership.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-3">Retail & Hospitality</h3>
                    <p className="text-muted-foreground">
                      Capturing audiences in close proximity to purchase points.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Process</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {[
                  { step: "1", title: "Planning", desc: "Audience mapping and location strategy." },
                  { step: "2", title: "Format Selection", desc: "Choosing the right blend for objectives and budget." },
                  { step: "3", title: "Creative Consultation", desc: "Optimising assets for Underground environments." },
                  { step: "4", title: "Booking & Buying", desc: "Securing the best market rates via our media owner relationships." },
                  { step: "5", title: "Measurement", desc: "Transparent reporting and campaign performance analysis." }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Get your brand inside the network that moves London.
              </h2>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/quote')}
                className="text-lg px-8 py-6"
              >
                Request a London Underground Advertising Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default LondonUndergroundAdvertising;