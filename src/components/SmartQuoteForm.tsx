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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, MapPin, Zap, Calculator, CheckCircle2, AlertTriangle, Info, Palette, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuotes } from "@/hooks/useQuotes";
import { useRateCards } from "@/hooks/useRateCards";
import { useLocationSelector } from "@/hooks/useLocationSelector";
import { useLocationCapacity } from "@/hooks/useLocationCapacity";
import { useCreativeCapacity } from "@/hooks/useCreativeCapacity";
import { useNavigate } from "react-router-dom";
import { CreativeCapacityIndicator } from "@/components/CreativeCapacityIndicator";
import { LocationSelector } from "@/components/LocationSelector";
import { useMediaFormats } from "@/hooks/useMediaFormats";
import { londonAreas } from "@/data/londonAreas";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface SmartQuoteFormProps {
  onQuoteSubmitted?: () => void;
}

export const SmartQuoteForm = ({ onQuoteSubmitted }: SmartQuoteFormProps) => {
  console.log('🚀 SmartQuoteForm component rendering');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentQuote, addQuoteItem, removeQuoteItem, submitQuote, createOrGetQuote, loading: quotesLoading } = useQuotes();
  
  console.log('✅ useQuotes hook loaded successfully');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  console.log('👤 Current user state:', user?.email || 'Not authenticated');
  
  console.log('📋 Current quote state:', currentQuote?.id || 'No quote');

  // Form state
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<any[]>([]);
  const [formatQuantities, setFormatQuantities] = useState<Record<string, number>>({});
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [needsCreative, setNeedsCreative] = useState(false);
  const [creativeAssets, setCreativeAssets] = useState(1);
  const [creativeLevel, setCreativeLevel] = useState("Basic Design");
  const [creativeReadiness, setCreativeReadiness] = useState<'ready' | 'adjustments' | 'development'>('ready');
  console.log('📊 Selected periods state:', selectedPeriods);
  const [contactDetails, setContactDetails] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_company: "",
    additional_requirements: "",
    website: ""
  });

  console.log('🔍 Component state initialized:', { formatQuantities, selectedFormats: selectedFormats.length });

  // Location selection
  const {
    selectedLocations,
    handleLocationToggle,
    clearAllLocations,
    getSelectedLocationsByZone
  } = useLocationSelector();
  
  console.log('📊 SmartQuoteForm location state:', {
    selectedLocationsCount: selectedLocations.length,
    selectedFormatsCount: selectedFormats.length,
    formatQuantities
  });

  // Get total quantity across all formats
  console.log('🔍 formatQuantities before calculation:', formatQuantities);
  const totalQuantity = Object.values(formatQuantities).reduce((sum, qty) => sum + qty, 0);
  console.log('🔍 totalQuantity calculated:', totalQuantity);

  // Location capacity logic
  const locationCapacity = useLocationCapacity({
    quantity: totalQuantity,
    selectedPeriods,
    selectedAreas: selectedLocations,
    basePrice: 1000
  });

  // Rate cards for selected formats (using first format for now)
  const { 
    calculatePrice, 
    calculateProductionCost, 
    calculateCreativeCost,
    getAvailablePeriodsForLocation,
    getAllAvailablePeriods,
    getAvailableCreativeCategories,
    creativeCostTiers,
    loading: rateCardsLoading 
  } = useRateCards(selectedFormats[0]?.format_slug);

  // Get dynamic creative cost per asset from CMS
  const dynamicCreativeCost = selectedFormats.length > 0 && creativeAssets > 0 
    ? (selectedLocations.length > 0 
        ? calculateCreativeCost(selectedLocations[0], creativeAssets, creativeLevel)
        : calculateCreativeCost('GD', creativeAssets, creativeLevel) // Default to GD location
      )
    : null;
  
  // Creative capacity logic
  const creativeCapacity = useCreativeCapacity({
    sites: totalQuantity,
    creativeAssets,
    needsCreative,
    creativeCostPerAsset: dynamicCreativeCost?.costPerUnit || 0,
    siteCost: 1000
  });

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Authentication check:', user?.email || 'Not authenticated');
      setUser(user);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Initialize quote on component mount
  useEffect(() => {
    createOrGetQuote();
  }, []);

  const { mediaFormats, loading: formatsLoading } = useMediaFormats();
  
  // Filter formats based on search
  const filteredFormats = mediaFormats.filter(format =>
    format.format_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (format.description && format.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group formats by category (we'll use dimensions as a proxy for category)
  const formatsByCategory = filteredFormats.reduce((acc, format) => {
    const category = format.dimensions || 'Various Sizes';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(format);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate total costs from all quote items
  const calculateQuoteTotalCosts = () => {
    if (!currentQuote?.quote_items || currentQuote.quote_items.length === 0) {
      return {
        mediaPrice: 0,
        productionCost: 0,
        creativeCost: 0,
        totalCost: 0,
        totalDiscount: 0,
        originalCost: 0
      };
    }

    const totals = currentQuote.quote_items.reduce((acc, item) => {
      acc.mediaPrice += item.base_cost || 0;
      acc.productionCost += item.production_cost || 0;
      acc.creativeCost += item.creative_cost || 0;
      acc.totalCost += item.total_cost || 0;
      return acc;
    }, {
      mediaPrice: 0,
      productionCost: 0,
      creativeCost: 0,
      totalCost: 0,
      totalDiscount: 0,
      originalCost: 0
    });

    console.log('📊 Quote total costs:', totals);
    console.log('📋 Quote items:', currentQuote.quote_items);
    
    return totals;
  };

  // Calculate total pricing for current item configuration
  const calculateTotalPrice = () => {
    console.log('💰 calculateTotalPrice called');
    console.log('📊 Current state:', {
      selectedFormats: selectedFormats.map(f => f.format_name),
      selectedLocations,
      selectedPeriods,
      formatQuantities
    });

    if (selectedFormats.length === 0 || selectedLocations.length === 0 || selectedPeriods.length === 0) {
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
        const productionPrice = calculateProductionCost(location, totalQuantity);
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
  const quoteTotals = calculateQuoteTotalCosts();

  const handleFormatToggle = (format: any) => {
    console.log('🔄 Format toggle clicked:', format.format_name);
    console.log('📋 Current selectedFormats:', selectedFormats.map(f => f.format_name));
    
    setSelectedFormats(prev => {
      const isSelected = prev.some(f => f.format_slug === format.format_slug);
      if (isSelected) {
        console.log('❌ Removing format:', format.format_name);
        // Remove quantity when format is deselected
        setFormatQuantities(prevQuantities => {
          const newQuantities = { ...prevQuantities };
          delete newQuantities[format.format_slug];
          return newQuantities;
        });
        return prev.filter(f => f.format_slug !== format.format_slug);
      } else {
        console.log('✅ Adding format:', format.format_name);
        // Add default quantity when format is selected
        setFormatQuantities(prevQuantities => ({
          ...prevQuantities,
          [format.format_slug]: 1
        }));
        return [...prev, format];
      }
    });
  };

  const handleContinueToConfig = () => {
    if (selectedFormats.length === 0) {
      toast({
        title: "No formats selected",
        description: "Please select at least one media format to continue.",
        variant: "destructive"
      });
      return;
    }
    setActiveTab("configure");
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddToQuote = async () => {
    if (selectedFormats.length === 0 || selectedLocations.length === 0 || selectedPeriods.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select formats, locations, and campaign periods.",
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
      // Add each selected format as a separate quote item
      for (const format of selectedFormats) {
        await addQuoteItem({
          format_slug: format.format_slug,
          format_name: format.format_name,
          quantity: formatQuantities[format.format_slug] || 1,
          selected_periods: selectedPeriods,
          selected_areas: selectedLocations,
          production_cost: pricing.productionCost / selectedFormats.length,
          creative_cost: needsCreative ? (pricing.creativeCost / selectedFormats.length) : 0,
          base_cost: pricing.mediaPrice / selectedFormats.length,
          total_cost: pricing.totalCost / selectedFormats.length
        });
      }

      toast({
        title: "Added to Quote",
        description: `${selectedFormats.length} format${selectedFormats.length > 1 ? 's' : ''} have been added to your quote.`,
      });

      // Reset form for next item
      setSelectedFormats([]);
      setFormatQuantities({});
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
    console.log('🚀 handleSubmitQuote called');
    console.log('📊 Current state:', {
      user: user?.email,
      currentQuote: currentQuote?.id,
      quoteItemsLength: currentQuote?.quote_items?.length,
      contactDetails
    });

    // Only check for quote items if user is not authenticated
    if (!user && (!currentQuote || currentQuote.quote_items?.length === 0)) {
      console.log('❌ No quote items for non-authenticated user');
      toast({
        title: "No Items in Quote",
        description: "Please add at least one item to your quote before submitting.",
        variant: "destructive"
      });
      return;
    }

    // For authenticated users, we don't need contact details validation
    if (!user && (!contactDetails.contact_name || !contactDetails.contact_email)) {
      console.log('❌ Missing contact details for non-authenticated user');
      toast({
        title: "Missing Contact Information",
        description: "Please provide your name and email to submit the quote.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📤 Submitting quote...');
      const success = await submitQuote(contactDetails);
      console.log('✅ Submit result:', success);
      
      if (success) {
        // Navigate based on authentication status
        if (user) {
          console.log('🔄 Navigating to client portal');
          navigate('/client-portal');
        } else {
          console.log('🔄 Navigating to quote submitted');
          navigate('/quote-submitted');
        }
      } else {
        console.log('❌ Submit returned false');
        toast({
          title: "Submission Failed",
          description: "Quote submission was not successful. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Submit error:', error);
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
            {selectedFormats.length > 0 && (
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
                     <p>{totalQuantity} {selectedFormats[0]?.name?.includes('Digital') ? 'sites' : 'units'} × {selectedPeriods.length} periods = {locationCapacity.maxLocationCapacity} total slots</p>
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
                 sites={totalQuantity}
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
            {selectedFormats.length > 0 && (
              <Card className="bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Summary</CardTitle>
                </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Formats:</strong> {selectedFormats.map(f => f.format_name).join(', ')}</div>
                    <div><strong>Total Quantity:</strong> {totalQuantity}</div>
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
                   <TabsTrigger value="configure" disabled={selectedFormats.length === 0} className="flex items-center gap-2">
                     <MapPin className="h-4 w-4" />
                     Configure
                   </TabsTrigger>
                   <TabsTrigger value="pricing" disabled={selectedFormats.length === 0} className="flex items-center gap-2">
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

                   {/* Format List - Flat */}
                   <div className="space-y-3">
                     {filteredFormats.length === 0 && (
                       <Card>
                         <CardContent className="p-4 text-sm text-muted-foreground">
                           No formats match your search.
                         </CardContent>
                       </Card>
                     )}

                     {filteredFormats.map((format) => (
                       <Card
                         key={format.id}
                         className={`cursor-pointer transition-all hover:shadow-md ${
                           selectedFormats.some((f) => f.id === format.id)
                             ? 'ring-2 ring-primary bg-primary/5'
                             : ''
                         }`}
                         onClick={() => handleFormatToggle(format)}
                       >
                         <CardContent className="p-4">
                           <div className="flex items-start justify-between">
                             <div className="space-y-1">
                               <h4 className="font-medium text-foreground">{format.format_name}</h4>
                               {format.description && (
                                 <p className="text-sm text-muted-foreground line-clamp-2">
                                   {format.description}
                                 </p>
                               )}
                               <div className="flex items-center gap-2 text-xs">
                                 {format.dimensions && (
                                   <Badge variant="outline">{format.dimensions}</Badge>
                                 )}
                               </div>
                             </div>
                             {selectedFormats.some((f) => f.id === format.id) && (
                               <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                             )}
                           </div>
                         </CardContent>
                       </Card>
                     ))}
                   </div>

                   {/* Continue Button - Prominent and Always Visible */}
                   <div className="flex justify-center pt-6 border-t border-border">
                     <Button 
                       onClick={handleContinueToConfig} 
                       disabled={selectedFormats.length === 0}
                       size="lg"
                       className="px-12 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                     >
                       {selectedFormats.length === 0 
                         ? "Select formats to continue" 
                         : `Continue with ${selectedFormats.length} format${selectedFormats.length > 1 ? 's' : ''} →`
                       }
                     </Button>
                   </div>
                 </TabsContent>

                 <TabsContent value="configure" className="space-y-6">
                   {selectedFormats.length > 0 && (
                     <>
                       {/* Selected Formats Info */}
                       <Card className="bg-primary/5 border-primary/20">
                         <CardContent className="p-4">
                           <h3 className="font-medium text-foreground mb-2">
                             Selected Formats ({selectedFormats.length})
                           </h3>
                           <div className="space-y-2">
                             {selectedFormats.map((format) => (
                               <div key={format.id} className="flex items-center justify-between text-sm">
                                 <span className="font-medium">{format.format_name}</span>
                                 <Badge variant="outline">{format.type}</Badge>
                               </div>
                             ))}
                           </div>
                         </CardContent>
                       </Card>

                        {/* Quantity per Format */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-medium">
                              Quantity per Format
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Set the quantity for each selected media format
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            {selectedFormats.map((format) => (
                              <div key={format.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{format.format_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format.format_name.includes('Digital') ? 'Sites' : 'Units'} per Incharge Period
                                  </div>
                                </div>
                                <div className="w-24">
                                  <Select 
                                    value={(formatQuantities[format.format_slug] || 1).toString()} 
                                    onValueChange={(value) => setFormatQuantities(prev => ({
                                      ...prev,
                                      [format.format_slug]: parseInt(value)
                                    }))}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 10, 15, 20, 25, 50].map(num => (
                                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
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

                       {/* Creative & Production */}
                       <div className="space-y-4 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                         <div className="flex items-center gap-2">
                           <Palette className="w-5 h-5 text-primary" />
                           <h3 className="text-lg font-semibold">Creative & Production</h3>
                         </div>
                         
                         <div className="space-y-3">
                           <Label className="text-base font-medium">Do you have artwork or need creative?</Label>
                           <div className="space-y-2">
                             <div className="flex items-center space-x-2">
                               <input
                                 type="radio"
                                 id="artwork-ready"
                                 name="creative-readiness"
                                 value="ready"
                                 checked={creativeReadiness === 'ready'}
                                 onChange={(e) => {
                                   setCreativeReadiness('ready');
                                   setNeedsCreative(false);
                                 }}
                                 className="w-4 h-4 text-primary"
                               />
                               <Label htmlFor="artwork-ready" className="text-sm cursor-pointer">
                                 I have artwork ready
                               </Label>
                             </div>
                             <div className="flex items-center space-x-2">
                               <input
                                 type="radio"
                                 id="need-creative"
                                 name="creative-readiness"
                                 value="development"
                                 checked={creativeReadiness === 'development'}
                                 onChange={(e) => {
                                   setCreativeReadiness('development');
                                   setNeedsCreative(true);
                                 }}
                                 className="w-4 h-4 text-primary"
                               />
                               <Label htmlFor="need-creative" className="text-sm cursor-pointer">
                                 I need creative design
                               </Label>
                             </div>
                           </div>
                         </div>

                         {needsCreative && (
                           <>
                             <div className="space-y-2">
                               <Label className="text-sm font-medium">Number of creative assets needed</Label>
                               <Select
                                 value={creativeAssets.toString()}
                                 onValueChange={(value) => setCreativeAssets(parseInt(value))}
                               >
                                 <SelectTrigger className="border-red-500">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                     <SelectItem key={num} value={num.toString()}>
                                       {num} asset{num > 1 ? 's' : ''}
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                               {dynamicCreativeCost && (
                                 <>
                                   {console.log('🎨 Creative cost debug:', {
                                     costPerUnit: dynamicCreativeCost.costPerUnit,
                                     creativeCostTiers: creativeCostTiers,
                                     creativeLevel,
                                     creativeAssets
                                   })}
                                   <p className="text-sm text-muted-foreground">
                                     £{dynamicCreativeCost.costPerUnit} per creative asset
                                   </p>
                                 </>
                               )}
                             </div>

                             <div className="space-y-3 p-3 bg-black border border-red-500 rounded-lg">
                               <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                   <CheckCircle2 className="w-3 h-3 text-white" />
                                 </div>
                                 <h4 className="font-medium text-red-500">Creative Strategy Analysis</h4>
                                 <Badge variant="destructive" className="text-xs">Optimal</Badge>
                               </div>
                               
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-red-500">Creative Efficiency</span>
                                    <span className="text-sm font-medium text-red-500">{Math.round(creativeCapacity.efficiency)}%</span>
                                  </div>
                                  <div className="w-full bg-red-900/30 rounded-full h-2">
                                    <div 
                                      className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${Math.min(creativeCapacity.efficiency, 100)}%` }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                      <div className="text-lg font-semibold text-red-500">{creativeAssets}</div>
                                      <div className="text-xs text-red-400">creative{creativeAssets > 1 ? 's' : ''}</div>
                                    </div>
                                     <div>
                                       <div className="text-lg font-semibold text-red-500">{totalQuantity}</div>
                                       <div className="text-xs text-red-400">site{totalQuantity > 1 ? 's' : ''}</div>
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                                    <div>
                                      <div className="font-medium text-red-500">{creativeCapacity.creativesPerSite.toFixed(2)}</div>
                                      <div className="text-xs text-red-400">Creatives per Site</div>
                                    </div>
                                     <div>
                                       <div className="font-medium text-red-500">{(totalQuantity / creativeAssets).toFixed(1)}</div>
                                       <div className="text-xs text-red-400">Sites per Creative</div>
                                     </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium text-red-500">Smart Recommendations:</h5>
                                   <div className="text-xs text-red-400 space-y-1">
                                     <p>Excellent! Your {creativeAssets} creative{creativeAssets > 1 ? 's' : ''} provide optimal coverage for {totalQuantity} site{totalQuantity > 1 ? 's' : ''}.</p>
                                     <p>Your creative strategy maximizes both reach and frequency for optimal campaign performance.</p>
                                   </div>
                                </div>
                             </div>
                           </>
                         )}
                      </div>

                      {/* Campaign Periods */}
                      {selectedFormats.length > 0 && (
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
                               <span className="text-xs">Now you can select up to {totalQuantity * selectedPeriods.length} locations</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  {/* Show current item pricing or total quote breakdown */}
                  {currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0 ? (
                    // Show total quote breakdown when items exist
                    <Card className="bg-gradient-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Media Costs:</span>
                          <span className="font-medium">£{quoteTotals.mediaPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Production Costs:</span>
                          <span className="font-medium">£{quoteTotals.productionCost.toLocaleString()}</span>
                        </div>
                        {quoteTotals.creativeCost > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Creative Development ({currentQuote.quote_items.reduce((sum, item) => sum + (item.creative_cost || 0), 0) / 85} assets):</span>
                            <span className="font-medium">£{quoteTotals.creativeCost.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Subtotal (exc VAT):</span>
                            <span className="font-medium">£{quoteTotals.totalCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>VAT (20%):</span>
                            <span>£{(quoteTotals.totalCost * 0.20).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                            <span>Total inc VAT:</span>
                            <span className="text-primary">£{(quoteTotals.totalCost * 1.20).toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : selectedFormats.length > 0 && selectedLocations.length > 0 && selectedPeriods.length > 0 ? (
                    // Show current item pricing when no items in quote yet
                    <Card className="bg-gradient-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Rate Card Details - Grouped */}
                        {(() => {
                          const firstLocationPrice = calculatePrice(selectedLocations[0], selectedPeriods);
                          if (!firstLocationPrice) return null;
                          
                          return (
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                              <h4 className="font-medium text-sm mb-3">
                                {selectedLocations.length} Location{selectedLocations.length > 1 ? 's' : ''} × {selectedPeriods.length} Period{selectedPeriods.length > 1 ? 's' : ''}
                              </h4>
                              
                              {/* Locations List */}
                              <div className="mb-4 p-3 bg-background/50 rounded border">
                                <div className="text-xs font-medium text-muted-foreground mb-2">Selected Locations:</div>
                                <div className="text-xs text-foreground leading-relaxed">
                                  {selectedLocations.join(' • ')}
                                </div>
                              </div>
                              
                              {/* Rate Card Breakdown */}
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Base Rate (per location, per period):</span>
                                  <span>£{firstLocationPrice.basePrice.toLocaleString()}</span>
                                </div>
                                
                                {firstLocationPrice.locationMarkup > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Location Markup (+{firstLocationPrice.locationMarkup}%):</span>
                                    <span>£{(firstLocationPrice.adjustedRate - firstLocationPrice.basePrice).toLocaleString()}</span>
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Subtotal ({selectedLocations.length} locations × {selectedPeriods.length} periods):</span>
                                  <span>£{(firstLocationPrice.adjustedRate * selectedPeriods.length * selectedLocations.length).toLocaleString()}</span>
                                </div>
                                
                                {firstLocationPrice.isOnSale && (
                                  <>
                                    <div className="flex justify-between items-center text-green-600 font-medium">
                                      <span>🏷️ Sale Price Applied:</span>
                                      <span>£{(pricing.mediaPrice / (1 - firstLocationPrice.discount / 100)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600 text-xs">
                                      <span>Sale Savings:</span>
                                      <span>-£{((firstLocationPrice.adjustedRate * selectedPeriods.length * selectedLocations.length) - (pricing.mediaPrice / (1 - firstLocationPrice.discount / 100))).toLocaleString()}</span>
                                    </div>
                                  </>
                                )}
                                
                                {firstLocationPrice.isReduced && !firstLocationPrice.isOnSale && (
                                  <>
                                    <div className="flex justify-between items-center text-blue-600 font-medium">
                                      <span>🔽 Reduced Price Applied:</span>
                                      <span>£{(pricing.mediaPrice / (1 - firstLocationPrice.discount / 100)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-blue-600 text-xs">
                                      <span>Reduction Savings:</span>
                                      <span>-£{((firstLocationPrice.adjustedRate * selectedPeriods.length * selectedLocations.length) - (pricing.mediaPrice / (1 - firstLocationPrice.discount / 100))).toLocaleString()}</span>
                                    </div>
                                  </>
                                )}
                                
                                {firstLocationPrice.discount > 0 && (
                                  <div className="border-t border-border/50 pt-2 mt-2">
                                    <div className="flex justify-between items-center text-orange-600 font-medium">
                                      <span>💰 Volume Discount ({firstLocationPrice.discount}%):</span>
                                      <span>-£{pricing.totalDiscount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="border-t border-border/50 pt-2 mt-2">
                                  <div className="flex justify-between items-center font-medium text-base">
                                    <span>Total Media Cost:</span>
                                    <span className="text-primary">£{pricing.mediaPrice.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                         })()}

                        {/* Production Cost Details */}
                        {pricing.productionCost > 0 && (() => {
                          const productionResult = calculateProductionCost(selectedLocations[0], totalQuantity);
                          if (!productionResult) return null;
                          
                          return (
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                              <h4 className="font-medium text-sm mb-3">
                                Production Costs - {totalQuantity} Units
                              </h4>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Cost per Unit:</span>
                                  <span>£{productionResult.costPerUnit.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Total Quantity:</span>
                                  <span>{totalQuantity} units</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Applicable Tier:</span>
                                  <span className="text-xs">
                                    {productionResult.tier.min_quantity}{productionResult.tier.max_quantity ? `-${productionResult.tier.max_quantity}` : '+'} units
                                  </span>
                                </div>
                                
                                {productionResult.tier.location_area && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Location-Specific Rate:</span>
                                    <span className="text-xs">{productionResult.tier.location_area} area</span>
                                  </div>
                                )}
                                
                                <div className="border-t border-border/50 pt-2 mt-2">
                                  <div className="flex justify-between items-center font-medium text-base">
                                    <span>Total Production Cost:</span>
                                    <span className="text-primary">£{pricing.productionCost.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Creative Cost Details */}
                        {needsCreative && pricing.creativeCost > 0 && (() => {
                          const creativeResult = calculateCreativeCost(selectedLocations[0], creativeAssets, creativeLevel);
                          if (!creativeResult) return null;
                          
                          return (
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                              <h4 className="font-medium text-sm mb-3">
                                Creative Development - {creativeAssets} Assets ({creativeLevel})
                              </h4>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Cost per Asset:</span>
                                  <span>£{creativeResult.costPerUnit.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Creative Level:</span>
                                  <span>{creativeLevel}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Total Assets:</span>
                                  <span>{creativeAssets} assets</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Applicable Tier:</span>
                                  <span className="text-xs">
                                    {creativeResult.tier.min_quantity}{creativeResult.tier.max_quantity ? `-${creativeResult.tier.max_quantity}` : '+'} assets
                                  </span>
                                </div>
                                
                                {creativeResult.tier.location_area && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Location-Specific Rate:</span>
                                    <span className="text-xs">{creativeResult.tier.location_area} area</span>
                                  </div>
                                )}
                                
                                <div className="border-t border-border/50 pt-2 mt-2">
                                  <div className="flex justify-between items-center font-medium text-base">
                                    <span>Total Creative Cost:</span>
                                    <span className="text-primary">£{pricing.creativeCost.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Total Summary */}
                        <div className="border-t border-border pt-4">
                          {pricing.totalDiscount > 0 && (
                            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg mb-4">
                              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                💰 Total Volume Discount Applied
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-300">
                                You saved £{pricing.totalDiscount.toLocaleString()} across all locations
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Total Media Costs:</span>
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
                          </div>
                          
                          <div className="border-t border-border pt-4 mt-4 space-y-2">
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
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Campaign Summary and Add to Quote - only show for current configuration */}
                  {selectedFormats.length > 0 && selectedLocations.length > 0 && selectedPeriods.length > 0 && (
                    <>
                      <Card className="bg-muted/20 border-border">
                        <CardHeader>
                          <CardTitle className="text-lg">Campaign Summary</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-2">
                           <div><strong>Formats:</strong> {selectedFormats.map(f => f.format_name).join(', ')}</div>
                           <div><strong>Total Quantity:</strong> {totalQuantity}</div>
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
               <CardContent className="space-y-4">
                 {currentQuote.quote_items.map((item) => (
                   <div key={item.id} className="bg-muted/50 p-4 rounded-lg border">
                     <div className="flex justify-between items-start mb-3">
                       <div className="flex-1">
                         <div className="font-medium">{item.format_name}</div>
                         <div className="text-sm text-muted-foreground">
                           Qty: {item.quantity} • {item.selected_areas?.length} areas • {item.selected_periods?.length} periods
                         </div>
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => removeQuoteItem(item.id)}
                         className="text-muted-foreground hover:text-destructive"
                       >
                         Remove
                       </Button>
                     </div>
                     
                     {/* Detailed cost breakdown */}
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span>Media Cost:</span>
                         <span>£{(item.base_cost || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Production Cost:</span>
                         <span>£{(item.production_cost || 0).toLocaleString()}</span>
                       </div>
                       {(item.creative_cost || 0) > 0 && (
                         <div className="flex justify-between">
                           <span>Creative Development:</span>
                           <span>£{(item.creative_cost || 0).toLocaleString()}</span>
                         </div>
                       )}
                       {(item.discount_amount || 0) > 0 && (
                         <div className="flex justify-between text-green-600 dark:text-green-400">
                           <span>Discount ({item.discount_percentage}%):</span>
                           <span>-£{(item.discount_amount || 0).toLocaleString()}</span>
                         </div>
                       )}
                       <div className="border-t pt-2 flex justify-between font-medium">
                         <span>Subtotal:</span>
                         <span>£{(item.total_cost || 0).toLocaleString()}</span>
                       </div>
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
              <CardTitle className="text-lg">
                {user ? "Submit Your Quote" : "Submit Your Quote"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {user 
                  ? "Your quote will be sent to your client portal" 
                  : "Get professional consultation within 24 hours"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                // Simplified form for authenticated users
                <div className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Logged in as {user.email}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your quote will be automatically associated with your account and sent to your client portal.
                    </p>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      console.log('🖱️ Submit button clicked for authenticated user');
                      e.preventDefault();
                      handleSubmitQuote();
                    }}
                    size="lg"
                    className="w-full"
                    disabled={quotesLoading}
                  >
                    {quotesLoading ? "Submitting..." : "Submit Quote to Portal"}
                  </Button>
                </div>
              ) : (
                // Full form for non-authenticated users
                <>
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
                    <Label htmlFor="contact_company">Company</Label>
                    <Input
                      id="contact_company"
                      value={contactDetails.contact_company}
                      onChange={(e) => setContactDetails(prev => ({ ...prev, contact_company: e.target.value }))}
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={contactDetails.website}
                      onChange={(e) => setContactDetails(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional_requirements">Additional Requirements</Label>
                    <Textarea
                      id="additional_requirements"
                      value={contactDetails.additional_requirements}
                      onChange={(e) => setContactDetails(prev => ({ ...prev, additional_requirements: e.target.value }))}
                      placeholder="Tell us about your campaign objectives, timeline, or any special requirements..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitQuote}
                    size="lg"
                    className="w-full"
                    disabled={quotesLoading}
                  >
                    {quotesLoading ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};