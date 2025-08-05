import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const QuoteForm = () => {
  const { toast } = useToast();
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    budget: "",
    timeline: "",
    campaignObjective: "",
    targetAudience: "",
    preferredLocations: "",
    additionalDetails: ""
  });

  const oohCategories = [
    {
      emoji: "🏙️",
      title: "Classic & Digital Roadside",
      formats: [
        "48-sheet Billboard (Classic or D48)",
        "96-sheet Billboard (Classic or D96)", 
        "Mega 6 (M6) – premium large-format roadside digital screen",
        "Lamp Post Banners",
        "Street Liners"
      ]
    },
    {
      emoji: "🚇",
      title: "London Underground (TfL)",
      formats: [
        "6-sheet (LT Panel) – station entrance/exit points",
        "16-sheet (Corridor Panels)",
        "Digital Escalator Panels (DEPs) – animated motion escalator runs",
        "Cross-Track Projection (XTPs) – digital projection visible from platform",
        "Tube Car Panels (TCPs) – inside train carriages",
        "Train Wraps / External Liveries",
        "Full Station Takeovers – wall wraps, floor vinyls, etc."
      ]
    },
    {
      emoji: "🚉",
      title: "National Rail & Commuter Rail",
      formats: [
        "Rail 6-sheets",
        "Digital 6-sheets (D6)",
        "48/96-sheet Station Billboards",
        "Station Gateway Screens",
        "Platform Posters",
        "Rail Panel Takeovers",
        "Passenger Bridge Panels"
      ]
    },
    {
      emoji: "🚌",
      title: "Bus Advertising",
      formats: [
        "Superside",
        "T-side",
        "Rear Panel", 
        "Streetliner",
        "Mega Rear",
        "Interior Panels (Headliners / Seatbacks)",
        "Full Bus Wrap / Livery"
      ]
    },
    {
      emoji: "🚖",
      title: "Taxi Advertising",
      formats: [
        "Full Livery Wrap",
        "Super Side Panel",
        "Tip Seat Panels (Interior)",
        "Back Window Panel",
        "Taxi Digital Roof Screens (via Adverttu / Firefly)"
      ]
    },
    {
      emoji: "🧱",
      title: "Retail & Leisure Environments",
      formats: [
        "Mall D6s / Digital Portrait Panels",
        "Lift & Escalator Wraps",
        "Supermarket Screens (e.g. ASDA Live, Tesco Screens)",
        "In-store Digital Panels",
        "Point-of-Sale Displays"
      ]
    },
    {
      emoji: "✈️",
      title: "Airports",
      formats: [
        "Digital 6-sheets",
        "Large Format Digital (LFDs)",
        "Baggage Carousel Branding",
        "Walkway Panels",
        "Duty-Free Store Takeovers",
        "Full Environmental Wraps"
      ]
    },
    {
      emoji: "📞",
      title: "Street Furniture",
      formats: [
        "Phone Kiosks / InLink Panels",
        "Kiosk 6-sheets",
        "Recycling Bins / Ad-bins",
        "Park Benches / Branded Seating",
        "Bike Hire Dock Panels (e.g., Santander Cycles)"
      ]
    },
    {
      emoji: "🧠",
      title: "Programmatic DOOH (pDOOH)",
      formats: [
        "Real-time, data-driven DOOH inventory across all D6, D48, and LFD formats",
        "(Audience-targeted via platforms like Vistar, Hivestack, or Broadsign Reach)"
      ]
    },
    {
      emoji: "🔥",
      title: "Ambient / Guerrilla OOH",
      formats: [
        "Flyposting / Wildposting",
        "Experiential Pop-Ups",
        "Projection Mapping",
        "Chalk Stencils / Clean Graffiti",
        "Hand-to-hand Leafleting",
        "Sampling Stunts / Flash Mobs"
      ]
    }
  ];

  const handleFormatToggle = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFormats.length === 0) {
      toast({
        title: "Please select at least one OOH format",
        description: "Choose the formats you're interested in to get an accurate quote.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Please fill in required fields",
        description: "First name, last name, and email are required.",
        variant: "destructive"
      });
      return;
    }

    // Here you would integrate with HubSpot
    const quoteData = {
      ...formData,
      selectedFormats,
      submittedAt: new Date().toISOString()
    };

    console.log("Quote submission data for HubSpot:", quoteData);
    
    toast({
      title: "Quote Request Submitted! 🚀",
      description: "We'll get back to you with a custom quote within hours. Check your email!"
    });

    // Reset form
    setSelectedFormats([]);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      budget: "",
      timeline: "",
      campaignObjective: "",
      targetAudience: "",
      preferredLocations: "",
      additionalDetails: ""
    });
  };

  return (
    <section id="quote-form" className="py-20 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 text-lg px-6 py-2 animate-pulse-glow">
            🚀 GET YOUR CUSTOM QUOTE
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Choose Your Formats
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the OOH formats you're interested in and we'll get you a custom quote within hours
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Format Selection */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Select OOH Formats</CardTitle>
                <p className="text-muted-foreground">
                  Choose multiple formats • {selectedFormats.length} selected
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {oohCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{category.emoji}</span>
                      <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {category.formats.filter(format => selectedFormats.includes(format)).length}/{category.formats.length}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-3 pl-8">
                      {category.formats.map((format, formatIndex) => (
                        <div key={formatIndex} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${categoryIndex}-${formatIndex}`}
                            checked={selectedFormats.includes(format)}
                            onCheckedChange={() => handleFormatToggle(format)}
                            className="data-[state=checked]:bg-london-red data-[state=checked]:border-london-red"
                          />
                          <Label 
                            htmlFor={`${categoryIndex}-${formatIndex}`}
                            className="text-sm cursor-pointer hover:text-accent transition-colors"
                          >
                            {format}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">Your Details</CardTitle>
                <p className="text-muted-foreground">
                  Get your custom quote within hours
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Smith"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@company.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+44 20 1234 5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Your Company Ltd"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yoursite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select onValueChange={(value) => handleInputChange("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-1k">Under £1,000</SelectItem>
                        <SelectItem value="1k-5k">£1,000 - £5,000</SelectItem>
                        <SelectItem value="5k-10k">£5,000 - £10,000</SelectItem>
                        <SelectItem value="10k-25k">£10,000 - £25,000</SelectItem>
                        <SelectItem value="25k-50k">£25,000 - £50,000</SelectItem>
                        <SelectItem value="50k-100k">£50,000 - £100,000</SelectItem>
                        <SelectItem value="100k-250k">£100,000 - £250,000</SelectItem>
                        <SelectItem value="250k-500k">£250,000 - £500,000</SelectItem>
                        <SelectItem value="over-500k">Over £500,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeline">Campaign Timeline</Label>
                    <Select onValueChange={(value) => handleInputChange("timeline", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you want to go live?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP (within 1 week)</SelectItem>
                        <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                        <SelectItem value="1-2-months">1-2 months</SelectItem>
                        <SelectItem value="3-6-months">3-6 months</SelectItem>
                        <SelectItem value="planning">Just planning ahead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="campaignObjective">Campaign Objective</Label>
                    <Select onValueChange={(value) => handleInputChange("campaignObjective", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="What's your main goal?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                        <SelectItem value="product-launch">Product Launch</SelectItem>
                        <SelectItem value="event-promotion">Event Promotion</SelectItem>
                        <SelectItem value="footfall">Drive Footfall</SelectItem>
                        <SelectItem value="sales">Increase Sales</SelectItem>
                        <SelectItem value="recruitment">Recruitment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                      placeholder="e.g., 25-40 year old professionals"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredLocations">Preferred London Areas</Label>
                    <Input
                      id="preferredLocations"
                      value={formData.preferredLocations}
                      onChange={(e) => handleInputChange("preferredLocations", e.target.value)}
                      placeholder="e.g., Zone 1, Shoreditch, Camden"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalDetails">Additional Details</Label>
                    <Textarea
                      id="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
                      placeholder="Any specific requirements, creative needs, or questions..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-lg py-6 shadow-glow"
                    disabled={selectedFormats.length === 0}
                  >
                    Get My Custom Quote 🚀
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Same-day quotes • No obligation • Best price guarantee
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;