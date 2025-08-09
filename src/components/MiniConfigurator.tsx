import React from "react";
import { usePlanDraft, DraftItem } from "@/state/plan";
import { countPrintRuns } from "@/utils/periods";
import { formatCurrency } from "@/utils/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { inchargePeriods } from "@/data/inchargePeriods";

export default function MiniConfigurator({
  format,
  defaultSaleRate,
}: {
  format: { id: string; name: string };
  defaultSaleRate: number;
}) {
  const { items, upsert, remove } = usePlanDraft();
  const existingItem = items.find(item => item.formatId === format.id);
  
  const [quantity, setQuantity] = React.useState(existingItem?.quantity || 1);
  const [periods, setPeriods] = React.useState<number[]>(existingItem?.selectedPeriods || []);
  const [creativeAssets, setCreativeAssets] = React.useState(existingItem?.creativeAssets || 0);
  
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>(existingItem?.locations || []);

  // Initialize with existing data
  React.useEffect(() => {
    if (existingItem) {
      setQuantity(existingItem.quantity);
      setPeriods(existingItem.selectedPeriods);
      setCreativeAssets(existingItem.creativeAssets);
      setSelectedLocations(existingItem.locations);
    }
  }, [existingItem]);

  // Calculate costs using existing rate card logic
  const runs = countPrintRuns(periods);
  const productionCost = quantity * runs * 35; // Simplified - would use actual tier lookups
  const creativeCost = creativeAssets * 85; // Simplified - would use actual tier lookups

  const saleRate = defaultSaleRate;
  
  const handlePeriodToggle = (periodNumber: number) => {
    setPeriods(prev => {
      if (prev.includes(periodNumber)) {
        return prev.filter(p => p !== periodNumber);
      } else {
        return [...prev, periodNumber].sort((a, b) => a - b);
      }
    });
  };

  const saveConfiguration = () => {
    const draft: DraftItem = {
      id: format.id,
      formatId: format.id,
      formatName: format.name,
      saleRate,
      quantity,
      selectedPeriods: periods,
      locations: selectedLocations,
      creativeAssets,
      productionCost,
      creativeCost,
    };
    upsert(draft);
  };

  const removeConfiguration = () => {
    remove(format.id);
  };

  const uniquePeriods = [...new Set(periods)].length;
  const isConfigured = existingItem !== undefined;

  return (
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
            <Label htmlFor={`quantity-${format.id}`}>Number of sites</Label>
            <Input
              id={`quantity-${format.id}`}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>

          {/* Periods */}
          <div>
            <Label>Campaign periods</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {inchargePeriods.map((period) => (
                <Badge
                  key={period.period_number}
                  variant={periods.includes(period.period_number) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handlePeriodToggle(period.period_number)}
                >
                  {period.label}
                </Badge>
              ))}
            </div>
            {periods.length > 1 && runs > 1 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Note: Non-consecutive in-charge periods will require additional print runs.
                This affects production costs only and does not change your media rate.
              </div>
            )}
          </div>

          {/* Location Selection */}
          <div>
            <Label>Locations ({selectedLocations.length} selected)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Central London', 'North London', 'South London', 'East London', 'West London'].map((location) => (
                <Badge
                  key={location}
                  variant={selectedLocations.includes(location) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedLocations(prev => 
                      prev.includes(location) 
                        ? prev.filter(l => l !== location)
                        : [...prev, location]
                    );
                  }}
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>

          {/* Creative Assets */}
          <div>
            <Label htmlFor={`creative-${format.id}`}>Creative assets needed</Label>
            <Input
              id={`creative-${format.id}`}
              type="number"
              min="0"
              value={creativeAssets}
              onChange={(e) => setCreativeAssets(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          {/* Cost Preview */}
          <div className="bg-muted/20 p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <div>Media cost: {formatCurrency(saleRate * quantity * uniquePeriods)}</div>
              {uniquePeriods >= 3 && (
                <div className="text-primary">
                  💰 Volume discount (10%): -{formatCurrency(saleRate * quantity * uniquePeriods * 0.1)}
                </div>
              )}
              <div>Est. production: {formatCurrency(productionCost)}</div>
              <div>Est. creative: {formatCurrency(creativeCost)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={saveConfiguration}
              disabled={periods.length === 0 || selectedLocations.length === 0}
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
  );
}