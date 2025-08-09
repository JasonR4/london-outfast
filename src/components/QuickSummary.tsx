import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/utils/periods";
import { usePlanStore, mediaCostBeforeDiscount, volumeDiscount, mediaCostAfterDiscount, productionCost, creativeCost } from "@/state/planStore";

export default function QuickSummary() {
  const items = usePlanStore(state => state.items);
  
  console.log('🔍 QuickSummary items from plan store:', items);

  const {
    formatNames,
    fullFormatList,
    formatCount,
    sites,
    locationsCount,
    uniquePeriods,
    creatives,
    printRuns,
    mediaAfterDiscount,
    volumeDiscountAmount,
    production,
    creative,
    estimate,
  } = useMemo(() => {
    console.log('🔍 Processing QuickSummary with items:', items);
    
    const names: string[] = [];
    let sites = 0;
    const allLocations: string[] = [];
    const periodSet = new Set<string>();
    let creatives = 0;
    let printRuns = 0;
    let mediaAfterDiscount = 0;
    let volumeDiscountAmount = 0;
    let production = 0;
    let creative = 0;

    for (const item of items) {
      if (item?.formatName) names.push(item.formatName);
      sites += Number(item?.sites || 0);
      (item?.locations || []).forEach((l: string) => allLocations.push(l));
      (item?.periods || []).forEach((p: string) => periodSet.add(p));
      creatives += Number(item?.creativeAssets || 0);
      
      // Use the plan store calculation functions for consistency
      mediaAfterDiscount += mediaCostAfterDiscount(item);
      volumeDiscountAmount += Math.abs(volumeDiscount(item)); // Make positive for display
      production += productionCost(item);
      creative += creativeCost(item);
      printRuns += item?.printRuns || 1;
    }

    // Show up to 2 names, then "+N more"
    const uniqueNames = Array.from(new Set(names));
    const display =
      uniqueNames.length <= 2
        ? uniqueNames.join(", ")
        : `${uniqueNames.slice(0, 2).join(", ")} +${uniqueNames.length - 2} more`;

    const estimate = mediaAfterDiscount + production + creative;

    return {
      formatNames: display,
      fullFormatList: uniqueNames.join(", "),
      formatCount: uniqueNames.length,
      sites,
      locationsCount: new Set(allLocations).size,
      uniquePeriods: Array.from(periodSet).sort((a, b) => Number(a) - Number(b)),
      creatives,
      printRuns,
      mediaAfterDiscount,
      volumeDiscountAmount,
      production,
      creative,
      estimate,
    };
  }, [items]);

  // Derive mediaBefore from after + discount so we can show both
  const mediaBeforeDiscount = mediaAfterDiscount + volumeDiscountAmount;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="space-y-1">
            <div className="text-muted-foreground">Formats:</div>
            <div className="font-medium">{formatCount} {formatCount === 1 ? "format" : "formats"}</div>
            {formatNames && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="line-clamp-2 max-h-10 overflow-hidden text-ellipsis whitespace-normal cursor-help text-xs text-muted-foreground"
                    title={fullFormatList}
                  >
                    {formatNames}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{fullFormatList}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="grid grid-cols-2 gap-y-1">
            <span className="text-muted-foreground">Sites:</span>
            <span className="text-right font-medium">{sites}</span>

            <span className="text-muted-foreground">Locations selected:</span>
            <span className="text-right font-medium">{locationsCount}</span>

            <span className="text-muted-foreground">Campaign periods:</span>
            <span className="text-right font-medium truncate">
              {uniquePeriods.length ? uniquePeriods.join(", ") : "—"}
            </span>

            <span className="text-muted-foreground">Creatives:</span>
            <span className="text-right font-medium">{creatives}</span>

            <span className="text-muted-foreground">Print runs:</span>
            <span className="text-right font-medium">{printRuns}</span>
          </div>

          <hr className="my-2" />

          <div className="grid grid-cols-2 gap-y-1">
            <span className="text-muted-foreground">Media (before discount):</span>
            <span className="text-right font-medium">{formatCurrency(mediaBeforeDiscount)}</span>

            <span className="text-muted-foreground flex items-center gap-1">
              Volume discount
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Applied when booking over 3 campaign periods. More periods = bigger savings.</p>
                </TooltipContent>
              </Tooltip>
              :
            </span>
            <span className="text-right font-medium text-green-600">
              - {formatCurrency(volumeDiscountAmount)}
            </span>

            <span className="text-muted-foreground">Media (after discount):</span>
            <span className="text-right font-medium">{formatCurrency(mediaAfterDiscount)}</span>

            <span className="text-muted-foreground">Production:</span>
            <span className="text-right font-medium">{formatCurrency(production)}</span>

            <span className="text-muted-foreground">Creative:</span>
            <span className="text-right font-medium">{formatCurrency(creative)}</span>
          </div>

          <hr className="my-2" />

          <div className="flex justify-between text-sm font-semibold">
            <span>Estimate total:</span>
            <span>{formatCurrency(estimate)}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}