import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { usePlanStore } from "@/state/planStore";

// Optional: pass draft props from SmartQuoteForm if you want a draft preview
type Props = {
  draftSelectedFormats?: any[];
  draftFormatQuantities?: Record<string, number>;
  draftSelectedPeriods?: string[];
};

const currency = (v: number) =>
  v.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

export default function QuickSummary(props: Props) {
  const items = usePlanStore((s) => s.items);

  const hasConfigured = items.length > 0;

  const draftInfo = useMemo(() => {
    const f = props.draftSelectedFormats ?? [];
    const q = props.draftFormatQuantities ?? {};
    const p = props.draftSelectedPeriods ?? [];
    const sites = f.reduce((sum, fmt) => {
      const formatKey = fmt.format_slug || fmt.id;
      return sum + (q[formatKey] ?? 0);
    }, 0);
    return {
      formatsCount: f.length,
      formatsList:
        f.length > 0
          ? f
              .slice(0, 2)
              .map((x) => x.format_name ?? x.name ?? x.title ?? x.format_slug ?? x.id)
              .join(", ") + (f.length > 2 ? ` +${f.length - 2} more` : "")
          : "—",
      sites,
      periods: p,
    };
  }, [props.draftSelectedFormats, props.draftFormatQuantities, props.draftSelectedPeriods]);

  if (!hasConfigured) {
    // Empty state + draft glance
    return (
      <TooltipProvider>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="text-muted-foreground">
              No configured items yet. Configure a format to see pricing here.
            </div>
            {draftInfo.formatsCount > 0 && (
              <div className="mt-2 space-y-1">
                <div className="text-muted-foreground">Draft selections:</div>
                <div className="grid grid-cols-2 gap-y-1">
                  <span className="text-muted-foreground">Formats:</span>
                  <span className="text-right">{draftInfo.formatsCount}</span>
                  
                  <span className="text-muted-foreground">Sites:</span>
                  <span className="text-right">{draftInfo.sites}</span>
                  
                  <span className="text-muted-foreground">Periods:</span>
                  <span className="text-right">
                    {draftInfo.periods?.length ? draftInfo.periods.join(", ") : "—"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {draftInfo.formatsList}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  // Configured summary
  const formats = items.length;
  const sites = items.reduce((a, i) => a + (i.sites ?? 0), 0);
  const periods = Array.from(
    new Set(items.flatMap((i) => i.periods ?? []))
  );
  const creatives = items.reduce((a, i) => a + (i.creativeAssets ?? 0), 0);

  // Media math
  const mediaBefore = items.reduce(
    (a, i) => a + (i.saleRate ?? 0) * (i.sites ?? 0) * (i.periods?.length ?? 0),
    0
  );
  const volDisc = items.reduce((a, i) => {
    const qualifies = (i.periods?.length ?? 0) >= 3;
    const gross = (i.saleRate ?? 0) * (i.sites ?? 0) * (i.periods?.length ?? 0);
    return a + (qualifies ? -0.1 * gross : 0);
  }, 0);
  const mediaAfter = mediaBefore + volDisc;
  const production = items.reduce(
    (a, i) => a + (i.productionRate ?? 0) * (i.sites ?? 0) * (i.printRuns ?? 1),
    0
  );
  const creative = items.reduce(
    (a, i) => a + (i.creativeRate ?? 0) * (i.creativeAssets ?? 0),
    0
  );
  const exVat = mediaAfter + production + creative;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="space-y-1">
            <div className="text-muted-foreground">Formats:</div>
            <div className="font-medium">{formats} {formats === 1 ? "format" : "formats"}</div>
          </div>

          <div className="grid grid-cols-2 gap-y-1">
            <span className="text-muted-foreground">Sites:</span>
            <span className="text-right font-medium">{sites}</span>

            <span className="text-muted-foreground">Campaign periods:</span>
            <span className="text-right font-medium truncate">
              {periods.length ? periods.join(", ") : "—"}
            </span>

            <span className="text-muted-foreground">Creatives:</span>
            <span className="text-right font-medium">{creatives}</span>
          </div>

          <hr className="my-2" />

          <div className="grid grid-cols-2 gap-y-1">
            <span className="text-muted-foreground">Media (before discount):</span>
            <span className="text-right font-medium">{currency(mediaBefore)}</span>

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
              {currency(volDisc)}
            </span>

            <span className="text-muted-foreground">Media (after discount):</span>
            <span className="text-right font-medium">{currency(mediaAfter)}</span>

            <span className="text-muted-foreground">Production:</span>
            <span className="text-right font-medium">{currency(production)}</span>

            <span className="text-muted-foreground">Creative:</span>
            <span className="text-right font-medium">{currency(creative)}</span>
          </div>

          <hr className="my-2" />

          <div className="flex justify-between text-sm font-semibold">
            <span>Estimate total:</span>
            <span>{currency(exVat)}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}