import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/utils/periods";
import { usePlanStore, uniqueCampaignPeriods, mediaCostBeforeDiscount, volumeDiscount, productionCost, creativeCost } from "@/state/planStore";

export default function QuickSummary() {
  // Stable subscription - no new objects created each render
  const items = usePlanStore(s => s.items);
  
  console.log('🔍 QuickSummary items:', items.length);

  // Show nothing if no valid items
  if (!items || items.length === 0) return null;

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
    console.log('🔍 Processing QuickSummary with valid items:', items);
    
    const formatsList = items.map(i => i.name).filter(Boolean);
    const sites = items.reduce((a,i)=>a + (i.sites ?? 0), 0);
    const periods = uniqueCampaignPeriods(items);
    const allLocations: string[] = [];
    
    // Aggregate locations from all items
    items.forEach(item => {
      (item?.locations || []).forEach((l: string) => allLocations.push(l));
    });

    // Costs using plan store functions for consistency
    const mediaBefore = items.reduce((a,i)=>a + mediaCostBeforeDiscount(i), 0);
    const volDisc = items.reduce((a,i)=>a + volumeDiscount(i), 0);
    const mediaAfter = mediaBefore + volDisc;
    const production = items.reduce((a,i)=>a + productionCost(i), 0);
    const creative = items.reduce((a,i)=>a + creativeCost(i), 0);
    const total = mediaAfter + production + creative;
    
    const creatives = items.reduce((a,i)=>a + (i.creativeAssets ?? 0), 0);
    const printRuns = items.reduce((a,i)=>a + (i.printRuns ?? 1), 0);

    // Show up to 2 names, then "+N more"
    const uniqueNames = Array.from(new Set(formatsList));
    const display = uniqueNames.length > 1 
      ? `${uniqueNames.length} formats` 
      : (uniqueNames[0] ?? "1 format");

    return {
      formatNames: display,
      fullFormatList: uniqueNames.join(", "),
      formatCount: uniqueNames.length,
      sites,
      locationsCount: new Set(allLocations).size,
      uniquePeriods: periods,
      creatives,
      printRuns,
      mediaAfterDiscount: mediaAfter,
      volumeDiscountAmount: Math.abs(volDisc),
      production,
      creative,
      estimate: total,
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