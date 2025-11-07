import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertTriangle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackBriefSubmission } from '@/utils/analytics';

interface QuoteFormSectionProps {
  prefilledFormats: string[];
  budgetRange: string;
  campaignObjective: string;
  targetAudience: string;
  selectedLocations?: string[];
  selectedPeriods?: number[];
  creativeNeeds?: string;
  onBack: () => void;
}

const QuoteFormSection = ({ 
  prefilledFormats, 
  budgetRange, 
  campaignObjective, 
  targetAudience,
  selectedLocations = [],
  selectedPeriods = [],
  creativeNeeds = "",
  onBack 
}: QuoteFormSectionProps) => {
  const { toast } = useToast();
  const [inchargePeriods, setInchargePeriods] = useState<any[]>([]);
  
  // Helper function to estimate quote value based on budget range and format count
  const getEstimatedQuoteValue = (budgetRange: string, formatCount: number): number => {
    const budgetMap: { [key: string]: number } = {
      '£5,000 - £10,000': 7500,
      '£10,000 - £25,000': 17500,
      '£25,000 - £50,000': 37500,
      '£50,000 - £100,000': 75000,
      '£100,000+': 125000
    };
    
    const baseBudget = budgetMap[budgetRange] || 10000;
    // Adjust based on format count (more formats = higher value)
    return Math.round(baseBudget * Math.max(1, formatCount * 0.5));
  };
  
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

  // Fetch incharge periods to display actual dates
  useEffect(() => {
    const fetchInchargePeriods = async () => {
      try {
        const { data, error } = await supabase
          .from('incharge_periods')
          .select('*')
          .order('period_number', { ascending: true });
        
        if (error) throw error;
        setInchargePeriods(data || []);
      } catch (error) {
        console.error('Error fetching incharge periods:', error);
      }
    };

    // Always fetch periods, not just when selectedPeriods has data
    fetchInchargePeriods();
  }, [selectedPeriods]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      selectedLocations,
      selectedPeriods,
      creativeNeeds,
      submittedAt: new Date().toISOString(),
      source: "configurator"
    };

    // Sync to HubSpot
    try {
      const hubspotData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        company: formData.company,
        submissionType: 'configurator_quote' as const,
        quoteDetails: {
          selectedFormats: prefilledFormats,
          selectedLocations,
          budgetRange,
          campaignObjective,
          targetAudience,
          timeline: formData.timeline,
          additionalDetails: formData.additionalDetails
        }
      };

      const response = await supabase.functions.invoke('sync-hubspot-contact', {
        body: hubspotData
      });

      if (response.error) {
        console.error('Error syncing to HubSpot:', response.error);
        toast({
          title: "Quote request submitted",
          description: "There was an issue with our tracking, but your quote request was received. We'll contact you soon!",
          variant: "default"
        });
      } else {
        console.log('Successfully synced configurator quote to HubSpot');
        
        // Track conversion in Google Analytics
        // Estimate brief value based on format count and budget range
        const estimatedValue = getEstimatedQuoteValue(budgetRange, prefilledFormats.length);
        trackBriefSubmission({
          briefId: `configurator-${Date.now()}`,
          totalValue: estimatedValue,
          itemCount: prefilledFormats.length,
          contactEmail: formData.email,
          contactCompany: formData.company
        });
        
        toast({
          title: "Quote Request Submitted!",
          description: "We'll get back to you with a custom quote within hours. Check your email!"
        });
      }
    } catch (error) {
      console.error('Error syncing to HubSpot:', error);
      toast({
        title: "Quote request submitted",
        description: "There was an issue with our tracking, but your quote request was received. We'll contact you soon!",
        variant: "default"
      });
    }

    console.log("Configurator quote submission:", quoteData);

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

          {/* Campaign Summary - ALWAYS VISIBLE */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">🎯 Complete Campaign Summary</CardTitle>
              <p className="text-muted-foreground">
                All your configurator selections and requirements
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
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
                
                {selectedLocations.length > 0 && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Priority Locations</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedLocations.slice(0, 8).map((location, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
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
                
                {selectedPeriods.length > 0 && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Campaign Periods & Dates
                    </Label>
                    <div className="space-y-2 mt-2">
                      {selectedPeriods.slice(0, 4).map((periodNum, index) => {
                        const period = inchargePeriods.find(p => p.period_number === periodNum);
                        return (
                          <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">Period {periodNum}</div>
                              {period && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(period.start_date).toLocaleDateString('en-GB', { 
                                    day: 'numeric', 
                                    month: 'short' 
                                  })} - {new Date(period.end_date).toLocaleDateString('en-GB', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })}
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              2 weeks
                            </Badge>
                          </div>
                        );
                      })}
                      {selectedPeriods.length > 4 && (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          +{selectedPeriods.length - 4} more periods selected
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                        <strong>Total: {selectedPeriods.length} periods</strong> ({selectedPeriods.length * 2} weeks)
                      </div>
                    </div>
                  </div>
                )}
                
                {creativeNeeds && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Creative Requirements</Label>
                    <p className="text-sm mt-1">{creativeNeeds}</p>
                  </div>
                )}
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