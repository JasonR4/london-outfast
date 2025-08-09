import React, { useState, useEffect } from "react";
import { usePlanDraft } from "@/state/plan";
import { countPrintRuns } from "@/utils/periods";
import { formatCurrency } from "@/utils/money";
import { useRateCards } from "@/hooks/useRateCards";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LocationSelector } from "@/components/LocationSelector";
import { Info } from "lucide-react";

interface MiniConfiguratorProps {
  format: { 
    id: string; 
    name: string; 
    format_slug: string;
  };
}

export default function MiniConfigurator({ format }: MiniConfiguratorProps) {
  const { getItem, upsertItem, removeItem } = usePlanDraft();
  const existingItem = getItem(format.id);
  
  // Fetch rate card data for this specific format
  const {
    rateCards,
    getAllAvailablePeriods,
    getAvailableLocations,
    calculatePrice,
    calculateProductionCost,
    calculateCreativeCost,
    loading: rateCardsLoading
  } = useRateCards(format.format_slug);

  // Local state
  const [quantity, setQuantity] = useState(existingItem?.quantity || 1);
  const [creativeQuantity, setCreativeQuantity] = useState(existingItem?.creativeQuantity || 0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(existingItem?.locations || []);
  const [selectedInCharges, setSelectedInCharges] = useState<string[]>(existingItem?.inCharges || []);

  // Available options from rate cards
  const availablePeriods = getAllAvailablePeriods();
  const availableLocations = getAvailableLocations();
  const maxUnits = 250; // Default max, could come from rate card in future

  // Generate quantity options
  const quantityOptions = Array.from({ length: Math.min(maxUnits, 50) }, (_, i) => i + 1);
  const creativeOptions = Array.from({ length: 21 }, (_, i) => i);

  // Initialize with existing data
  useEffect(() => {
    if (existingItem) {
      setQuantity(existingItem.quantity);
      setCreativeQuantity(existingItem.creativeQuantity);
      setSelectedLocations(existingItem.locations);
      setSelectedInCharges(existingItem.inCharges);
    }
  }, [existingItem]);

  // Calculate costs when values change
  useEffect(() => {
    if (rateCardsLoading || !rateCards.length || !selectedLocations.length || !selectedInCharges.length) {
      return;
    }

    calculateAndUpdate();
  }, [quantity, creativeQuantity, selectedLocations, selectedInCharges, rateCards, rateCardsLoading]);

  const calculateAndUpdate = () => {
    if (!rateCards.length || !selectedLocations.length || !selectedInCharges.length) return;

    // Get the primary rate card (first one for now)
    const primaryRateCard = rateCards[0];
    const saleRatePerInCharge = primaryRateCard?.sale_price || primaryRateCard?.base_rate_per_incharge || 0;
    
    // Convert period IDs to numbers for calculation
    const periodNumbers = selectedInCharges.map(id => {
      const period = availablePeriods.find(p => p.id === id);
      return period?.period_number || 0;
    }).filter(n => n > 0);

    // Media cost calculation
    const uniquePeriods = [...new Set(periodNumbers)].length;
    const mediaCost = saleRatePerInCharge * quantity * uniquePeriods;
    
    // Volume discount (10% for 3+ periods)
    const qualifiesVolume = uniquePeriods >= 3;
    const discountAmount = qualifiesVolume ? mediaCost * 0.10 : 0;
    const mediaAfterDiscount = mediaCost - discountAmount;

    // Production cost
    const productionResult = calculateProductionCost(quantity, periodNumbers);
    const productionCost = productionResult?.totalCost || 0;

    // Creative cost
    const creativeCost = creativeQuantity > 0 
      ? (calculateCreativeCost(selectedLocations[0], creativeQuantity, "Basic Design")?.totalCost || 0)
      : 0;

    // Total
    const totalCost = mediaAfterDiscount + productionCost + creativeCost;

    // Update the draft store
    upsertItem(format.id, {
      formatName: format.name,
      quantity,
      creativeQuantity,
      locations: selectedLocations,
      inCharges: selectedInCharges,
      rates: {
        saleRatePerInCharge,
        productionRatePerUnit: productionResult?.costPerUnit || 0,
        creativeCost: creativeCost / Math.max(creativeQuantity, 1)
      },
      mediaCost: mediaAfterDiscount,
      productionCost,
      creativeCost,
      totalCost,
      discountAmount,
      qualifiesVolume
    });
  };

  const handleInChargeToggle = (periodId: string) => {
    setSelectedInCharges(prev => {
      if (prev.includes(periodId)) {
        return prev.filter(id => id !== periodId);
      } else {
        return [...prev, periodId];
      }
    });
  };

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(location)) {
        return prev.filter(l => l !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleSelectAllPeriods = () => {
    if (selectedInCharges.length === availablePeriods.length) {
      setSelectedInCharges([]);
    } else {
      setSelectedInCharges(availablePeriods.map(p => p.id));
    }
  };

  const removeConfiguration = () => {
    removeItem(format.id);
    setQuantity(1);
    setCreativeQuantity(0);
    setSelectedLocations([]);
    setSelectedInCharges([]);
  };

  const isConfigured = existingItem !== undefined;
  const saleRate = rateCards[0]?.sale_price || rateCards[0]?.base_rate_per_incharge || 0;

  if (rateCardsLoading) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`border-2 ${isConfigured ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg">{format.name}</h4>
              {isConfigured && (
                <Badge variant="secondary" className="mt-1">
                  Configured
                </Badge>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Sale rate: {formatCurrency(saleRate)} per in-charge
            </div>
          </div>

          <div className="space-y-4">
            {/* Quantity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor={`quantity-${format.id}`}>Number of sites</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of sites/units booked for this format.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="max-h-48 overflow-y-auto">
                    {quantityOptions.map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} site{num !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Locations */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Locations ({selectedLocations.length} selected)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Where your media will run — pick multiple.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <LocationSelector
                selectedLocations={selectedLocations}
                onSelectionChange={setSelectedLocations}
                showSelectedSummary={false}
                maxHeight="200px"
              />
            </div>

            {/* In-Charge Periods */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Campaign periods ({selectedInCharges.length} selected)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Campaign periods your media will run.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {availablePeriods.length > 0 && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllPeriods}
                    className="mb-2"
                  >
                    {selectedInCharges.length === availablePeriods.length ? 'Deselect All' : 'Select All'}
                  </Button>
                   <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                     {availablePeriods.map((period) => {
                       const formatDate = (dateStr: string) => {
                         const date = new Date(dateStr);
                         return date.toLocaleDateString('en-GB', { 
                           day: '2-digit', 
                           month: '2-digit', 
                           year: 'numeric' 
                         });
                       };
                       
                       return (
                         <Badge
                           key={period.id}
                           variant={selectedInCharges.includes(period.id) ? "default" : "outline"}
                           className="cursor-pointer text-xs p-2 justify-center"
                           onClick={() => handleInChargeToggle(period.id)}
                         >
                           Period {period.period_number}: {formatDate(period.start_date)} - {formatDate(period.end_date)}
                         </Badge>
                       );
                     })}
                   </div>
                </div>
              )}
              {selectedInCharges.length > 1 && countPrintRuns(selectedInCharges.map(id => {
                const period = availablePeriods.find(p => p.id === id);
                return period?.period_number || 0;
              }).filter(n => n > 0)) > 1 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Note: Non-consecutive in-charge periods will require additional print runs.
                  This affects production costs only and does not change your media rate.
                </div>
              )}
            </div>

            {/* Creative Assets */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor={`creative-${format.id}`}>Creative assets needed</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                   <TooltipContent>
                     <p>Do you need creative design work for your campaign?</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={creativeQuantity.toString()} onValueChange={(value) => setCreativeQuantity(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="max-h-48 overflow-y-auto">
                    {creativeOptions.map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} asset{num !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Cost Preview */}
            {existingItem && (
              <div className="bg-muted/20 p-3 rounded-lg">
                <div className="text-sm space-y-1">
                  <div>Media cost: {formatCurrency(existingItem.mediaCost + existingItem.discountAmount)}</div>
                  {existingItem.qualifiesVolume && (
                    <div className="text-primary">
                      💰 Volume discount (10%): -{formatCurrency(existingItem.discountAmount)}
                    </div>
                  )}
                  <div>Production cost: {formatCurrency(existingItem.productionCost)}</div>
                  <div>Creative cost: {formatCurrency(existingItem.creativeCost)}</div>
                  <hr className="my-1" />
                  <div className="font-semibold">Total: {formatCurrency(existingItem.totalCost)}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={calculateAndUpdate}
                disabled={selectedInCharges.length === 0 || selectedLocations.length === 0}
                className="flex-1"
              >
                Save Configuration
              </Button>
              {isConfigured && (
                <Button variant="outline" onClick={removeConfiguration}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}