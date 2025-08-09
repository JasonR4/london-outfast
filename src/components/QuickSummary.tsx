import React from "react";

// Use the exact same math as the pricing components
const gbp = (v: number) =>
  v.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
const periodsCount = (i: any) => i?.periods?.length ?? i?.selectedPeriods?.length ?? 0;
const sitesCount = (i: any) => i?.sites ?? i?.quantity ?? 0;
const saleRate = (i: any) => i?.saleRate ?? i?.saleRatePerInCharge ?? 0;
const productionRate = (i: any) => i?.productionRate ?? i?.productionCost ?? 0;
const creativeRate = (i: any) => i?.creativeRate ?? 0;
const creativeAssets = (i: any) => i?.creativeAssets ?? i?.creativeCount ?? 0;
const printRuns = (i: any) => i?.printRuns ?? 1;

const mediaBefore = (i: any) => saleRate(i) * sitesCount(i) * periodsCount(i);
const volumeDiscount = (i: any) => (periodsCount(i) >= 3 ? -0.1 * mediaBefore(i) : 0);
const mediaAfter = (i: any) => mediaBefore(i) + volumeDiscount(i);
const productionCost = (i: any) => productionRate(i) * sitesCount(i) * printRuns(i);
const creativeCost = (i: any) => creativeRate(i) * creativeAssets(i);

type Props = {
  items: any[];
};

const QuickSummary: React.FC<Props> = ({ items }) => {
  const mediaBeforeTotal = items.reduce((a, it) => a + mediaBefore(it), 0);
  const volDiscTotal = items.reduce((a, it) => a + volumeDiscount(it), 0);
  const mediaAfterTotal = mediaBeforeTotal + volDiscTotal;
  const productionTotal = items.reduce((a, it) => a + productionCost(it), 0);
  const creativeTotal = items.reduce((a, it) => a + creativeCost(it), 0);
  const estimate = mediaAfterTotal + productionTotal + creativeTotal;

  return (
    <div className="rounded-lg border p-3 bg-slate-900/70 text-xs">
      <div className="font-semibold mb-2">Quick Summary</div>
      {items.length === 0 ? (
        <div>No configured items yet. Select formats, set sites & periods.</div>
      ) : (
        <>
          <div className="mt-2">Media (before discount): <strong>{gbp(mediaBeforeTotal)}</strong></div>
          <div>Volume discount: <strong className="text-emerald-400">{gbp(volDiscTotal)}</strong></div>
          <div>Media (after discount): <strong>{gbp(mediaAfterTotal)}</strong></div>
          <div>Production: <strong>{gbp(productionTotal)}</strong></div>
          <div>Creative: <strong>{gbp(creativeTotal)}</strong></div>
          <div className="mt-2">Estimate total: <strong>{gbp(estimate)}</strong></div>
        </>
      )}
    </div>
  );
};

export default QuickSummary;