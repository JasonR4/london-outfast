import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, MapPin, Calendar, Palette, Info, Trash2 } from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/utils/periods";
import { Skeleton } from "@/components/ui/skeleton";
import { getRateCard, type RateCardResponse } from "@/services/rateCard";
import { usePlanDraft } from "@/state/plan";

interface MiniConfiguratorProps {
  format: {
    id: string;
    name: string;
    format_slug: string;
  };
}

export const MiniConfigurator = ({ format }: MiniConfiguratorProps) => {
  const { getItem, upsertItem, removeItem } = usePlanDraft();
  
  // Rate card data and loading state
  const [rateCardData, setRateCardData] = useState<RateCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApiError, setHasApiError] = useState(false);

  // Local state for configuration
  const [quantity, setQuantity] = useState(1);
  const [creativeAssets, setCreativeAssets] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);

  // Get existing draft item for this format
  const existingItem = getItem(format.id);

  // Fetch rate card data on mount or format change
  useEffect(() => {
    const fetchRateCardData = async () => {
      setLoading(true);
      setHasApiError(false);
      try {
        const data = await getRateCard(format.id);
        setRateCardData(data);
      } catch (error) {
        console.error('Error fetching rate card:', error);
        setHasApiError(true);
        // Use fallback data
        setRateCardData({
          saleRatePerInCharge: 0,
          productionRatePerUnit: 0,
          creativeUnit: 85,
          maxUnits: 100,
          locations: [{ id: 'GD', name: 'Greater London', type: 'zone' }],
          inCharges: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRateCardData();
  }, [format.id]);

  // Initialize from existing data
  useEffect(() => {
    if (existingItem) {
      setQuantity(existingItem.quantity);
      setCreativeAssets(existingItem.creativeAssets);
      setSelectedLocations(existingItem.locations);
      setSelectedPeriods(existingItem.selectedPeriods);
    }
  }, [existingItem]);

  // Calculate costs and update draft when relevant state changes
  useEffect(() => {
    if (quantity > 0 && selectedLocations.length > 0 && selectedPeriods.length > 0 && rateCardData && !loading) {
      calculateAndUpdate();
    }
  }, [quantity, creativeAssets, selectedLocations, selectedPeriods, rateCardData, loading]);

  const calculateAndUpdate = () => {
    if (!rateCardData || !selectedLocations.length) return;

    const uniquePeriods = [...new Set(selectedPeriods)];
    const inCharges = quantity * uniquePeriods.length;
    
    // Use rate card data with fallbacks
    const saleRate = rateCardData.saleRatePerInCharge || 0;
    const productionRate = rateCardData.productionRatePerUnit || 0;
    const creativeRate = rateCardData.creativeUnit || 85;
    
    // Volume discount: 10% for 3+ periods
    const qualifiesVolume = uniquePeriods.length >= 3;
    const mediaCost = saleRate * inCharges;
    const discountAmount = qualifiesVolume ? mediaCost * 0.10 : 0;
    const mediaAfterDiscount = mediaCost - discountAmount;

    // Production cost (using print runs)
    const printRuns = countPrintRuns(selectedPeriods);
    const productionCost = productionRate * quantity * printRuns;

    // Creative cost
    const creativeCost = creativeRate * creativeAssets;

    const totalCost = mediaAfterDiscount + productionCost + creativeCost;

    // Capacity validation
    const capacity = quantity * uniquePeriods.length;
    const capacityWarning = selectedLocations.length > capacity 
      ? `You have selected ${selectedLocations.length} locations but capacity is ${capacity} (sites × periods). Reduce selections or increase capacity.`
      : undefined;

    // Update draft store
    upsertItem(format.id, {
      formatName: format.name,
      saleRatePerInCharge: saleRate,
      productionRatePerUnit: productionRate,
      creativeUnit: creativeRate,
      quantity,
      selectedPeriods,
      locations: selectedLocations,
      creativeAssets,
      validation: capacityWarning ? { capacityWarning } : undefined,
      mediaCost: mediaAfterDiscount,
      productionCost,
      creativeCost,
      totalCost,
      discountAmount,
      qualifiesVolume
    });
  };

  const handleRemove = () => {
    removeItem(format.id);
  };

  const formatPeriodLabel = (period: { period_number: number; start_date: string; end_date: string }) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };
    
    return `Period ${period.period_number} (${formatDate(period.start_date)} - ${formatDate(period.end_date)})`;
  };

  const togglePeriod = (periodNumber: number) => {
    setSelectedPeriods(prev => 
      prev.includes(periodNumber)
        ? prev.filter(p => p !== periodNumber)
        : [...prev, periodNumber].sort((a, b) => a - b)
    );
  };

  const isConfigured = quantity > 0 && selectedLocations.length > 0 && selectedPeriods.length > 0;
  const currentCost = existingItem?.totalCost || 0;
  const capacityWarning = existingItem?.validation?.capacityWarning;
  const hasCreativeAssets = creativeAssets > 0;
  const printRuns = countPrintRuns(selectedPeriods);
  const needsMultiplePrintRuns = printRuns > 1;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`transition-all duration-200 ${isConfigured ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{format.name}</span>
              {isConfigured && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
            <div className="flex items-center gap-2">
              {isConfigured && (
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(currentCost)}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quantity Selection */}
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Quantity (sites)</label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of sites/units booked for this format.</p>
              </TooltipContent>
            </Tooltip>
            <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select quantity" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: Math.min(rateCardData?.maxUnits || 50, 100) }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} site{num !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Creative Assets Selection */}
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Do you need creative design?</label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Design & artwork creation costs.</p>
              </TooltipContent>
            </Tooltip>
            <Select value={creativeAssets.toString()} onValueChange={(value) => setCreativeAssets(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select creative assets" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="0">No creative needed</SelectItem>
                {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} creative asset{num !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Locations</label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Where your media will run — pick multiple.</p>
              </TooltipContent>
            </Tooltip>
            <LocationSelector
              selectedLocations={selectedLocations}
              onSelectionChange={setSelectedLocations}
              title="Select Areas"
              description="Choose where your ads will run"
              maxHeight="200px"
              showSelectedSummary={false}
            />
          </div>

          {/* In-Charge Periods Selection */}
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Campaign Periods (In-Charges)</label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>The campaign periods your media will run.</p>
              </TooltipContent>
            </Tooltip>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
              {rateCardData?.inCharges && rateCardData.inCharges.length > 0 ? (
                rateCardData.inCharges.map((period) => (
                  <button
                    key={period.period_number}
                    onClick={() => togglePeriod(period.period_number)}
                    className={`text-xs p-2 rounded text-left transition-colors ${
                      selectedPeriods.includes(period.period_number)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {formatPeriodLabel(period)}
                  </button>
                ))
              ) : (
                // Fallback periods when rate card doesn't have periods
                Array.from({ length: 11 }, (_, i) => {
                  const periodNumber = i + 16; // Periods 16-26
                  const startDate = new Date(2025, 6, 29 + (i * 14)); // Starting July 29, 2025, 14-day periods
                  const endDate = new Date(startDate);
                  endDate.setDate(startDate.getDate() + 13);
                  
                  return (
                    <button
                      key={periodNumber}
                      onClick={() => togglePeriod(periodNumber)}
                      className={`text-xs p-2 rounded text-left transition-colors ${
                        selectedPeriods.includes(periodNumber)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      Period {periodNumber} ({startDate.toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })} - {endDate.toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })})
                    </button>
                  );
                })
              )}
            </div>
            {selectedPeriods.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Selected: {selectedPeriods.join(', ')}
              </div>
            )}
          </div>

          {/* Cost Preview */}
          {isConfigured && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium">Cost Preview</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Media cost:</span>
                  <span>{formatCurrency(existingItem?.mediaCost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Production cost:</span>
                  <span>{formatCurrency(existingItem?.productionCost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Creative cost:</span>
                  <span>{formatCurrency(existingItem?.creativeCost || 0)}</span>
                </div>
                {existingItem?.discountAmount && existingItem.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Volume discount:</span>
                    <span>-{formatCurrency(existingItem.discountAmount)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(currentCost)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Capacity Warning */}
          {capacityWarning && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">{capacityWarning}</p>
            </div>
          )}

          {/* Print Runs Notice */}
          {needsMultiplePrintRuns && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Non-consecutive in-charge periods will require {printRuns} print runs. This affects production costs only and does not change your media rate.
              </p>
            </div>
          )}

          {/* API Error Warning */}
          {hasApiError && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-800">
                Unable to load rate data. Using default rates. 
                {rateCardData?.creativeUnit === 85 && hasCreativeAssets && (
                  <span className="ml-1">
                    <Badge variant="outline" className="text-xs">default creative rate applied</Badge>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Creative Zero Warning */}
          {hasCreativeAssets && rateCardData?.creativeUnit === 0 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-800">
                Creative cost data unavailable. Using default rate.
                <Badge variant="outline" className="text-xs ml-1">default creative rate applied</Badge>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!isConfigured ? (
              <Button 
                variant="outline" 
                className="flex-1" 
                disabled={!quantity || !selectedLocations.length || !selectedPeriods.length || !!capacityWarning}
              >
                Configure above to save
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleRemove}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Badge variant="secondary" className="flex-1 justify-center py-2">
                  Configuration Saved
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default MiniConfigurator;