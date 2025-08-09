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
import { Search, MapPin, Zap, Calculator, CheckCircle2, AlertTriangle, Info, Palette, ChevronDown, X } from "lucide-react";
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
import { formatCurrency } from '@/utils/money';
import { countPrintRuns } from '@/utils/periods';
import PlanBreakdown from '@/components/PlanBreakdown';
import { usePlanDraft } from '@/state/plan';
import MiniConfigurator from '@/components/MiniConfigurator';
import QuickSummary from '@/components/QuickSummary';
import { usePlanStore } from '@/state/planStore';

interface SmartQuoteFormProps {
  onQuoteSubmitted?: () => void;
}

export const SmartQuoteForm = ({ onQuoteSubmitted }: SmartQuoteFormProps) => {
  console.log('🚀 SmartQuoteForm component rendering');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentQuote, addQuoteItem, removeQuoteItem, submitQuote, createOrGetQuote, loading: quotesLoading, fetchCurrentQuote } = useQuotes();
  
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
  const [creativeQuantity, setCreativeQuantity] = useState(1);
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
    rateCards,
    inchargePeriods,
    calculatePrice, 
    calculateProductionCost, 
    calculateCreativeCost,
    getAvailablePeriodsForLocation,
    getAllAvailablePeriods,
    getAvailableCreativeCategories,
    creativeCostTiers,
    loading: rateCardsLoading 
  } = useRateCards(selectedFormats[0]?.format_slug);

  // Get creative cost
  const creativeResult = needsCreative && selectedLocations.length > 0 
    ? calculateCreativeCost(selectedLocations[0], creativeQuantity, "London Underground (TfL)")
    : null;
  
  // Creative capacity logic
  const creativeCapacity = useCreativeCapacity({
    sites: totalQuantity,
    creativeAssets: creativeQuantity,
    needsCreative,
    creativeCostPerAsset: creativeResult?.costPerUnit || 0
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

  // Initialize quote on component mount and clear stale plan store data
  useEffect(() => {
    createOrGetQuote();
    // Clear plan store on fresh component mount to prevent showing stale data
    const { clear } = usePlanStore.getState();
    clear();
  }, []);

  // Clear plan store when starting fresh search (no selections)
  useEffect(() => {
    if (selectedFormats.length === 0 && selectedPeriods.length === 0 && selectedLocations.length === 0) {
      const { clear } = usePlanStore.getState();
      clear();
    }
  }, [selectedFormats.length, selectedPeriods.length, selectedLocations.length]);

  // Sync plan store with current configuration to keep pricing tab updated
  useEffect(() => {
    // Only sync if we have actual selections to avoid clearing valid data
    if (selectedFormats.length > 0) {
      const { setItems } = usePlanStore.getState();
      
      // Build plan items from current selection state
      const planItems = selectedFormats.map(format => {
        const quantity = formatQuantities[format.format_slug] || 1;
        const rateCard = rateCards.find(rc => rc.media_format_id === format.id);
        const saleRate = rateCard?.sale_price || 800; // fallback rate
        
        return {
          id: format.format_slug,
          formatId: format.format_slug,
          formatName: format.format_name,
          saleRate,
          sites: quantity,
          periods: selectedPeriods.map(String), // convert to string array
          locations: selectedLocations,
          productionRate: 25, // default production rate
          printRuns: countPrintRuns(selectedPeriods),
          creativeAssets: needsCreative ? creativeQuantity : 0,
          creativeRate: needsCreative ? 350 : 0 // default creative rate
        };
      });
      
      setItems(planItems);
    }
  }, [selectedFormats, formatQuantities, selectedPeriods, selectedLocations, needsCreative, creativeQuantity, rateCards]);

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
        mediaDiscount: 0,
        mediaAfterDiscount: 0,
        qualifiesVolume: false,
        originalCost: 0
      };
    }

    const totals = currentQuote.quote_items.reduce((acc, item) => {
      acc.mediaPrice += item.base_cost || 0;
      acc.productionCost += item.production_cost || 0;
      acc.creativeCost += item.creative_cost || 0;
      acc.totalCost += item.total_cost || 0;
      acc.mediaDiscount += item.discount_amount || 0;
      return acc;
    }, {
      mediaPrice: 0,
      productionCost: 0,
      creativeCost: 0,
      totalCost: 0,
      mediaDiscount: 0,
      mediaAfterDiscount: 0,
      qualifiesVolume: false,
      originalCost: 0
    });

    // Calculate mediaAfterDiscount for quote totals
    totals.mediaAfterDiscount = totals.mediaPrice - totals.mediaDiscount;
    totals.qualifiesVolume = totals.mediaDiscount > 0;

    console.log('📊 Quote total costs:', totals);
    console.log('📋 Quote items:', currentQuote.quote_items);
    
    return totals;
  };

  // Calculate total pricing for current item configuration using standardized volume discount
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
        mediaDiscount: 0,
        qualifiesVolume: false,
        originalCost: 0 
      };
    }

    // Standardized calculation inputs
    const units = totalQuantity;
    const uniquePeriods = [...new Set(selectedPeriods)].length;
    const saleRate = rateCards[0]?.sale_price || 800; // Use first rate card's sale price

    // Volume discount eligibility: 10% for 3+ in-charge periods
    const qualifiesVolume = uniquePeriods >= 3;

    // Media cost calculation
    const mediaCost = saleRate * units * uniquePeriods;
    const mediaDiscount = qualifiesVolume ? mediaCost * 0.10 : 0;
    const mediaAfterDiscount = mediaCost - mediaDiscount;

    // Production cost (print runs calculation)
    let totalProductionCost = 0;
    if (selectedLocations.length > 0) {
      const productionPrice = calculateProductionCost(totalQuantity, selectedPeriods);
      if (productionPrice && productionPrice.totalCost !== undefined) {
        totalProductionCost = productionPrice.totalCost;
        console.log(`🏭 Production cost for ${totalQuantity} sites × ${selectedPeriods.length} periods: ${totalProductionCost}`);
      }
    }

    // Creative cost
    let totalCreativeCost = 0;
    if (needsCreative && selectedLocations.length > 0) {
      const creativePrice = calculateCreativeCost(selectedLocations[0], creativeQuantity, "London Underground (TfL)");
      if (creativePrice && creativePrice.totalCost !== undefined) {
        totalCreativeCost = creativePrice.totalCost;
        console.log(`🎨 Creative cost: ${totalCreativeCost}`);
      }
    }

    // Totals
    const subtotal = mediaAfterDiscount + totalProductionCost + totalCreativeCost;
    const result = {
      mediaPrice: mediaCost,
      mediaAfterDiscount,
      mediaDiscount,
      qualifiesVolume,
      productionCost: totalProductionCost,
      creativeCost: totalCreativeCost,
      totalCost: subtotal,
      originalCost: mediaCost + totalProductionCost + totalCreativeCost
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
        
        // Remove from plan store to sync pricing tab
        const { removeItem } = usePlanStore.getState();
        removeItem(format.format_slug);
        
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
      console.log('🔄 Starting to add quote items...');
      // Add each selected format as a separate quote item
      for (const format of selectedFormats) {
        console.log(`➕ Adding item for format: ${format.format_name}`);
        const success = await addQuoteItem({
          format_slug: format.format_slug,
          format_name: format.format_name,
          quantity: formatQuantities[format.format_slug] || 1,
          selected_periods: selectedPeriods,
          selected_areas: selectedLocations,
          production_cost: pricing.productionCost / selectedFormats.length,
          creative_cost: needsCreative ? (pricing.creativeCost / selectedFormats.length) : 0,
          base_cost: ('mediaAfterDiscount' in pricing ? pricing.mediaAfterDiscount : pricing.mediaPrice - (pricing.mediaDiscount || 0)) / selectedFormats.length,
          total_cost: pricing.totalCost / selectedFormats.length
        });
        console.log(`✅ Item added successfully: ${success}`);
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

    // Fetch latest quote and use it for validation
    const latest = (await fetchCurrentQuote?.()) || currentQuote;
    console.log('🔍 Latest quote for validation:', {
      quoteId: latest?.id,
      itemsArray: latest?.quote_items,
      itemsLength: latest?.quote_items?.length,
      totalCost: latest?.total_cost,
      hasLatest: !!latest
    });
    
    const itemsCount = latest?.quote_items?.length ?? 0;
    const hasItems = itemsCount > 0 || (latest?.total_cost ?? 0) > 0;
    
    console.log('🔍 Validation check:', {
      itemsCount,
      totalCost: latest?.total_cost ?? 0,
      hasItems,
      willBlock: !hasItems
    });

    if (!hasItems) {
      console.log('❌ No quote items detected - blocking submit');
      toast({
        title: "No Items in Quote",
        description: "Please add at least one item to your quote before submitting.",
        variant: "destructive"
      });
      return;
    }

    // For non-authenticated users, require contact details
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
          console.log('🔄 Navigating to create account');
          navigate('/create-account');
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

            {/* Creative Capacity Information */}
             {needsCreative && (
               <CreativeCapacityIndicator
                 sites={totalQuantity}
                 creativeAssets={creativeQuantity}
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
              <QuickSummary />
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
                    {selectedFormats.length === 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Please select at least one media format before configuring your campaign.
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedFormats.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Configure Each Format</h3>
                        <p className="text-sm text-muted-foreground">
                          Set up sites, periods, locations, and creative requirements for each selected format.
                        </p>
                        
                        <div className="space-y-4">
                          {selectedFormats.map((format) => (
                            <MiniConfigurator
                              key={format.format_slug}
                              format={{ 
                                id: format.format_slug, 
                                name: format.format_name,
                                format_slug: format.format_slug
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                  {/* Current Plan Breakdown - combines draft and saved items */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Your Current Plan</h3>
                      {/* Start new quote: clears persisted plan */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Clear the plan store
                          import("@/state/planStore").then(m => {
                            m.usePlanStore.getState().clear();
                            // Also clear the persisted session key to be 100% sure
                            try { 
                              sessionStorage.removeItem("mbl-plan-v1"); 
                            } catch {}
                          });
                          // Reset local state completely
                          setSelectedFormats([]);
                          setFormatQuantities({});
                          setSelectedPeriods([]);
                          clearAllLocations();
                          setNeedsCreative(false);
                          setCreativeQuantity(1);
                          // Navigate back to search
                          setActiveTab("search");
                        }}
                        className="text-xs"
                      >
                        Start new quote
                      </Button>
                    </div>
                     {(() => {
                        // Get current plan items from the unified store
                        const planStoreItems = usePlanStore(state => state.items);
                        
                        // If no items in plan store, show saved quote items for reference
                        const savedItems = planStoreItems.length === 0 ? (currentQuote?.quote_items || []).map((item: any) => ({
                          id: item.id || item.format_name,
                          formatId: item.format_slug || item.format_name,
                          formatName: item.format_name,
                          sites: item.quantity,
                          periods: (item.selected_periods || []).map(String),
                          saleRate: item.sale_rate_per_incharge ?? (item.base_cost && item.selected_periods?.length && item.quantity
                            ? (item.base_cost / (item.selected_periods.length * item.quantity))
                            : 0),
                          productionRate: (item.production_cost || 0) / Math.max(item.quantity || 1, 1),
                          productionCost: item.production_cost || 0,
                          creativeAssets: item.creative_cost > 0 ? 1 : 0,
                          creativeRate: item.creative_cost || 0,
                          locations: []
                        })) : [];

                        // Use plan store items for current configuration, saved items as fallback
                        const planItems = planStoreItems.length > 0 ? planStoreItems : savedItems;
                        
                        return planItems.length > 0 
                          ? <PlanBreakdown items={planItems} showKpis={true} />
                          : <div className="text-center py-8 text-muted-foreground">
                            <p>No items configured yet.</p>
                            <p className="text-sm">Configure formats above to see pricing breakdown.</p>
                          </div>;
                    })()}
                  </div>

                  {/* Show current item pricing or total quote breakdown */}
                  {currentQuote && currentQuote.quote_items && currentQuote.quote_items.length > 0 ? (
                    // Show total quote breakdown when items exist
                    <Card className="bg-gradient-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Current Item Pricing</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Media Costs:</span>
                          <span className="font-medium">{formatCurrency(quoteTotals.mediaPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Production Costs:</span>
                          <span className="font-medium">{formatCurrency(quoteTotals.productionCost)}</span>
                        </div>
                        {quoteTotals.creativeCost > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Creative Development ({currentQuote.quote_items.reduce((sum, item) => sum + (item.creative_cost || 0), 0) / 85} assets):</span>
                            <span className="font-medium">{formatCurrency(quoteTotals.creativeCost)}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Subtotal (exc VAT):</span>
                            <span className="font-medium">{formatCurrency(quoteTotals.totalCost)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>VAT (20%):</span>
                            <span>{formatCurrency(quoteTotals.totalCost * 0.20)}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                            <span>Total inc VAT:</span>
                            <span className="text-primary">{formatCurrency(quoteTotals.totalCost * 1.20)} inc VAT</span>
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
                                Media Rate Card - {totalQuantity} Units - {selectedLocations.length} Location{selectedLocations.length > 1 ? 's' : ''} × Period{selectedPeriods.length > 1 ? 's' : ''} {selectedPeriods.map(periodNum => {
                                  const period = inchargePeriods?.find(p => p.period_number === periodNum);
                                  if (period) {
                                    const startDate = new Date(period.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                    const endDate = new Date(period.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                    return `${periodNum} (${startDate} - ${endDate})`;
                                  }
                                  return periodNum;
                                }).join(', ')}
                              </h4>
                              
                              {/* Locations List */}
                              <div className="mb-4 p-3 bg-background/50 rounded border">
                                <div className="text-xs font-medium text-muted-foreground mb-2">Selected Locations:</div>
                                <div className="text-xs text-foreground leading-relaxed">
                                  {selectedLocations.join(' • ')}
                                </div>
                              </div>
                              
                              {(() => {
                                console.log('🔍 PRICING VALUES DEBUG:', {
                                  totalQuantity,
                                  selectedPeriodsLength: selectedPeriods.length,
                                  firstLocationPriceAdjustedRate: firstLocationPrice.adjustedRate,
                                  firstLocationPriceBasePrice: firstLocationPrice.basePrice,
                                  pricingMediaPrice: pricing.mediaPrice,
                                  isOnSale: firstLocationPrice.isOnSale
                                });
                                return null;
                              })()}
                              
                              {/* Rate Card Breakdown */}
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Base Rate (per unit, per period):</span>
                                  <span>{formatCurrency(firstLocationPrice.basePrice)}</span>
                                </div>
                                
                                {firstLocationPrice.isOnSale && (
                                  <>
                                    <div className="flex justify-between items-center text-green-600 text-xs">
                                      <span>Savings per unit:</span>
                                      <span>-{formatCurrency(firstLocationPrice.basePrice - (rateCards[0]?.sale_price || 800))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600">
                                      <span>Sale Rate (per unit, per period):</span>
                                      <span>{rateCards[0]?.sale_price ? formatCurrency(rateCards[0].sale_price) : formatCurrency(800)}</span>
                                    </div>
                                  </>
                                )}
                                
                                {!firstLocationPrice.isOnSale && (
                                  <>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Subtotal ({totalQuantity} units × {selectedPeriods.length} periods):</span>
                                      <span>{formatCurrency(firstLocationPrice.adjustedRate * selectedPeriods.length * totalQuantity)}</span>
                                    </div>
                                  </>
                                )}
                                
                                
                                {firstLocationPrice.isReduced && !firstLocationPrice.isOnSale && (
                                  <>
                                    <div className="flex justify-between items-center text-blue-600 font-medium">
                                      <span>🔽 Reduced Price Applied:</span>
                                      <span>{formatCurrency(pricing.mediaPrice / (1 - firstLocationPrice.discount / 100))}</span>
                                    </div>
                                     <div className="flex justify-between items-center text-blue-600 text-xs">
                                       <span>Reduction Savings:</span>
                                       <span>-{formatCurrency((firstLocationPrice.adjustedRate * selectedPeriods.length * totalQuantity) - pricing.mediaPrice)}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-blue-600 text-xs">
                                       <span>Savings per unit:</span>
                                       <span>-{formatCurrency(firstLocationPrice.adjustedRate - (pricing.mediaPrice / (totalQuantity * selectedPeriods.length)))}</span>
                                     </div>
                                  </>
                                )}
                                
                                 {pricing.qualifiesVolume && (
                                   <div className="border-t border-border/50 pt-2 mt-2">
                                     <div className="flex justify-between items-center text-green-600 font-medium">
                                       <span>💰 Volume discount (10% for 3+ in-charge periods):</span>
                                       <span>−{formatCurrency(pricing.mediaDiscount)}</span>
                                     </div>
                                     <div className="text-xs opacity-70 mt-1">
                                       That's −{formatCurrency(pricing.mediaDiscount / (totalQuantity * selectedPeriods.length))} per unit per period ({totalQuantity * selectedPeriods.length} in-charges).
                                     </div>
                                   </div>
                                 )}
                                
                                <div className="border-t border-border/50 pt-2 mt-2">
                                  <div className="flex justify-between items-center font-medium text-base">
                                    <span>Total Media Cost ({totalQuantity} units × {selectedPeriods.length} period{selectedPeriods.length !== 1 ? 's' : ''}):</span>
                                    <span className="text-primary">{formatCurrency(totalQuantity * selectedPeriods.length * (rateCards[0]?.sale_price || 800))}</span>
                                  </div>
                                  {firstLocationPrice.isOnSale && (
                                    <div className="flex justify-between items-center text-green-600 text-xs mt-1">
                                      <span>Sale Savings:</span>
                                      <span>-{formatCurrency((firstLocationPrice.basePrice - (rateCards[0]?.sale_price || 800)) * totalQuantity * selectedPeriods.length)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                         })()}

                        {/* Production Cost Details */}
                        {pricing.productionCost > 0 && (() => {
                          const productionResult = calculateProductionCost(totalQuantity, selectedPeriods);
                          if (!productionResult) return null;
                          
                              return (
                                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                  <h4 className="font-medium text-sm mb-3">
                                    Production Costs - {totalQuantity} Units
                                  </h4>
                                  
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Cost per Unit:</span>
                                      <span>{formatCurrency(productionResult.costPerUnit)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Production Units:</span>
                                      <span>{productionResult.productionUnits} units</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Periods:</span>
                                      <span>{selectedPeriods.length}</span>
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
                                        <span className="text-primary">{formatCurrency(pricing.productionCost)}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {totalQuantity} sites × {selectedPeriods.length} periods × {formatCurrency(productionResult.costPerUnit)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                        })()}

                        {/* Creative Cost Details */}
                        {needsCreative && (
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h4 className="font-medium text-sm mb-3">
                              Creative Development - {creativeQuantity} Assets
                            </h4>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Cost per Asset:</span>
                                <span>{creativeResult?.costPerUnit ? formatCurrency(creativeResult.costPerUnit) : 'Calculating...'}</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Assets:</span>
                                <span>{creativeQuantity} assets</span>
                              </div>
                                
                                <div className="border-t border-border/50 pt-2 mt-2">
                                  <div className="flex justify-between items-center font-medium text-base">
                                    <span>Total Creative Cost:</span>
                                    <span className="text-primary">{pricing.creativeCost > 0 ? formatCurrency(pricing.creativeCost) : 'Calculating...'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                        )}

                        {/* Total Summary with Standardized Volume Discount UI */}
                        <div className="border-t border-border pt-4">
                          {/* Media Cost Breakdown */}
                          <div className="space-y-1 mb-4">
                            <div className="flex justify-between">
                              <span>Media cost at sale rate</span>
                              <span>{formatCurrency(pricing.mediaPrice)}</span>
                            </div>

                             {pricing.qualifiesVolume && (
                               <>
                                 <div className="flex justify-between text-green-600">
                                   <span>💰 Volume discount (10% for 3+ in-charge periods)</span>
                                   <span>−{formatCurrency(pricing.mediaDiscount)}</span>
                                 </div>
                                 <div className="text-xs opacity-70">
                                   That's −{formatCurrency(pricing.mediaDiscount / (totalQuantity * selectedPeriods.length))} per unit per period ({totalQuantity * selectedPeriods.length} in-charges).
                                 </div>
                               </>
                             )}

                            <div className="flex justify-between font-medium">
                              <span>Media cost after discount</span>
                              <span>{formatCurrency('mediaAfterDiscount' in pricing ? pricing.mediaAfterDiscount : pricing.mediaPrice - (pricing.mediaDiscount || 0))}</span>
                            </div>
                          </div>

                          {/* Production + Creative + Totals */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Production Cost</span>
                              <span>{formatCurrency(pricing.productionCost)}</span>
                            </div>
                            {needsCreative && pricing.creativeCost > 0 && (
                              <div className="flex justify-between">
                                <span>Total Creative Cost</span>
                                <span>{formatCurrency(pricing.creativeCost)}</span>
                              </div>
                            )}
                          </div>

                          <hr className="my-2 opacity-20" />

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal (exc VAT)</span>
                              <span>{formatCurrency(pricing.totalCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>VAT (20%)</span>
                              <span>{formatCurrency(pricing.totalCost * 0.20)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Total inc VAT</span>
                              <span>{formatCurrency(pricing.totalCost * 1.20)} inc VAT</span>
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
                        onClick={() => {
                          console.log('🖱️ Add More Media Options clicked');
                          console.log('📋 Selected formats:', selectedFormats);
                          console.log('📍 Selected locations:', selectedLocations);
                          console.log('📅 Selected periods:', selectedPeriods);
                          handleAddToQuote();
                        }}
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
                          <span>{formatCurrency(item.base_cost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Production Cost:</span>
                          <span>{formatCurrency(item.production_cost || 0)}</span>
                        </div>
                        {(item.creative_cost || 0) > 0 && (
                          <div className="flex justify-between">
                            <span>Creative Development:</span>
                            <span>{formatCurrency(item.creative_cost || 0)}</span>
                          </div>
                        )}
                        {(item.discount_amount || 0) > 0 && (
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>Discount ({item.discount_percentage}%):</span>
                            <span>-{formatCurrency(item.discount_amount || 0)}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(item.total_cost || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                 <div className="border-t border-border pt-3 mt-3 space-y-2">
                   <div className="flex justify-between items-center">
                     <span>Subtotal (exc VAT):</span>
                     <span className="font-medium">{formatCurrency(currentQuote.total_cost || 0)}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm text-muted-foreground">
                     <span>VAT (20%):</span>
                     <span>{formatCurrency((currentQuote.total_cost || 0) * 0.20)}</span>
                   </div>
                   <div className="flex justify-between items-center font-semibold border-t pt-2">
                     <span>Total inc VAT:</span>
                     <span className="text-primary">{formatCurrency((currentQuote.total_cost || 0) * 1.20)}</span>
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
                // Contact form for non-authenticated users
                <>
                  {/* Sign in option for existing customers */}
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Already an MBL customer? Sign in to submit quotes directly to your portal.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Store current session ID before auth to preserve quotes
                        const currentSessionId = localStorage.getItem('quote_session_id');
                        if (currentSessionId) {
                          localStorage.setItem('quote_session_id_pre_auth', currentSessionId);
                        }
                        
                        // Store current URL for return after auth
                        localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
                        window.location.href = '/auth';
                      }}
                      className="w-full"
                    >
                      Sign In Here
                    </Button>
                  </div>

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