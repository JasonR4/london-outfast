import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlanDraft } from "@/state/plan";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/utils/periods";
import { Info } from "lucide-react";
import React from "react";

function s(n: number, one: string, many?: string) {
  return n === 1 ? one : (many ?? `${one}s`);
}

export default function QuickSummary() {
  const plan = usePlanDraft() as any;
  const items = plan?.items ? Object.values(plan.items) : [];

  const totalFormats = items.length;
  const totalSites = items.reduce((a: number, it: any) => a + (it.quantity ?? 0), 0);
  const totalLocations = items.reduce((a: number, it: any) => a + (it.locations?.length ?? 0), 0);
  const allPeriods = items.flatMap((it: any) => it.selectedPeriods ?? []);
  const uniquePeriods = Array.from(new Set(allPeriods)).sort((a, b) => a - b);
  const totalCreatives = items.reduce((a: number, it: any) => a + (it.creativeAssets ?? 0), 0);
  const totalPrintRuns = countPrintRuns(uniquePeriods);
  const volumeApplied = items.some((it: any) => it.qualifiesVolume);
  const volumeSaved = items.reduce((a: number, it: any) => a + (it.discountAmount ?? 0), 0);
  const media = items.reduce((a: number, it: any) => a + (it.mediaCost ?? 0), 0);
  const production = items.reduce((a: number, it: any) => a + (it.productionCost ?? 0), 0);
  const creative = items.reduce((a: number, it: any) => a + (it.creativeCost ?? 0), 0);
  const grandTotal = items.reduce((a: number, it: any) => a + (it.totalCost ?? 0), 0);

  const formatNames = items.map((it: any) => it.formatName).filter(Boolean);
  const formatList =
    formatNames.length <= 2 ? formatNames.join(", ") :
    `${formatNames.slice(0, 2).join(", ")} +${formatNames.length - 2} more`;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Formats:</span>
            <div className="flex items-center">
              <span className="font-medium">{totalFormats} {s(totalFormats, "format")}</span>
              {formatList && <Badge variant="secondary" className="ml-1 text-xs">{formatList}</Badge>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Sites:</span>
            <span className="font-medium">{totalSites.toString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Locations selected:</span>
            <span className="font-medium">{totalLocations.toString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Campaign periods:</span>
            <span className="font-medium">{uniquePeriods.length > 0 ? uniquePeriods.join(", ") : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Creatives:</span>
            <span className="font-medium">{totalCreatives.toString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              Print runs
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Non-consecutive periods require extra print runs. Affects production only.
                </TooltipContent>
              </Tooltip>
              :
            </span>
            <span className="font-medium">{totalPrintRuns}</span>
          </div>

          <hr className="my-2" />

          <div className="flex items-center justify-between">
            <span>Media subtotal:</span>
            <span className="font-medium">{formatCurrency(media as number)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Production:</span>
            <span className="font-medium">{formatCurrency(production as number)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Creative:</span>
            <span className="font-medium">{formatCurrency(creative as number)}</span>
          </div>
          {volumeApplied && (
            <div className="flex items-center justify-between text-green-600">
              <span className="inline-flex items-center gap-1">
                Volume discount
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Applied when booking over 3 campaign periods (per format).
                  </TooltipContent>
                </Tooltip>
                :
              </span>
              <span className="font-medium">- {formatCurrency(volumeSaved as number)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-medium">Estimate total:</span>
            <span className="font-semibold">{formatCurrency(grandTotal as number)}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}