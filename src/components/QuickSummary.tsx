import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/utils/periods";
import { usePlanDraft } from "@/state/plan";

export default function QuickSummary() {
  const { items } = usePlanDraft() as any;
  const all = useMemo(() => Object.values(items || {}), [items]);

  const {
    formatNames,
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
            {formatNames && <div className="text-xs text-muted-foreground truncate">{formatNames}</div>}
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
              - {formatCurrency(volumeDiscount)}
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