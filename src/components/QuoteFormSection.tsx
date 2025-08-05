import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface QuoteFormSectionProps {
  prefilledFormats: string[];
  budgetRange: string;
  campaignObjective: string;
  targetAudience: string;
  onBack: () => void;
}

const QuoteFormSection = ({ 
  prefilledFormats, 
  budgetRange, 
  campaignObjective, 
  targetAudience, 
  onBack 
}: QuoteFormSectionProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    timeline: "",
    additionalDetails: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Please fill in required fields",
        description: "First name, last name, and email are required.",
        variant: "destructive"
      });
      return;
    }

    const quoteData = {
      ...formData,
      selectedFormats: prefilledFormats,
      budgetRange,
      campaignObjective,
      targetAudience,
      submittedAt: new Date().toISOString(),
      source: "configurator"
    };

    console.log("Configurator quote submission:", quoteData);
    
    toast({
      title: "Quote Request Submitted!",
      description: "We'll get back to you with a custom quote within hours. Check your email!"
    });

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      timeline: "",
      additionalDetails: ""
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recommendations
        </Button>
        
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            CUSTOM QUOTE REQUEST
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Get Your Personalized Quote
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Based on your preferences, we've pre-selected the best OOH formats for you. 
            Complete your details below to receive a custom quote within hours.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recommended Formats */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Your Recommended Formats</CardTitle>
              <p className="text-muted-foreground">
                Based on your configurator responses • {prefilledFormats.length} formats selected
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {prefilledFormats.map((format, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="font-medium text-foreground">{format}</span>
                    </div>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Summary */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Campaign Summary</CardTitle>
              <p className="text-muted-foreground">
                Based on your configurator responses
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Budget Range</Label>
                  <p className="text-lg font-semibold">{budgetRange}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campaign Objective</Label>
                  <p className="text-lg font-semibold">{campaignObjective}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Target Audience</Label>
                  <p className="text-lg font-semibold">{targetAudience}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Format Count</Label>
                  <p className="text-lg font-semibold">{prefilledFormats.length} formats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-card border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Your Details</CardTitle>
              <p className="text-muted-foreground">
                Complete to receive your custom quote
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="www.yourcompany.com"
                  />
                </div>

                <div>
                  <Label htmlFor="timeline">Preferred Start Date</Label>
                  <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="When do you want to start?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP (within 1 week)</SelectItem>
                      <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                      <SelectItem value="1-2-months">1-2 months</SelectItem>
                      <SelectItem value="3-months">3+ months</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="additionalDetails">Additional Requirements</Label>
                  <Textarea
                    id="additionalDetails"
                    value={formData.additionalDetails}
                    onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                    placeholder="Any specific locations, creative requirements, or other details..."
                    rows={3}
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important Notice</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Specific locations and availability will be confirmed before booking. 
                        This quote is preliminary and subject to final location availability and confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  size="lg"
                >
                  Get My Custom Quote
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll respond within hours with your custom quote and available locations
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteFormSection;