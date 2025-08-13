import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCentralizedMediaFormats } from "@/hooks/useCentralizedMediaFormats";
import { useMediaFormatsContext } from "@/components/providers/MediaFormatsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Search, CheckCircle, Target, Zap, BarChart3 } from "lucide-react";

const FormatDirectory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { mediaFormats, loading, refetch } = useCentralizedMediaFormats();
  const { mediaFormats: ctxFormats, service } = useMediaFormatsContext();

  const combinedFormats = mediaFormats.length ? mediaFormats : ctxFormats;
  
  useEffect(() => {
    refetch();
    if (combinedFormats.length === 0) {
      // Trigger a service refresh as a fallback
      service.fetchFormats(false).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Get unique format categories from CMS categories
  const categories = Array.from(
    new Set(
      combinedFormats.flatMap((format) => format.categories?.location ?? [])
    )
  ).filter(Boolean).sort();
  
  const filteredFormats = combinedFormats.filter((format) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = format.format_name.toLowerCase().includes(q);
    const descMatch = (format.description || '').toLowerCase().includes(q);
    const categoryTexts = [
      ...(format.categories?.format ?? []),
      ...(format.categories?.location ?? []),
    ].map((c) => c.toLowerCase());
    const categorySearchMatch = q ? categoryTexts.some((c) => c.includes(q)) : true;
    const matchesSearch = nameMatch || descMatch || categorySearchMatch;

    const matchesCategory =
      selectedCategory === 'all' || (format.categories?.format ?? []).includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });
  
  const handleFormatClick = (slug: string) => {
    navigate(`/outdoor-media/${slug}`);
  };

  const handleGetQuote = () => {
    navigate("/quote");
  };

  const whyUseFeatures = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "One-Stop Access",
      description: "All major London OOH formats and locations in one place."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Quotes", 
      description: "Get rates fast without multiple supplier calls."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Competitive Pricing",
      description: "Direct buying power means cost savings on premium placements."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Campaign Support",
      description: "From quote to live campaign tracking, every detail is handled."
    }
  ];

  const channelsAvailable = [
    "Billboards (48-Sheet & Digital-48) – Dominant roadside coverage.",
    "Premium Digital Screens – High-footfall retail and leisure sites.",
    "Street-Level Panels – Target pedestrians in key boroughs.",
    "Building Wraps & Landmarks – Large-format visibility in high-traffic areas.",
    "Special Builds & Experiential – Creative installations for maximum impact."
  ];

  const campaignExamples = [
    {
      title: "Citywide Retail Awareness",
      description: "Multi-channel OOH blitz combining billboards, digital screens, and street furniture."
    },
    {
      title: "Borough-Specific Targeting",
      description: "Outdoor media mix focused on high-footfall commercial zones."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Outdoor Media Buying London | OOH Advertising Quotes & Campaign Planning</title>
        <meta 
          name="description" 
          content="Outdoor media buying in London with instant quotes and a dedicated client portal. Access all OOH channels and receive a full media schedule with precise locations." 
        />
        <meta name="keywords" content="outdoor media buying London, OOH advertising quotes, billboard advertising London, campaign planning, media schedule, client portal" />
        <link rel="canonical" href="https://mediabuyinglondon.co.uk/outdoor-media" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Outdoor Media Buying London | OOH Advertising Quotes & Campaign Planning" />
        <meta property="og:description" content="Outdoor media buying in London with instant quotes and a dedicated client portal. Access all OOH channels and receive a full media schedule with precise locations." />
        <meta property="og:url" content="https://mediabuyinglondon.co.uk/outdoor-media" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Outdoor Media Buying London | OOH Advertising Quotes & Campaign Planning" />
        <meta name="twitter:description" content="Outdoor media buying in London with instant quotes and a dedicated client portal. Access all OOH channels and receive a full media schedule with precise locations." />
      </Helmet>

      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            OUTDOOR MEDIA BUYING LONDON
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Outdoor Media Buying in London – Quote & Campaign Planning
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            <strong>Outdoor media buying in London</strong> requires speed, precision, and clear campaign planning. This quoting hub provides instant access to rates and availability across every major <strong>OOH format</strong> — from high-impact roadside billboards to targeted street-level displays. Once confirmed, campaigns are delivered with detailed media schedules, precise site locations, and full transparency through the client portal.
          </p>
          <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
            Request Your Outdoor Media Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Why Use This Tool Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Why Use This Outdoor Media Buying Tool?</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {whyUseFeatures.map((feature, index) => (
                <Card key={index} className="border-0 bg-background/60 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Channels Available Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Channels Available for Booking</h2>
            <div className="grid gap-4">
              {channelsAvailable.map((channel, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-background/80 p-4">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">{channel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Select Your Formats</h3>
                    <p className="text-sm text-muted-foreground">Choose preferred channels and locations from the quoting tool.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Submit Your Campaign Brief</h3>
                    <p className="text-sm text-muted-foreground">Provide objectives, timelines, and budget.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Receive a Full Media Schedule</h3>
                    <p className="text-sm text-muted-foreground">Delivered via the client portal with precise site addresses, format specifications, and campaign dates.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Approve & Launch</h3>
                    <p className="text-sm text-muted-foreground">Confirm your plan and track delivery progress through the portal.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Examples Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Campaign Examples</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {campaignExamples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{example.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {example.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search formats, categories, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground">
              Showing {filteredFormats.length} of {combinedFormats.length} formats
            </p>
          </div>
        </div>
      </section>

      {/* Format Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Available OOH Formats</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFormats.map((format) => (
              <Card key={format.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleFormatClick(format.format_slug)}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {format.dimensions || 'Various Sizes'}
                    </Badge>
                    <Badge variant="secondary">
                      OOH Format
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {format.format_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {format.description || 'Professional outdoor advertising format available across London.'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {format.dimensions && (
                      <div className="text-xs">
                        <span className="font-medium">Size:</span> {format.dimensions}
                      </div>
                    )}
                    <div className="text-xs">
                      <span className="font-medium">Format:</span> {format.format_name}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Status:</span> {format.is_active ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link to={`/outdoor-media/${format.format_slug}`}>
                        Learn More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredFormats.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No formats found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filter criteria
              </p>
              <Button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">{combinedFormats.length}+</div>
                <h3 className="font-semibold">Format Types</h3>
                <p className="text-sm text-muted-foreground">Available across London</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">32</div>
                <h3 className="font-semibold">London Boroughs</h3>
                <p className="text-sm text-muted-foreground">Complete coverage</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <h3 className="font-semibold">Quote Turnaround</h3>
                <p className="text-sm text-muted-foreground">Same-day response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <h3 className="font-semibold">Price Guarantee</h3>
                <p className="text-sm text-muted-foreground">Best rates in London</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Request Your Outdoor Media Quote
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start planning today. Whether you're running a single-site campaign or a multi-format takeover, the quoting hub and client portal deliver the speed, clarity, and precision needed to make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
              START YOUR OUTDOOR MEDIA QUOTE
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = "tel:+442045243019"}>
              CALL: +44 204 524 3019
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default FormatDirectory;