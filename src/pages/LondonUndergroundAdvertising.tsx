import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, TrendingUp, Clock, CheckCircle, Users, Eye, Target } from "lucide-react";

const LondonUndergroundAdvertising = () => {
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
          "name": "What Underground formats are available?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer 6 Sheet LT Panels, 16 Sheet Corridor Panels, Digital Escalator Panels (DEPs), Cross Track Projections (XTPs), and full station takeovers."
          }
        },
        {
          "@type": "Question",
          "name": "How much does London Underground advertising cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Costs vary by format, location, and duration. We provide transparent rate checks showing the actual media owner rate plus our commission."
          }
        },
        {
          "@type": "Question",
          "name": "Can we target specific lines or stations?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We can plan campaigns by station, line, or audience segment using Experian Mosaic and Route data to maximise efficiency."
          }
        },
        {
          "@type": "Question",
          "name": "Do you manage production and approvals?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We handle artwork specs, production, and TfL approvals for all Underground formats."
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
        "name": "Underground Formats",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "6 Sheet LT Panel" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "16 Sheet Corridor Panel" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Digital Escalator Panel" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cross Track Projection" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Full Station Takeover" } }
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
        { "@type": "ListItem", "position": 3, "name": "Underground Advertising", "item": "https://mediabuyinglondon.co.uk/ooh/london-underground" }
      ]
    });
    document.head.appendChild(breadcrumbScript);

    return () => {
      // Clean up scripts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes('Underground') || script.textContent?.includes('underground')) {
          document.head.removeChild(script);
        }
      });
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>London Underground Advertising | Tube OOH Campaign Planning</title>
        <meta name="description" content="Plan and buy London Underground advertising. 6-sheets, 16-sheets, DEPs, XTP, train wraps & full station takeovers. Audience & rate-driven, transparent pricing." />
        <link rel="canonical" href="https://mediabuyinglondon.co.uk/ooh/london-underground" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              London Underground Advertising
            </h1>
            <div className="max-w-5xl mx-auto space-y-6">
              <p className="text-xl text-muted-foreground leading-relaxed">
                The London Underground is more than a transport system — it's one of the most captive and high-value media environments in the world. With over 3 million daily journeys across 270 stations, Tube advertising offers unmatched audience density, long dwell times, and unrivalled reach into London's working, shopping, and leisure population.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're dominating Oxford Circus, targeting commuters in Canary Wharf, or connecting with culture lovers at South Kensington, we combine Experian Mosaic segmentation, Route audience data, and our direct relationships with media owners to deliver Underground campaigns that work — at transparent, unmarked rates.
              </p>
            </div>
          </div>

          {/* Why Underground Works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Why London Underground Works</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Dwell time = message impact</h3>
                  <p className="text-sm text-muted-foreground">Commuters spend minutes, not seconds, with your ad.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Audience precision</h3>
                  <p className="text-sm text-muted-foreground">Target by line, station, journey type, or even borough demographics.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Multiple touchpoints</h3>
                  <p className="text-sm text-muted-foreground">Entrances, corridors, escalators, platforms, train interiors.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Premium environment</h3>
                  <p className="text-sm text-muted-foreground">Trusted, brand-safe, and part of London life.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Digital flexibility</h3>
                  <p className="text-sm text-muted-foreground">Dynamic creative, dayparting, live updates.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Underground Formats */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">London Underground Advertising Formats</h2>
            
            {/* Static Posters & Panels */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                Static Posters & Panels
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">6 Sheet London Underground Panels</h4>
                    <p className="text-sm text-muted-foreground mb-2">Positioned at entrances, exits, concourses, and platforms. Perfect for high-frequency messaging.</p>
                    <p className="text-xs text-muted-foreground italic">(1200mm x 1800mm)</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">16 Sheet Corridor Panels</h4>
                    <p className="text-sm text-muted-foreground mb-2">Dominant corridor placements that commuters walk past at close range.</p>
                    <p className="text-xs text-muted-foreground italic">(2000mm x 3000mm)</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Platform Posters</h4>
                    <p className="text-sm text-muted-foreground">Extended visibility during dwell times on platforms. A1 to 4-sheet sizes.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Digital Formats */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Digital Formats
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Digital Escalator Panels (DEPs)</h4>
                    <p className="text-sm text-muted-foreground">Animated sequences lining escalators; perfect for brand storytelling.</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Cross Track Projections (XTP)</h4>
                    <p className="text-sm text-muted-foreground">Full-motion digital screens facing passengers across the tracks.</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Digital Gateway Screens</h4>
                    <p className="text-sm text-muted-foreground">Large-format digital displays at key entrances/exits.</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Full-Motion Large Format Digital</h4>
                    <p className="text-sm text-muted-foreground">Hero creative moments in premium stations.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Takeovers & Wraps */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                Takeovers & Wraps
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Full Station Takeover</h4>
                    <p className="text-sm text-muted-foreground">Transform every surface into your brand world.</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Train Wraps & Liveries</h4>
                    <p className="text-sm text-muted-foreground">Turn entire trains into moving billboards.</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Tube Car Panels (TCPs)</h4>
                    <p className="text-sm text-muted-foreground">Internal ads within carriages, right in front of seated passengers.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Planning Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">How We Plan Underground Campaigns</h2>
            <div className="grid md:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h3 className="font-semibold mb-2">Briefing</h3>
                  <p className="text-sm text-muted-foreground">Audience, objectives, timing, budget.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h3 className="font-semibold mb-2">Station & Line Mapping</h3>
                  <p className="text-sm text-muted-foreground">Using Route data, footfall reports, and Mosaic segmentation to pinpoint the right mix of stations.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h3 className="font-semibold mb-2">Rate Checking</h3>
                  <p className="text-sm text-muted-foreground">Direct media owner negotiations; your invoice shows exactly what we pay.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                  <h3 className="font-semibold mb-2">Creative & Deployment</h3>
                  <p className="text-sm text-muted-foreground">Static or digital, fully compliant with TfL creative guidelines.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">5</div>
                  <h3 className="font-semibold mb-2">Reporting</h3>
                  <p className="text-sm text-muted-foreground">Post-campaign analysis with proof of posting (POP) and performance metrics.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Key Audience Segments */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Key Audience Segments We Reach</h2>
            <p className="text-center text-muted-foreground mb-8">Using Experian Mosaic, we tailor campaigns to the audience you want:</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">City professionals</h3>
                  <p className="text-sm text-muted-foreground">Bank, Canary Wharf, Liverpool Street.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">High-spend shoppers</h3>
                  <p className="text-sm text-muted-foreground">Bond Street, Knightsbridge, Westfield Stratford.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Cultural explorers</h3>
                  <p className="text-sm text-muted-foreground">South Kensington, Camden Town, Greenwich.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Students & youth culture</h3>
                  <p className="text-sm text-muted-foreground">Camden, Brixton, Stratford.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Commercial Transparency */}
          <section className="mb-16">
            <div className="bg-muted/50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-6 text-center">Commercial Transparency = Your Advantage</h2>
              <p className="text-center text-muted-foreground mb-6">We are not tied into any exclusive media owner deals. That means:</p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-sm">We buy the best sites for your audience, not the sites we're incentivised to sell.</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-sm">You see the actual media cost and our commission, clearly itemised.</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-sm">You get rate-checked pricing against current market averages.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">FAQs: London Underground Advertising</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How much does Tube advertising cost?</h3>
                  <p className="text-muted-foreground">A single 6-sheet can start from £250–£500 per 2 weeks; full takeovers run into six figures. Digital formats carry a premium.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How long should my campaign run?</h3>
                  <p className="text-muted-foreground">Most Underground campaigns run in 2-week cycles; digital can run shorter bursts.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Do you handle creative approvals?</h3>
                  <p className="text-muted-foreground">Yes, we manage TfL's approval process, ensuring your creative meets all technical and compliance requirements.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">📍 Start your London Underground campaign today</h2>
            <p className="text-muted-foreground mb-8">Submit your brief or call us to lock in availability on high-demand formats.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/brief">
                  Submit your brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">
                  Call us now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default LondonUndergroundAdvertising;