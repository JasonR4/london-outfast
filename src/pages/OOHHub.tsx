import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Train, 
  Bus, 
  Car, 
  Plane, 
  ShoppingBag, 
  MapPin, 
  Monitor, 
  Users,
  Building,
  Target,
  ChevronRight,
  Zap
} from 'lucide-react';

const OOHHub = () => {
  useEffect(() => {
    // Inject FAQ Schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is an OOH environment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An OOH environment is the setting in which your advertising appears — such as the Tube, a bus, a shopping mall, or a roadside billboard. Each environment has unique audience profiles and viewing conditions."
          }
        },
        {
          "@type": "Question",
          "name": "How do you choose the right environment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We analyse your target audience, campaign objectives, and budget. Using Experian Mosaic, Route, and location data, we select environments that offer the best reach and ROI."
          }
        },
        {
          "@type": "Question",
          "name": "Can you run a campaign across multiple environments?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — multi-environment campaigns often deliver the strongest results by hitting audiences at different touchpoints."
          }
        },
        {
          "@type": "Question",
          "name": "How transparent is your pricing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We show the exact media owner rate and our commission separately on your invoice — no hidden mark-ups."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer OOH environment planning for agencies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — we provide white-label media buying and rate checks for agencies."
          }
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const transportEnvironments = [
    {
      title: "London Underground Advertising",
      slug: "london-underground",
      description: "Target commuters and tourists with high-impact panels, digital escalators, and cross-track projections.",
      icon: Train
    },
    {
      title: "Rail & Overground Advertising",
      slug: "national-rail-overground",
      description: "Reach millions of passengers on trains, platforms, and station concourses.",
      icon: Train
    },
    {
      title: "Bus & Coach Advertising",
      slug: "bus-advertising",
      description: "Supersides, rears, T-sides, and full wraps delivering street-level visibility.",
      icon: Bus
    },
    {
      title: "Taxi Advertising",
      slug: "taxi-advertising",
      description: "Full liveries, supersides, and tip-seat ads for premium urban reach.",
      icon: Car
    },
    {
      title: "Airport Advertising",
      slug: "airport-advertising",
      description: "Target high-value travellers in terminals, baggage halls, and walkways.",
      icon: Plane
    },
    {
      title: "Bike Hire Dock Advertising",
      slug: "transport-hubs",
      description: "Impact in busy urban areas with dock branding and panels.",
      icon: Target
    }
  ];

  const roadsideEnvironments = [
    {
      title: "Motorway Billboard Advertising",
      slug: "roadside-billboards",
      description: "M6, M25, and other key routes with high-frequency, long-dwell exposure.",
      icon: MapPin
    },
    {
      title: "Urban Roadside Advertising",
      slug: "digital-ooh",
      description: "Digital and static roadside screens in key city locations.",
      icon: Monitor
    },
    {
      title: "Lamp Post Banner Advertising",
      slug: "street-furniture",
      description: "Localised, repeat-impact branding for community and event campaigns.",
      icon: MapPin
    },
    {
      title: "Streetliner Advertising",
      slug: "motorway-service-areas",
      description: "Roadside banners and creative formats along busy streets.",
      icon: Target
    }
  ];

  const retailEnvironments = [
    {
      title: "Shopping Mall Advertising",
      slug: "retail-shopping-mall",
      description: "High-footfall indoor digital and static panels.",
      icon: ShoppingBag
    },
    {
      title: "Supermarket Advertising",
      slug: "retail-shopping-mall",
      description: "In-store, trolley, and car park panels for shopper influence.",
      icon: ShoppingBag
    },
    {
      title: "Leisure Venue Advertising",
      slug: "cinema-advertising",
      description: "Cinemas, gyms, and sports venues targeting engaged audiences.",
      icon: Building
    }
  ];

  const streetEnvironments = [
    {
      title: "Street Poster Advertising",
      slug: "residential-local-area",
      description: "Affordable local reach for community and grassroots marketing.",
      icon: MapPin
    },
    {
      title: "Fly Posting & Wildposting",
      slug: "guerilla-wildposting",
      description: "Cultural, urban, and guerrilla marketing placements.",
      icon: Target
    },
    {
      title: "Street Furniture Advertising",
      slug: "street-furniture",
      description: "Phone kiosks, recycling bins, benches, and other public fixtures.",
      icon: Building
    }
  ];

  const specialistEnvironments = [
    {
      title: "Projection Mapping Advertising",
      slug: "projection-special-builds",
      description: "Immersive, large-scale brand takeovers on buildings and landmarks.",
      icon: Zap
    },
    {
      title: "Experiential & Sampling Activations",
      slug: "experiential-sampling",
      description: "Pop-ups, sampling, and live brand experiences.",
      icon: Users
    },
    {
      title: "Event Venue Advertising",
      slug: "event-stadium-advertising",
      description: "In and around major events, from concerts to sports fixtures.",
      icon: Building
    }
  ];

  const EnvironmentGrid = ({ title, environments, bgColor }: { title: string, environments: any[], bgColor: string }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={bgColor}>{title}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {environments.map((env, index) => {
          const IconComponent = env.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <IconComponent className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  <Link to={`/ooh/${env.slug}`} className="stretched-link">
                    {env.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {env.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>OOH Advertising Environments in London & UK | Media Buying London</title>
        <meta 
          name="description" 
          content="Explore every OOH advertising environment in London and across the UK. From Tube, bus, and roadside billboards to retail, street, and experiential media — we plan, buy, and deliver campaigns fast at unbeatable rates." 
        />
        <link rel="canonical" href="https://mediabuyinglondon.co.uk/ooh" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Header */}
          <div className="text-center space-y-6 mb-16">
            <Badge variant="outline" className="text-primary border-primary/20">
              OOH Environments
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent leading-tight">
              Out-of-Home (OOH) Advertising Environments
            </h1>
            <div className="max-w-4xl mx-auto text-lg text-muted-foreground leading-relaxed space-y-4">
              <p>
                Out-of-Home (OOH) advertising is more than just billboards — it's about placing your message in the right environment, at the right time, to reach the right audience.
              </p>
              <p>
                At Media Buying London, we buy across every major environment in London and the UK, combining audience intelligence (Experian Mosaic, Route, and location data) with rate-driven buying power.
              </p>
              <p>
                Below, you'll find every OOH environment we operate in — each linked to its own detailed page, with formats, audience profiles, and example campaigns.
              </p>
            </div>
          </div>

          {/* Environment Categories */}
          <div className="space-y-12">
            <EnvironmentGrid 
              title="Transport Environments" 
              environments={transportEnvironments}
              bgColor="bg-blue-500/10 text-blue-700 dark:text-blue-300"
            />
            
            <EnvironmentGrid 
              title="Roadside & Large Format" 
              environments={roadsideEnvironments}
              bgColor="bg-green-500/10 text-green-700 dark:text-green-300"
            />
            
            <EnvironmentGrid 
              title="Retail & Leisure" 
              environments={retailEnvironments}
              bgColor="bg-purple-500/10 text-purple-700 dark:text-purple-300"
            />
            
            <EnvironmentGrid 
              title="Street-Level & Community" 
              environments={streetEnvironments}
              bgColor="bg-orange-500/10 text-orange-700 dark:text-orange-300"
            />
            
            <EnvironmentGrid 
              title="Specialist & Experiential" 
              environments={specialistEnvironments}
              bgColor="bg-pink-500/10 text-pink-700 dark:text-pink-300"
            />
          </div>

          {/* Why Environment Matters */}
          <div className="mt-20 mb-16">
            <Card className="border-primary/10 bg-gradient-to-r from-background to-secondary/10">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Why Environment Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Choosing the right environment is critical — it's not just where your ad is seen, it's how your audience experiences it. A Tube panel hits a commuter in a different mindset than a motorway billboard or a projection mapping spectacular.
                </p>
                <div className="space-y-2">
                  <p><strong>We use:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Experian Mosaic segmentation to match environments to audience types.</li>
                    <li>• Route & Location Analyst data to calculate reach, frequency, and dwell time.</li>
                    <li>• Transparent Rate Checks — the rate you pay is the rate we pay, with our commission shown separately.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-2xl font-bold">Ready to plan your OOH campaign?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                <Link to="/brief">Submit Your Brief</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/client-portal">Client Portal</Link>
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions about OOH Environments</h2>
            <div className="grid gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: "What is an OOH environment?",
                  a: "An OOH environment is the setting in which your advertising appears — such as the Tube, a bus, a shopping mall, or a roadside billboard. Each environment has unique audience profiles and viewing conditions."
                },
                {
                  q: "How do you choose the right environment?",
                  a: "We analyse your target audience, campaign objectives, and budget. Using Experian Mosaic, Route, and location data, we select environments that offer the best reach and ROI."
                },
                {
                  q: "Can you run a campaign across multiple environments?",
                  a: "Yes — multi-environment campaigns often deliver the strongest results by hitting audiences at different touchpoints."
                },
                {
                  q: "How transparent is your pricing?",
                  a: "We show the exact media owner rate and our commission separately on your invoice — no hidden mark-ups."
                },
                {
                  q: "Do you offer OOH environment planning for agencies?",
                  a: "Yes — we provide white-label media buying and rate checks for agencies."
                }
              ].map((faq, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OOHHub;