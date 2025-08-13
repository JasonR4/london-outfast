import { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/lib/pricingMath";
import { usePlanDraft } from "@/state/plan";
import { trackSummaryViewed } from "@/utils/analytics";

export default function QuickSummary() {
  const { items } = usePlanDraft() as any;
  const all = useMemo(() => {
    const vals = Object.values(items || {});
    return vals;
  }, [items]);

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
    volumeDiscount,
    production,
    creative,
    estimate,
  } = useMemo(() => {
    const names: string[] = [];
    let sites = 0;
    const allLocations: string[] = [];
    const periodSet = new Set<number>();
    let creatives = 0;
    let printRuns = 0;
    let mediaAfterDiscount = 0;
    let volumeDiscount = 0;
    let production = 0;
    let creative = 0;

    for (const it of all) {
      if ((it as any)?.formatName) names.push((it as any).formatName);
      sites += Number((it as any)?.quantity || 0);
      ((it as any)?.locations || []).forEach((l: string) => allLocations.push(l));
      ((it as any)?.selectedPeriods || []).forEach((p: number) => periodSet.add(p));
      creatives += Number((it as any)?.creativeAssets || 0);
      printRuns += countPrintRuns((it as any)?.selectedPeriods || []);
      mediaAfterDiscount += Number((it as any)?.mediaCost || 0);
      volumeDiscount += Number((it as any)?.discountAmount || 0);
      production += Number((it as any)?.productionCost || 0);
      creative += Number((it as any)?.creativeCost || 0);
    }

    // Show up to 2 names, then "+N more"
    const uniqueNames = Array.from(new Set(names));
    const display =
      uniqueNames.length <= 2
        ? uniqueNames.join(", ")
        : `${uniqueNames.slice(0, 2).join(", ")} +${uniqueNames.length - 2} more`;

    const mediaBeforeDiscount = mediaAfterDiscount + volumeDiscount;
    const estimate = mediaAfterDiscount + production + creative;

    return {
      formatNames: display,
      fullFormatList: uniqueNames.join(", "),
      formatCount: uniqueNames.length,
      sites,
      locationsCount: new Set(allLocations).size,
      uniquePeriods: Array.from(periodSet).sort((a, b) => a - b),
      creatives,
      printRuns,
      mediaAfterDiscount,
      mediaBeforeDiscount,
      volumeDiscount,
      production,
      creative,
      estimate,
    };
  }, [all]);

  // Derive mediaBefore from after + discount so we can show both
  const mediaBeforeDiscount = mediaAfterDiscount + volumeDiscount;

  // Track summary viewed when component mounts with data
  useEffect(() => {
    if (formatCount > 0 && estimate > 0) {
      trackSummaryViewed({
        plan_value: estimate,
        formats_count: formatCount,
        sites_selected: sites,
        periods_count: uniquePeriods.length,
        location: "London"
      });
    }
  }, [formatCount, estimate, sites, uniquePeriods.length]);

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

            <span className="text-muted-foreground">💰 Volume discount (10% for 3+ in-charge periods)</span>
            <span className="text-right font-medium text-green-600">- {formatCurrency(volumeDiscount)}</span>

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