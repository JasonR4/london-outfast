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
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState("");
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
      title: "Programmatic DOOH (pDOOH)",
      formats: [
        "Real-time, data-driven DOOH inventory across all D6, D48, and LFD formats",
        "(Audience-targeted via platforms like Vistar, Hivestack, or Broadsign Reach)"
      ]
    },
    {
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

  const londonAreas = [
    {
      zone: "CENTRAL LONDON (Zone 1)",
      color: "bg-blue-500",
      areas: ["Westminster", "Soho", "Mayfair", "Covent Garden", "Holborn", "Fitzrovia", "Bloomsbury", "Marylebone", "Pimlico", "Belgravia", "St James's", "City of London", "Clerkenwell", "Barbican", "Farringdon", "King's Cross", "South Bank", "Waterloo", "Temple"]
    },
    {
      zone: "WEST LONDON",
      color: "bg-green-500",
      areas: ["Notting Hill", "Chelsea", "Kensington", "Earl's Court", "Ladbroke Grove", "South Kensington", "Holland Park", "North Kensington", "West Brompton", "Hammersmith", "Fulham", "Shepherd's Bush", "White City", "West Kensington", "Parsons Green", "Sands End", "Ealing", "Acton", "Hanwell", "Southall", "Northolt", "Greenford", "Perivale"]
    },
    {
      zone: "NORTH LONDON", 
      color: "bg-yellow-500",
      areas: ["Camden Town", "Hampstead", "Belsize Park", "Kentish Town", "Gospel Oak", "Swiss Cottage", "West Hampstead", "Chalk Farm", "Angel", "Highbury", "Islington", "Holloway", "Barnsbury", "Canonbury", "Finsbury", "Archway", "Finchley", "Golders Green", "Hendon", "Mill Hill", "Edgware", "Burnt Oak", "East Barnet", "Totteridge", "Colindale", "Tottenham", "Wood Green", "Muswell Hill", "Crouch End", "Hornsey", "Bounds Green", "Seven Sisters", "Highgate"]
    },
    {
      zone: "EAST LONDON",
      color: "bg-red-500", 
      areas: ["Hackney Central", "Dalston", "Shoreditch", "Hoxton", "Stoke Newington", "London Fields", "Homerton", "Haggerston", "Canary Wharf", "Whitechapel", "Bethnal Green", "Bow", "Mile End", "Poplar", "Wapping", "Limehouse", "Shadwell", "Stratford", "Plaistow", "East Ham", "West Ham", "Canning Town", "Forest Gate", "Manor Park", "Beckton", "Custom House", "Walthamstow", "Leyton", "Leytonstone", "Chingford", "Highams Park", "Whipps Cross"]
    },
    {
      zone: "SOUTH LONDON",
      color: "bg-purple-500",
      areas: ["Brixton", "Clapham", "Streatham", "Vauxhall", "Kennington", "Norwood", "Stockwell", "Waterloo (South)", "Tulse Hill", "Peckham", "Bermondsey", "Camberwell", "Dulwich", "Elephant & Castle", "Rotherhithe", "Surrey Quays", "Nunhead", "East Dulwich", "Herne Hill", "Lewisham", "Catford", "Deptford", "New Cross", "Brockley", "Hither Green", "Sydenham", "Forest Hill", "Lee", "Croydon Town Centre", "Purley", "South Norwood", "Thornton Heath", "Addiscombe", "Selhurst", "Coulsdon", "Crystal Palace"]
    },
    {
      zone: "SOUTH WEST LONDON",
      color: "bg-orange-500",
      areas: ["Battersea", "Wandsworth Town", "Tooting", "Balham", "Putney", "Earlsfield", "Southfields", "Richmond", "Twickenham", "Kew", "Barnes", "Mortlake", "Sheen", "Hampton", "Teddington", "Whitton", "Kingston", "Surbiton", "New Malden", "Norbiton", "Tolworth", "Chessington"]
    },
    {
      zone: "NORTH WEST LONDON",
      color: "bg-amber-600",
      areas: ["Wembley", "Harlesden", "Kilburn", "Neasden", "Willesden", "Queensbury", "Stonebridge", "Kingsbury", "Harrow", "Wealdstone", "Stanmore", "Pinner", "Rayners Lane", "Hatch End"]
    },
    {
      zone: "OUTER EAST / SOUTH EAST",
      color: "bg-yellow-600", 
      areas: ["Bexleyheath", "Sidcup", "Crayford", "Erith", "Welling", "Belvedere", "Bromley", "Beckenham", "Orpington", "Chislehurst", "West Wickham", "Biggin Hill", "Penge"]
    },
    {
      zone: "HIGH-STREETS / HUBS",
      color: "bg-pink-500",
      areas: ["Oxford Street", "Regent Street", "Bond Street", "The Strand", "Old Street Roundabout", "Brick Lane", "Camden High Street", "Kings Road", "Westfield London (Shepherd's Bush)", "Westfield Stratford", "Carnaby Street", "Borough Market", "Liverpool Street", "Leicester Square", "Tottenham Court Road", "Victoria Station", "London Bridge", "King's Cross/St Pancras"]
    }
  ];

  const handleFormatToggle = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const filteredAreas = londonAreas.map(zone => ({
    ...zone,
    areas: zone.areas.filter(area => 
      area.toLowerCase().includes(locationSearch.toLowerCase())
    )
  })).filter(zone => zone.areas.length > 0);

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
      selectedLocations,
      submittedAt: new Date().toISOString()
    };

    console.log("Quote submission data for HubSpot:", quoteData);
    
    toast({
      title: "Quote Request Submitted!",
      description: "We'll get back to you with a custom quote within hours. Check your email!"
    });

    // Reset form
    setSelectedFormats([]);
    setSelectedLocations([]);
    setLocationSearch("");
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
            GET YOUR CUSTOM QUOTE
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
            {/* Selected Formats Summary */}
            {selectedFormats.length > 0 && (
              <Card className="bg-gradient-card border-border mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Your Selected Formats ({selectedFormats.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFormats.map((format, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <span className="text-sm text-foreground">{format}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFormatToggle(format)}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFormats([])}
                      className="w-full"
                    >
                      Clear All Selections
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Selection */}
            <Card className="bg-gradient-card border-border mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Target London Areas</CardTitle>
                <p className="text-muted-foreground">
                  Search and select your preferred locations • {selectedLocations.length} selected
                </p>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="mb-4">
                  <Input
                    placeholder="Search London areas..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                {/* Selected Locations Summary */}
                {selectedLocations.length > 0 && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Selected Areas ({selectedLocations.length})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLocations([])}
                        className="text-xs h-6"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocations.slice(0, 8).map((location, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                      {selectedLocations.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedLocations.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Areas List */}
                <div className="max-h-80 overflow-y-auto space-y-4">
                  {filteredAreas.map((zone, zoneIndex) => (
                    <div key={zoneIndex}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-3 h-3 rounded-full ${zone.color}`}></div>
                        <h4 className="font-semibold text-sm text-foreground">{zone.zone}</h4>
                        <Badge variant="outline" className="text-xs">
                          {zone.areas.filter(area => selectedLocations.includes(area)).length}/{zone.areas.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pl-5">
                        {zone.areas.map((area, areaIndex) => (
                          <div key={areaIndex} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location-${zoneIndex}-${areaIndex}`}
                              checked={selectedLocations.includes(area)}
                              onCheckedChange={() => handleLocationToggle(area)}
                              className="data-[state=checked]:bg-london-red data-[state=checked]:border-london-red"
                            />
                            <Label 
                              htmlFor={`location-${zoneIndex}-${areaIndex}`}
                              className="text-xs cursor-pointer hover:text-accent transition-colors"
                            >
                              {area}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {filteredAreas.length === 0 && locationSearch && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No areas found matching "{locationSearch}"</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLocationSearch("")}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                    Get My Custom Quote
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