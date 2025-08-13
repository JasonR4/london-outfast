import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getCurrentUser, requireAuth } from '@/utils/auth';
import { trackRateGateCTAClicked } from '@/utils/analytics';
import FormatPricingSection from '@/components/FormatPricingSection';
import { useMediaFormats } from '@/hooks/useMediaFormats';
import { useRateCards } from '@/hooks/useRateCards';

const FormatPage = () => {
  const { formatSlug } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [format, setFormat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Planner state - always available
  const [quantity, setQuantity] = useState(1);
  const [selectedAreas, setSelectedAreas] = useState(['Central London']);
  const [selectedPeriods, setSelectedPeriods] = useState([1, 2]);
  const [isDateSpecific, setIsDateSpecific] = useState(true);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [needsCreative, setNeedsCreative] = useState(false);
  const [creativeAssets, setCreativeAssets] = useState(0);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Mock format data for now
  useEffect(() => {
    setFormat({
      format_name: formatSlug?.replace('-', ' ') || 'Outdoor Format',
      name: formatSlug?.replace('-', ' ') || 'Outdoor Format',
      description: 'Professional outdoor advertising format available across London.',
      category: 'Billboard'
    });
    setLoading(false);
  }, [formatSlug]);

  const handleGetQuote = () => {
    navigate('/quote');
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+442012345678';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading format...</div>
      </div>
    );
  }

  if (!format) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Format not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            {format.format_name}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {format.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={async () => {
                if (!isAuthenticated) {
                  trackRateGateCTAClicked('add_to_plan');
                  const planDraft = {
                    formats: [formatSlug],
                    sitesSelected: 1,
                    periods: [],
                    locations: [],
                    lastStep: 'costs'
                  };
                  await requireAuth(
                    `${window.location.pathname}#action=build`,
                    () => handleGetQuote(),
                    planDraft
                  );
                } else {
                  handleGetQuote();
                }
              }}
              size="lg" 
              className="bg-gradient-primary hover:opacity-90"
            >
              Build My Plan
            </Button>
            <Button onClick={handleCallNow} variant="outline" size="lg">
              Speak to Specialist
            </Button>
          </div>
        </div>
      </section>

      {/* Planning Section - Always Visible */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Selectors */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configure Your Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quantity Selector */}
                  <div>
                    <Label htmlFor="quantity">Number of Sites</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  {/* Location Selector */}
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select value={selectedAreas[0]} onValueChange={(value) => setSelectedAreas([value])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Central London">Central London</SelectItem>
                        <SelectItem value="Zone 1">Zone 1</SelectItem>
                        <SelectItem value="Zone 2">Zone 2</SelectItem>
                        <SelectItem value="Zone 3">Zone 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Period Selector */}
                  <div>
                    <Label htmlFor="periods">Campaign Periods</Label>
                    <Select value={selectedPeriods.length.toString()} onValueChange={(value) => {
                      const count = Number(value);
                      setSelectedPeriods(Array.from({ length: count }, (_, i) => i + 1));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Period</SelectItem>
                        <SelectItem value="2">2 Periods</SelectItem>
                        <SelectItem value="3">3 Periods</SelectItem>
                        <SelectItem value="4">4 Periods</SelectItem>
                        <SelectItem value="6">6 Periods</SelectItem>
                        <SelectItem value="12">12 Periods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Creative Options */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="creative"
                      checked={needsCreative}
                      onCheckedChange={(checked) => {
                        setNeedsCreative(!!checked);
                        if (!checked) setCreativeAssets(0);
                        else setCreativeAssets(1);
                      }}
                    />
                    <Label htmlFor="creative">Need creative design services</Label>
                  </div>
                  
                  {needsCreative && (
                    <div>
                      <Label htmlFor="assets">Number of Creative Assets</Label>
                      <Input
                        id="assets"
                        type="number"
                        value={creativeAssets}
                        onChange={(e) => setCreativeAssets(Number(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Pricing */}
            <div>
              <FormatPricingSection
                isAuthenticated={isAuthenticated}
                format={format}
                quantity={quantity}
                selectedAreas={selectedAreas}
                selectedPeriods={selectedPeriods}
                isDateSpecific={isDateSpecific}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                needsCreative={needsCreative}
                creativeAssets={creativeAssets}
                rateLoading={false}
                getAvailableLocations={() => ['Central London', 'Zone 1', 'Zone 2']}
                calculatePrice={() => ({ basePrice: 800 })}
                calculateProductionCost={() => ({ totalCost: 150 })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Launch Your {format.format_name} Campaign?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get instant pricing and expert campaign planning for London's best locations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetQuote} size="lg" className="bg-gradient-primary hover:opacity-90">
              GET QUOTE
            </Button>
            <Button onClick={handleCallNow} variant="outline" size="lg">
              SPEAK TO PLANNER
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormatPage;