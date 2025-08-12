import React from "react";
import { computeMedia, formatGBP, countPrintRuns } from "@/lib/pricingMath";

type Props = {
  item: any;
  shareOfPlan?: number; // 0..1 of ex-VAT subtotal
  mediaShareBefore?: number; // media before discount as % of ex-VAT subtotal
};


const FormatBreakdown: React.FC<Props> = ({ item, shareOfPlan, mediaShareBefore }) => {
  const sites = Number(item?.sites ?? item?.quantity ?? 0);
  const periodsArr = (item?.periods ?? item?.selectedPeriods ?? []) as Array<number | string>;
  const rate = Number(item?.saleRate ?? item?.saleRatePerInCharge ?? 0);

  const media = computeMedia({ saleRate: rate, sites, periods: periodsArr });
  const runs = countPrintRuns(periodsArr);
  const inChargesCount = media.periodCount; // display only (not sites×periods)

const mainPct =
  typeof shareOfPlan === "number"
    ? `${(shareOfPlan * 100).toFixed(0)}% of plan`
    : undefined;
const secondaryPct =
  typeof mediaShareBefore === "number"
    ? `Media share (before discount): ${(mediaShareBefore * 100).toFixed(0)}%`
    : undefined;

  // Production & creative (outside media discount)
  const productionRateUnit = Number(item?.productionRatePerUnit ?? item?.productionRate ?? 0);
  const creativeRateUnit = Number(item?.creativeUnit ?? item?.creativeRate ?? 0);
  const productionTotalFromItem = Number(item?.productionCost ?? 0);
  const creativeTotalFromItem = Number(item?.creativeCost ?? 0);
  const creativeAssets = Number(item?.creativeAssets ?? item?.creativeCount ?? 0);

  const production = productionRateUnit > 0
    ? productionRateUnit * sites * (runs || 1)
    : productionTotalFromItem;

  const creative = creativeRateUnit > 0
    ? creativeRateUnit * creativeAssets
    : creativeTotalFromItem;
  const subtotalExVat = media.after + production + creative;

  return (
    <div className="rounded-lg border p-4 bg-slate-800/60">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold">{item?.formatName ?? item?.name ?? "Format"}</div>
        <div className="text-right">
          {mainPct && <div className="text-xs font-semibold">{mainPct}</div>}
          {secondaryPct && (
            <div className="text-[10px] text-muted-foreground">{secondaryPct}</div>
          )}
        </div>
      </div>
      <div className="text-xs opacity-70 mb-2">
        {sites} sites • {inChargesCount} in-charges
      </div>

      <div className="space-y-1 text-sm">
        {(() => {
          const pennies = (n: number) => Math.round((n ?? 0) * 100);
          const hasDiscount =
            pennies(media.before) !== pennies(media.after) &&
            pennies(media.after) > 0;

          return (
            <>
              <div>Media rate (per in-charge): {formatGBP(media.rate)}</div>

              {hasDiscount ? (
                <>
                  <div>Media (before discount): {formatGBP(media.before)}</div>
                  <div className="text-emerald-400">
                    💰 Volume discount (10% for 3+ in-charge periods): -{formatGBP(media.discount)}
                  </div>
                  <div className="font-semibold">Media (after discount): {formatGBP(media.after)}</div>
                </>
              ) : (
                <div>Media: {formatGBP(media.before)}</div>
              )}

              {production > 0 && <div>Production: {formatGBP(production)}</div>}
              {creative > 0 && <div>Creative: {formatGBP(creative)}</div>}
              <div className="mt-2 font-semibold">Subtotal (ex VAT): {formatGBP(subtotalExVat)}</div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default FormatBreakdown;
