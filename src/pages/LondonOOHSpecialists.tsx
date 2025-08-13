import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, Zap, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const LondonOOHSpecialists = () => {
  const formats = [
    {
      title: "Billboards (48-Sheet & Digital-48)",
      description: "Dominant roadside locations with exceptional visibility."
    },
    {
      title: "Premium Digital Screens", 
      description: "High-footfall retail and leisure environments."
    },
    {
      title: "Street-Level Displays",
      description: "Strategically positioned panels for pedestrian engagement."
    },
    {
      title: "Building Wraps & Landmark Sites",
      description: "Large-format impact in key commercial districts."
    },
    {
      title: "Special Builds & Experiential",
      description: "Bespoke, creative executions for maximum attention."
    }
  ];

  const services = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Strategic Planning",
      description: "Formats and locations are matched precisely to audience profiles and campaign objectives."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Competitive Rates", 
      description: "Direct buying relationships with media owners secure premium placements at lower costs."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Creative Impact",
      description: "Messages are designed and executed for maximum attention."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Full Campaign Management",
      description: "Every stage, from planning to reporting, is delivered with precision."
    }
  ];

  const caseStudies = [
    {
      title: "Retail launch campaign",
      description: "Multi-format OOH blitz reaching over 2.5 million Londoners."
    },
    {
      title: "Commercial brand awareness", 
      description: "Landmark billboards and digital displays delivering a 38% uplift in brand recall."
    }
  ];

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "London OOH Specialists",
    "description": "London OOH specialists delivering targeted outdoor advertising campaigns. From billboards to digital screens, campaigns are planned, bought, and delivered at unbeatable market rates.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "London",
      "addressCountry": "GB"
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 51.5074,
        "longitude": -0.1278
      },
      "geoRadius": "50000"
    },
    "service": [
      {
        "@type": "Service",
        "name": "Billboard Advertising",
        "description": "48-sheet and digital billboard advertising across London"
      },
      {
        "@type": "Service", 
        "name": "Outdoor Advertising",
        "description": "Comprehensive outdoor advertising campaigns in London"
      },
      {
        "@type": "Service",
        "name": "OOH Campaign Management", 
        "description": "End-to-end OOH campaign planning and management"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>London OOH Specialists | Targeted Outdoor Advertising in London</title>
        <meta 
          name="description" 
          content="London OOH specialists delivering targeted outdoor advertising campaigns. From billboards to digital screens, campaigns are planned, bought, and delivered at unbeatable market rates." 
        />
        <meta name="keywords" content="London OOH specialists, cheap OOH media London, targeted OOH London, billboard advertising London, outdoor advertising London, OOH campaign management" />
        <link rel="canonical" href="https://mediabuyinglondon.co.uk/london-ooh-specialists" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="London OOH Specialists | Targeted Outdoor Advertising in London" />
        <meta property="og:description" content="London OOH specialists delivering targeted outdoor advertising campaigns. From billboards to digital screens, campaigns are planned, bought, and delivered at unbeatable market rates." />
        <meta property="og:url" content="https://mediabuyinglondon.co.uk/london-ooh-specialists" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="London OOH Specialists | Targeted Outdoor Advertising in London" />
        <meta name="twitter:description" content="London OOH specialists delivering targeted outdoor advertising campaigns. From billboards to digital screens, campaigns are planned, bought, and delivered at unbeatable market rates." />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6" variant="secondary">
                London OOH Specialists
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                London OOH Specialists – Outdoor Advertising That Delivers
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground sm:text-xl">
                In London's competitive media landscape, visibility is everything. London OOH specialists combine precision targeting with competitive market rates to deliver campaigns that stand out. From landmark billboards and premium digital screens to targeted street-level displays, each campaign is built on data insight, creative execution, and end-to-end management.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="px-8">
                  <Link to="/outdoor-media">
                    Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link to="/contact">Contact Specialists</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose OOH Section */}
        <section className="py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-3xl font-bold text-foreground">Why Choose OOH Advertising in London?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                London offers one of the most diverse and high-impact outdoor media environments in the world. With millions of daily impressions and audiences ranging from local residents to global visitors, <strong>OOH advertising</strong> is a powerful way to build awareness and drive action. Whether the objective is a city-wide launch or hyper-local engagement, well-placed <strong>advertising campaigns</strong> deliver measurable results.
              </p>
            </div>
          </div>
        </section>

        {/* How We Deliver Results */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground">How London OOH Specialists Deliver Results</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {services.map((service, index) => (
                  <Card key={index} className="border-0 bg-background/60 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {service.icon}
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {service.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* OOH Formats */}
        <section className="py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground">OOH Formats Available Across London</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {formats.map((format, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{format.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {format.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-6 text-muted-foreground">
                  From <strong>billboard advertising</strong> to innovative <strong>outdoor advertising</strong> solutions, our London specialists help you reach your <strong>target audience</strong> effectively.
                </p>
                <Button asChild size="lg">
                  <Link to="/outdoor-media">
                    View All Formats <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground">London Campaigns That Made an Impact</h2>
              <p className="mb-8 text-center text-muted-foreground">
                From seasonal pushes to high-profile launches, London OOH campaigns have delivered millions of impressions for brands in multiple sectors. Examples include:
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {caseStudies.map((study, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{study.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {study.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-6 text-3xl font-bold text-foreground">Start Your London OOH Campaign Today</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Access prime placements, competitive rates, and specialist campaign delivery. Our quoting system covers every major OOH format in London.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="px-8">
                  <Link to="/outdoor-media">
                    Request a Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link to="/brief">Get Campaign Brief</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default LondonOOHSpecialists;