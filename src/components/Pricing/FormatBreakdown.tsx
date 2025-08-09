import React from "react";

// Shared helpers – keep the math identical everywhere
const gbp = (v: number) =>
  v.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

const periodsCount = (item: any) =>
  item?.periods?.length ?? item?.selectedPeriods?.length ?? 0;

const sitesCount = (item: any) => item?.sites ?? item?.quantity ?? 0;

const saleRate = (item: any) => item?.saleRate ?? item?.saleRatePerInCharge ?? 0;
const productionRate = (item: any) =>
  item?.productionRate ?? item?.productionCost ?? 0;
const creativeRate = (item: any) => item?.creativeRate ?? 0;
const creativeAssets = (item: any) =>
  item?.creativeAssets ?? item?.creativeCount ?? 0;
const printRuns = (item: any) => item?.printRuns ?? 1;

const mediaBefore = (item: any) =>
  saleRate(item) * sitesCount(item) * periodsCount(item);

const volumeDiscount = (item: any) =>
  periodsCount(item) >= 3 ? -0.1 * mediaBefore(item) : 0;

const mediaAfter = (item: any) => mediaBefore(item) + volumeDiscount(item);

const productionCost = (item: any) =>
  productionRate(item) * sitesCount(item) * printRuns(item);

const creativeCost = (item: any) => creativeRate(item) * creativeAssets(item);

const subtotalExVat = (item: any) =>
  mediaAfter(item) + productionCost(item) + creativeCost(item);

type Props = {
  item: any;
  shareOfCampaign?: number; // 0..1
};

const FormatBreakdown: React.FC<Props> = ({ item, shareOfCampaign }) => {
  const sites = sitesCount(item);
  const periods = periodsCount(item);
  const inChargesCount = periods; // display only (not sites×periods)

  const pctText =
    typeof shareOfCampaign === "number"
      ? `≈ ${(shareOfCampaign * 100).toFixed(1)}% of campaign`
      : undefined;

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
        <div>Sale rate (per in-charge): {gbp(saleRate(item))}</div>
        <div>Media (before discount): {gbp(mediaBefore(item))}</div>
        {volumeDiscount(item) !== 0 && (
          <div className="text-emerald-400">
            💰 Volume discount (over 3 campaign periods): {gbp(volumeDiscount(item))}
          </div>
        )}
        <div>Media (after discount): {gbp(mediaAfter(item))}</div>
        <div>Production: {gbp(productionCost(item))}</div>
        <div>Creative: {gbp(creativeCost(item))}</div>
        <div className="mt-2 font-semibold">Subtotal (ex VAT): {gbp(subtotalExVat(item))}</div>
      </div>
    </div>
  );
};

export default FormatBreakdown;
