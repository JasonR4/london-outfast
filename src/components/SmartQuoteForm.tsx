import { useState, useEffect } from "react";
import { calculateVAT, formatCurrencyWithVAT } from '@/utils/vat';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Search, MapPin, Zap, Calculator, CheckCircle2, AlertTriangle, Info, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuotes } from "@/hooks/useQuotes";
import { useRateCards } from "@/hooks/useRateCards";
import { useLocationSelector } from "@/hooks/useLocationSelector";
import { useLocationCapacity } from "@/hooks/useLocationCapacity";
import { useCreativeCapacity } from "@/hooks/useCreativeCapacity";
import { useNavigate } from "react-router-dom";
import { CreativeCapacityIndicator } from "@/components/CreativeCapacityIndicator";
import { LocationSelector } from "@/components/LocationSelector";
import { oohFormats, OOHFormat } from "@/data/oohFormats";
import { londonAreas } from "@/data/londonAreas";
import { supabase } from "@/integrations/supabase/client";

interface SmartQuoteFormProps {
  onQuoteSubmitted?: () => void;
}

export const SmartQuoteForm = ({ onQuoteSubmitted }: SmartQuoteFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentQuote, addQuoteItem, submitQuote, createOrGetQuote, loading: quotesLoading } = useQuotes();
  
  // Form state
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<OOHFormat | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [needsCreative, setNeedsCreative] = useState(false);
  const [creativeAssets, setCreativeAssets] = useState(1);
  const [creativeLevel, setCreativeLevel] = useState("Basic Design");
  const [creativeReadiness, setCreativeReadiness] = useState<'ready' | 'adjustments' | 'development'>('ready');
  console.log('📊 Selected periods state:', selectedPeriods);
  const [contactDetails, setContactDetails] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    company_name: "",
    campaign_objective: "",
    budget_range: "",
    timeline: ""
  });

  // Location selection
  const {
    selectedLocations,
    handleLocationToggle,
    clearAllLocations,
    getSelectedLocationsByZone
  } = useLocationSelector();

  // Location capacity logic
  const locationCapacity = useLocationCapacity({
    quantity,
    selectedPeriods,
    selectedAreas: selectedLocations,
    basePrice: 1000
  });

  // Rate cards for selected format
  const { 
    calculatePrice, 
    calculateProductionCost, 
    calculateCreativeCost,
    getAvailablePeriodsForLocation,
    getAllAvailablePeriods,
    getAvailableCreativeCategories,
    loading: rateCardsLoading 
  } = useRateCards(selectedFormat?.slug);

  // Get dynamic creative cost per asset from CMS
  const dynamicCreativeCost = selectedFormat && selectedLocations.length > 0 && creativeAssets > 0 
    ? calculateCreativeCost(selectedLocations[0], creativeAssets, creativeLevel)
    : null;
  
  // Creative capacity logic
  const creativeCapacity = useCreativeCapacity({
    sites: quantity,
    creativeAssets,
    needsCreative,
    creativeCostPerAsset: dynamicCreativeCost?.costPerUnit || 0,
    siteCost: 1000
  });

  // Initialize quote on component mount
  useEffect(() => {
    createOrGetQuote();
  }, []);

  // Filter formats based on search
  const filteredFormats = oohFormats.filter(format =>
    format.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    format.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    format.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group formats by category
  const formatsByCategory = filteredFormats.reduce((acc, format) => {
    if (!acc[format.category]) {
      acc[format.category] = [];
    }
    acc[format.category].push(format);
    return acc;
  }, {} as Record<string, OOHFormat[]>);

  // Calculate total pricing
  const calculateTotalPrice = () => {
    console.log('💰 calculateTotalPrice called');
    console.log('📊 Current state:', {
      selectedFormat: selectedFormat?.name,
      selectedLocations,
      selectedPeriods,
      quantity
    });

    if (!selectedFormat || selectedLocations.length === 0 || selectedPeriods.length === 0) {
      console.log('❌ Missing requirements for pricing');
      return { 
        mediaPrice: 0, 
        productionCost: 0, 
        creativeCost: 0, 
        totalCost: 0, 
        totalDiscount: 0,
        originalCost: 0 
      };
    }

    let totalMediaPrice = 0;
    let totalProductionCost = 0;
    let totalCreativeCost = 0;
    let totalDiscount = 0;
    let originalMediaCost = 0;

    selectedLocations.forEach(location => {
      try {
        console.log(`🏙️ Calculating price for location: ${location}`);
        console.log(`📅 Selected periods: ${selectedPeriods}`);
        
        const mediaPrice = calculatePrice(location, selectedPeriods);
        const productionPrice = calculateProductionCost(location, quantity);
        // Calculate creative cost based on creative assets and selected level
        const creativePrice = needsCreative ? calculateCreativeCost(location, creativeAssets, creativeLevel) : null;
        
        console.log(`💰 Media price result:`, mediaPrice);
        console.log(`🏭 Production price result:`, productionPrice);
        console.log(`🎨 Creative price result:`, creativePrice);
        
        // Handle media price and discount
        if (mediaPrice !== null && mediaPrice !== undefined) {
          const priceToAdd = typeof mediaPrice === 'number' ? mediaPrice : (mediaPrice.totalPrice || 0);
          const originalPrice = typeof mediaPrice === 'object' ? 
            (mediaPrice.basePrice || mediaPrice.adjustedRate || 0) * selectedPeriods.length : priceToAdd;
          
          totalMediaPrice += priceToAdd;
          originalMediaCost += originalPrice;
          
          // Calculate discount amount
          if (typeof mediaPrice === 'object' && mediaPrice.discount > 0) {
            const discountAmount = originalPrice * (mediaPrice.discount / 100);
            totalDiscount += discountAmount;
          }
          
          console.log(`➕ Added media price: ${priceToAdd}, original: ${originalPrice}, total: ${totalMediaPrice}`);
        }
        
        // Handle production price
        if (productionPrice && productionPrice.totalCost !== undefined) {
          totalProductionCost += productionPrice.totalCost;
          console.log(`➕ Added production cost: ${productionPrice.totalCost}, total: ${totalProductionCost}`);
        }

        // Handle creative price (only if needed)
        if (needsCreative && creativePrice && creativePrice.totalCost !== undefined) {
          totalCreativeCost += creativePrice.totalCost;
          console.log(`➕ Added creative cost: ${creativePrice.totalCost}, total: ${totalCreativeCost}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error calculating price for location ${location}:`, error);
      }
    });

    const subtotal = totalMediaPrice + totalProductionCost + totalCreativeCost;
    const result = {
      mediaPrice: totalMediaPrice,
      productionCost: totalProductionCost,
      creativeCost: totalCreativeCost,
      totalCost: subtotal,
      totalDiscount,
      originalCost: originalMediaCost + totalProductionCost + totalCreativeCost
    };
    
    console.log('🎯 Final pricing result:', result);
    return result;
  };

  const pricing = calculateTotalPrice();

  const handleFormatSelect = (format: OOHFormat) => {
    setSelectedFormat(format);
    setSelectedPeriods([]);
    setActiveTab("configure");
  };

  const handleAddToQuote = async () => {
    if (!selectedFormat || selectedLocations.length === 0 || selectedPeriods.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a format, locations, and campaign periods.",
        variant: "destructive"
      });
      return;
    }

    // Check location capacity
    if (locationCapacity.isOverCapacity) {
      toast({
        title: "Location capacity exceeded",
        description: `You've selected ${locationCapacity.locationCapacityUsed} locations but only have capacity for ${locationCapacity.maxLocationCapacity}. Please reduce selections or upgrade your package.`,
        variant: "destructive"
      });
      return;
    }

    try {
      await addQuoteItem({
        format_slug: selectedFormat.slug,
        format_name: selectedFormat.name,
        quantity,
        selected_periods: selectedPeriods,
        selected_areas: selectedLocations,
        production_cost: pricing.productionCost,
        creative_cost: needsCreative ? pricing.creativeCost : 0,
        base_cost: pricing.mediaPrice,
        total_cost: pricing.totalCost
      });

      toast({
        title: "Added to Quote",
        description: `${selectedFormat.name} has been added to your quote.`,
      });

      // Reset form for next item
      setSelectedFormat(null);
      setQuantity(1);
      setSelectedPeriods([]);
      clearAllLocations();
      setActiveTab("search");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitQuote = async () => {
    if (!currentQuote || currentQuote.quote_items?.length === 0) {
      toast({
        title: "No Items in Quote",
        description: "Please add at least one item to your quote before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!contactDetails.contact_name || !contactDetails.contact_email) {
      toast({
        title: "Missing Contact Information",
        description: "Please provide your name and email to submit the quote.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await submitQuote(contactDetails);
      if (success) {
        // Navigate to quote submitted page - same as OOH media quote flow
        navigate('/quote-submitted');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Capacity & Status Panel - Always Visible */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Location Capacity Information */}
            {selectedFormat && (
              <Card className="border-2" style={{
                borderColor: locationCapacity.capacityStatus === 'over-limit' ? 'hsl(var(--destructive))' :
                           locationCapacity.capacityStatus === 'warning' ? 'hsl(var(--warning))' : 
                           locationCapacity.capacityStatus === 'at-limit' ? 'hsl(var(--primary))' : 
                           'hsl(var(--border))'
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {locationCapacity.capacityStatus === 'over-limit' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                    {locationCapacity.capacityStatus === 'at-limit' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    {locationCapacity.capacityStatus === 'warning' && <Info className="w-5 h-5 text-warning" />}
                    Location Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usage</span>
                    <Badge variant={locationCapacity.capacityStatus === 'over-limit' ? 'destructive' : 'secondary'}>
                      {locationCapacity.locationCapacityUsed}/{locationCapacity.maxLocationCapacity}
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.min(locationCapacity.capacityUtilization, 100)} 
                    className="h-3"
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{quantity} {selectedFormat?.name?.includes('Digital') ? 'sites' : 'units'} × {selectedPeriods.length} periods = {locationCapacity.maxLocationCapacity} total slots</p>
                    <p>{locationCapacity.remainingCapacity} slots remaining</p>
                  </div>
                  {locationCapacity.capacityStatus === 'over-limit' && (
                    <Alert className="border-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-xs">
                        You've selected more locations than your current capacity allows. Please reduce selections or increase quantity/periods.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Creative Capacity Information */}
            {needsCreative && (
              <CreativeCapacityIndicator
                sites={quantity}
                creativeAssets={creativeAssets}
                needsCreative={needsCreative}
                efficiency={creativeCapacity.efficiency}
                status={creativeCapacity.status}
                creativesPerSite={creativeCapacity.creativesPerSite}
                recommendations={creativeCapacity.getCreativeRecommendations()}
                onOptimizeClick={() => {
                  const recommendations = creativeCapacity.getCreativeRecommendations();
                  toast({
                    title: "Creative Optimization",
                    description: recommendations[0] || "Consider optimizing your creative strategy for better efficiency."
                  });
                }}
              />
            )}

            {/* Quick Summary */}
            {selectedFormat && (
              <Card className="bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Format:</strong> {selectedFormat.name}</div>
                  <div><strong>Quantity:</strong> {quantity}</div>
                  <div><strong>Locations:</strong> {selectedLocations.length} areas</div>
                  <div><strong>Periods:</strong> {selectedPeriods.length} campaign periods</div>
                  {needsCreative && <div><strong>Creative Assets:</strong> {creativeAssets}</div>}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Main Configuration */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Smart Quote Builder
              </CardTitle>
              <p className="text-muted-foreground">
                Search formats, configure your campaign, and get real-time pricing
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="search" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Formats
                  </TabsTrigger>
                  <TabsTrigger value="configure" disabled={!selectedFormat} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Configure
                  </TabsTrigger>
                  <TabsTrigger value="pricing" disabled={!selectedFormat} className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Pricing
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for outdoor advertising formats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Format Categories */}
                  <div className="space-y-6">
                    {Object.entries(formatsByCategory).map(([category, formats]) => (
                      <div key={category} className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                          {category}
                        </h3>
                        <div className="grid gap-3">
                          {formats.map((format) => (
                            <Card
                              key={format.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedFormat?.id === format.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => handleFormatSelect(format)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h4 className="font-medium text-foreground">{format.name}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {format.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs">
                                      <Badge variant="outline">{format.type}</Badge>
                                      <Badge variant="secondary">{format.priceRange}</Badge>
                                    </div>
                                  </div>
                                  {selectedFormat?.id === format.id && (
                                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="configure" className="space-y-6">
                  {selectedFormat && (
                    <>
                      {/* Selected Format Info */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                          <h3 className="font-medium text-foreground mb-2">{selectedFormat.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedFormat.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{selectedFormat.type}</Badge>
                            <Badge variant="secondary">{selectedFormat.physicalSize}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          Quantity - {selectedFormat?.name?.includes('Digital') ? 'Sites' : 'Units'} per Incharge Period
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Each {selectedFormat?.name?.includes('Digital') ? 'site' : 'unit'} can display across multiple locations during rotation periods
                        </p>
                        <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 10, 15, 20, 25, 50].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Location Selection */}
                      <div className="space-y-4">
                        <LocationSelector
                          selectedLocations={selectedLocations}
                          onSelectionChange={(locations) => {
                            clearAllLocations();
                            locations.forEach(handleLocationToggle);
                          }}
                          title="Target Locations"
                          description="Select your preferred London areas"
                          showSelectedSummary={true}
                          maxHeight="300px"
                        />
                      </div>

                      {/* Creative Services */}
                      <div className="space-y-4 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-lg font-semibold text-foreground">Creative Requirements</Label>
                            <p className="text-sm text-muted-foreground mt-1">Do you need creative assets produced?</p>
                          </div>
                          <div className="relative p-2 bg-background rounded-lg border-2 border-primary shadow-lg">
                            <Switch
                              checked={needsCreative}
                              onCheckedChange={setNeedsCreative}
                              className="scale-125 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 border-2 border-primary/50"
                            />
                            {needsCreative && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse shadow-md" />
                            )}
                          </div>
                        </div>
                        
                         {needsCreative && (
                           <div className="space-y-4">
                             <div>
                               <Label className="text-sm font-medium">Creative Design Level</Label>
                               <p className="text-xs text-muted-foreground mb-2">Choose the level of creative design service you need</p>
                               <Select value={creativeLevel} onValueChange={setCreativeLevel}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Select creative level" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {getAvailableCreativeCategories().map((category) => (
                                     <SelectItem key={category} value={category}>
                                       {category}
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>
                             
                             <div>
                               <Label className="text-sm font-medium">Creative Readiness</Label>
                               <Select value={creativeReadiness} onValueChange={(value: 'ready' | 'adjustments' | 'development') => setCreativeReadiness(value)}>
                                 <SelectTrigger className="mt-1">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="ready">Ready to go</SelectItem>
                                   <SelectItem value="adjustments">Need minor adjustments</SelectItem>
                                   <SelectItem value="development">Need full creative development</SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
                             
                             <div>
                               <Label className="text-sm font-medium">Number of Creative Assets</Label>
                               <p className="text-xs text-muted-foreground mb-2">How many different creative designs do you need?</p>
                               <Select value={creativeAssets.toString()} onValueChange={(value) => setCreativeAssets(parseInt(value))}>
                                 <SelectTrigger>
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(num => (
                                     <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>
                           </div>
                         )}
                      </div>

                      {/* Campaign Periods */}
                      {selectedFormat && (
                        <div className="space-y-2">
                          <Label>Campaign Periods</Label>
                          <p className="text-sm text-muted-foreground">
                            Select campaign periods first, then choose your locations
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {getAllAvailablePeriods().map(period => {
                              console.log('🗓️ Period data:', period);
                              const periodId = period.period_number;
                              const isSelected = selectedPeriods.includes(periodId);
                              console.log(`Period ${periodId} selected:`, isSelected);
                              
                              return (
                                <Card
                                  key={period.id}
                                  className={`cursor-pointer transition-all hover:shadow-md ${
                                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                                  }`}
                                  onClick={() => {
                                    console.log('🖱️ Clicked period:', periodId);
                                    console.log('📋 Current selected periods:', selectedPeriods);
                                    setSelectedPeriods(prev => {
                                      const newSelection = prev.includes(periodId)
                                        ? prev.filter(p => p !== periodId)
                                        : [...prev, periodId];
                                      console.log('🔄 New selection:', newSelection);
                                      return newSelection;
                                    });
                                  }}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-sm font-medium">Period {period.period_number}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                          {selectedPeriods.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {selectedPeriods.length} period{selectedPeriods.length !== 1 ? 's' : ''} selected
                              <br />
                              <span className="text-xs">Now you can select up to {quantity * selectedPeriods.length} locations</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  {selectedFormat && selectedLocations.length > 0 && selectedPeriods.length > 0 && (
                    <>
                      {/* Pricing Breakdown */}
                      <Card className="bg-gradient-card border-border">
                        <CardHeader>
                          <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {pricing.totalDiscount > 0 && (
                            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                💰 Volume Discount Applied
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-300">
                                You saved £{pricing.totalDiscount.toLocaleString()} with this selection
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span>Media Costs:</span>
                            <span className="font-medium">£{pricing.mediaPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Production Costs:</span>
                            <span className="font-medium">£{pricing.productionCost.toLocaleString()}</span>
                          </div>
                          {needsCreative && pricing.creativeCost > 0 && (
                            <div className="flex justify-between items-center">
                              <span>Creative Development ({creativeAssets} assets):</span>
                              <span className="font-medium">£{pricing.creativeCost.toLocaleString()}</span>
                            </div>
                          )}
                          {pricing.totalDiscount > 0 && (
                            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                              <span>Discount:</span>
                              <span className="font-medium">-£{pricing.totalDiscount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Subtotal (exc VAT):</span>
                              <span className="font-medium">£{pricing.totalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>VAT (20%):</span>
                              <span>£{(pricing.totalCost * 0.20).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                              <span>Total inc VAT:</span>
                              <span className="text-primary">£{(pricing.totalCost * 1.20).toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Campaign Summary */}
                      <Card className="bg-muted/20 border-border">
                        <CardHeader>
                          <CardTitle className="text-lg">Campaign Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div><strong>Format:</strong> {selectedFormat.name}</div>
                          <div><strong>Quantity:</strong> {quantity}</div>
                          <div><strong>Locations:</strong> {selectedLocations.length} areas</div>
                          <div><strong>Periods:</strong> {selectedPeriods.length} campaign periods</div>
                        </CardContent>
                      </Card>

                      {/* Add to Quote Button */}
                      <Button
                        onClick={handleAddToQuote}
                        size="lg"
                        className="w-full"
                        disabled={quotesLoading}
                      >
                        {quotesLoading ? "Adding..." : "Add More Media Options"}
                      </Button>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Quote Summary & Contact Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Quote */}
          {currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0 && (
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Your Quote ({currentQuote.quote_items.length} items)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuote.quote_items.map((item) => (
                  <div key={item.id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium text-sm">{item.format_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.selected_areas?.length} areas • {item.selected_periods?.length} periods
                    </div>
                    <div className="text-sm font-medium text-primary">
                      £{item.total_cost?.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Subtotal (exc VAT):</span>
                    <span className="font-medium">£{currentQuote.total_cost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>VAT (20%):</span>
                    <span>£{((currentQuote.total_cost || 0) * 0.20).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold border-t pt-2">
                    <span>Total inc VAT:</span>
                    <span className="text-primary">£{((currentQuote.total_cost || 0) * 1.20).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Form */}
          <Card className="bg-gradient-card border-border sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Submit Your Quote</CardTitle>
              <p className="text-sm text-muted-foreground">
                Get professional consultation within 24 hours
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_name">Full Name *</Label>
                <Input
                  id="contact_name"
                  value={contactDetails.contact_name}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={contactDetails.contact_email}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={contactDetails.contact_phone}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+44 20 1234 5678"
                />
              </div>

              <div>
                <Label htmlFor="company_name">Company</Label>
                <Input
                  id="company_name"
                  value={contactDetails.company_name}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Your company"
                />
              </div>

              <div>
                <Label htmlFor="campaign_objective">Campaign Objective</Label>
                <Select
                  value={contactDetails.campaign_objective}
                  onValueChange={(value) => setContactDetails(prev => ({ ...prev, campaign_objective: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                    <SelectItem value="product-launch">Product Launch</SelectItem>
                    <SelectItem value="event-promotion">Event Promotion</SelectItem>
                    <SelectItem value="footfall">Drive Footfall</SelectItem>
                    <SelectItem value="sales">Increase Sales</SelectItem>
                    <SelectItem value="recruitment">Recruitment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget_range">Budget Range</Label>
                <Select
                  value={contactDetails.budget_range}
                  onValueChange={(value) => setContactDetails(prev => ({ ...prev, budget_range: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1k">Under £1,000</SelectItem>
                    <SelectItem value="1k-5k">£1,000 - £5,000</SelectItem>
                    <SelectItem value="5k-10k">£5,000 - £10,000</SelectItem>
                    <SelectItem value="10k-25k">£10,000 - £25,000</SelectItem>
                    <SelectItem value="25k-50k">£25,000 - £50,000</SelectItem>
                    <SelectItem value="50k-100k">£50,000 - £100,000</SelectItem>
                    <SelectItem value="100k-250k">£100,000 - £250,000</SelectItem>
                    <SelectItem value="over-250k">Over £250,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select
                  value={contactDetails.timeline}
                  onValueChange={(value) => setContactDetails(prev => ({ ...prev, timeline: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When to go live?" />
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

              <Button
                onClick={handleSubmitQuote}
                size="lg"
                className="w-full"
                disabled={quotesLoading || !currentQuote?.quote_items?.length}
              >
                {quotesLoading ? "Submitting..." : "Submit Quote Request"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};