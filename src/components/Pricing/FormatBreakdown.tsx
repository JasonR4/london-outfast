import React from "react";
import { computeMedia, formatGBP, countPrintRuns } from "@/lib/pricingMath";

type Props = {
  item: any;
  shareOfCampaign?: number; // 0..1
};


const FormatBreakdown: React.FC<Props> = ({ item, shareOfCampaign }) => {
  const sites = Number(item?.sites ?? item?.quantity ?? 0);
  const periodsArr = (item?.periods ?? item?.selectedPeriods ?? []) as Array<number | string>;
  const rate = Number(item?.saleRate ?? item?.saleRatePerInCharge ?? 0);

  const media = computeMedia({ saleRate: rate, sites, periods: periodsArr });
  const runs = countPrintRuns(periodsArr);
  const inChargesCount = media.periodCount; // display only (not sites×periods)

  const pctText =
    typeof shareOfCampaign === "number"
      ? `≈ ${(shareOfCampaign * 100).toFixed(1)}% of campaign`
      : undefined;

  // Production & creative (outside media discount)
  const productionUnit = Number(item?.productionRate ?? item?.productionCost ?? 0);
  const creativeUnit = Number(item?.creativeRate ?? 0);
  const creativeAssets = Number(item?.creativeAssets ?? item?.creativeCount ?? 0);
  const production = productionUnit * sites * (runs || 1);
  const creative = creativeUnit * creativeAssets;
  const subtotalExVat = media.after + production + creative;

  return (
    <div className="rounded-lg border p-4 bg-slate-800/60">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold">{item?.formatName ?? item?.name ?? "Format"}</div>
        {pctText && <div className="text-xs opacity-70">{pctText}</div>}
      </div>
      <div className="text-xs opacity-70 mb-2">
        {sites} sites • {inChargesCount} in-charges
      </div>

      <div className="space-y-1 text-sm">
        <div>Media rate (per in-charge): {formatGBP(media.rate)}</div>
        <div>Media (before discount): {formatGBP(media.before)}</div>
        {media.showDiscount && (
          <div className="text-emerald-400">
            💰 Volume discount (10% for 3+ in-charge periods): -{formatGBP(media.discount)}
          </div>
        )}
        <div>Media (after discount): {formatGBP(media.after)}</div>
        <div>Production: {formatGBP(production)}</div>
        <div>Creative: {formatGBP(creative)}</div>
        <div className="mt-2 font-semibold">Subtotal (ex VAT): {formatGBP(subtotalExVat)}</div>
      </div>
    </div>
  );
};

export default FormatBreakdown;
