import React from "react";
import FormatBreakdown from "./Pricing/FormatBreakdown";
import { computeMedia, formatGBP } from "@/lib/pricingMath";

type Props = {
  items: any[];
  showKpis?: boolean;
};


const PlanBreakdown: React.FC<Props> = ({ items, showKpis = true }) => {
  // Share-of-campaign uses media BEFORE discount so it's stable
  const getMedia = (it: any) => {
    const rate = Number(it?.saleRate ?? it?.saleRatePerInCharge ?? 0);
    const sites = Number(it?.sites ?? it?.quantity ?? 0);
    const periods = (it?.periods ?? it?.selectedPeriods ?? []) as Array<number | string>;
    return computeMedia({ saleRate: rate, sites, periods });
  };
  const mediaBeforeTotal = items.reduce((a, it) => a + getMedia(it).before, 0);
  const totalMediaBefore = mediaBeforeTotal || 1;
  const mediaAfterTotal = items.reduce((a, it) => a + getMedia(it).after, 0);
  const volDiscTotal = mediaAfterTotal - mediaBeforeTotal; // negative when discount applied
  const productionTotal = items.reduce((a, it) => {
    const prodRate = Number(it?.productionRate ?? it?.productionCost ?? 0);
    const sites = Number(it?.sites ?? it?.quantity ?? 0);
    const runs = getMedia(it).printRuns || 1;
    return a + prodRate * sites * runs;
  }, 0);
  const creativeTotal = items.reduce((a, it) => {
    const crRate = Number(it?.creativeRate ?? 0);
    const assets = Number(it?.creativeAssets ?? it?.creativeCount ?? 0);
    return a + crRate * assets;
  }, 0);
  const exVat = mediaAfterTotal + productionTotal + creativeTotal;
  const vat = exVat * 0.2;
  const inc = exVat + vat;

  return (
    <div>
      {items.map((it, idx) => (
        <FormatBreakdown
          key={idx}
          item={it}
          shareOfCampaign={getMedia(it).before / totalMediaBefore}
        />
      ))}

      <div className="rounded-lg border mt-4 p-4 bg-slate-900/60 text-sm">
        <div>Campaign total (ex VAT): <strong>{formatGBP(exVat)}</strong></div>
        <div>VAT (20%): <strong>{formatGBP(vat)}</strong></div>
        <div>Campaign total (inc VAT): <strong>{formatGBP(inc)}</strong></div>
      </div>
    </div>
  );
};

export default PlanBreakdown;