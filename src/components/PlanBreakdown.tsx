import React from "react";
import FormatBreakdown from "./Pricing/FormatBreakdown";

// Same helpers as the card to guarantee identical math
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
const subtotalExVat = (i: any) => mediaAfter(i) + productionCost(i) + creativeCost(i);

type Props = {
  items: any[];
  showKpis?: boolean;
};

const PlanBreakdown: React.FC<Props> = ({ items, showKpis = true }) => {
  // Share-of-campaign uses media BEFORE discount so it's stable
  const totalMediaBefore = items.reduce((a, it) => a + mediaBefore(it), 0) || 1;

  const mediaBeforeTotal = items.reduce((a, it) => a + mediaBefore(it), 0);
  const volDiscTotal = items.reduce((a, it) => a + volumeDiscount(it), 0);
  const mediaAfterTotal = mediaBeforeTotal + volDiscTotal;
  const productionTotal = items.reduce((a, it) => a + productionCost(it), 0);
  const creativeTotal = items.reduce((a, it) => a + creativeCost(it), 0);
  const exVat = mediaAfterTotal + productionTotal + creativeTotal;
  const vat = exVat * 0.2;
  const inc = exVat + vat;

  return (
    <div>
      {items.map((it, idx) => (
        <FormatBreakdown
          key={idx}
          item={it}
          shareOfCampaign={mediaBefore(it) / totalMediaBefore}
        />
      ))}

      <div className="rounded-lg border mt-4 p-4 bg-slate-900/60 text-sm">
        <div>Campaign total (ex VAT): <strong>{gbp(exVat)}</strong></div>
        <div>VAT (20%): <strong>{gbp(vat)}</strong></div>
        <div>Campaign total (inc VAT): <strong>{gbp(inc)}</strong></div>
      </div>
    </div>
  );
};

export default PlanBreakdown;