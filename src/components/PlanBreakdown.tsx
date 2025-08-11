import React from "react";
import FormatBreakdown from "./Pricing/FormatBreakdown";
import { computeMedia, formatGBP } from "@/lib/pricingMath";

type Props = {
  items: any[];
  showKpis?: boolean;
};


const PlanBreakdown: React.FC<Props> = ({ items, showKpis = true }) => {
  // Percent-of-plan uses ex-VAT subtotal; secondary shows media-before share for transparency
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
    const unit = Number(it?.productionRatePerUnit ?? it?.productionRate ?? 0);
    const totalProvided = Number(it?.productionCost ?? 0);
    const sites = Number(it?.sites ?? it?.quantity ?? 0);
    const runs = getMedia(it).printRuns || 1;
    return a + (unit > 0 ? unit * sites * runs : totalProvided);
  }, 0);
  const creativeTotal = items.reduce((a, it) => {
    const unit = Number(it?.creativeUnit ?? it?.creativeRate ?? 0);
    const assets = Number(it?.creativeAssets ?? it?.creativeCount ?? 0);
    const totalProvided = Number(it?.creativeCost ?? 0);
    return a + (unit > 0 ? unit * assets : totalProvided);
  }, 0);
  const exVat = mediaAfterTotal + productionTotal + creativeTotal;
  const vat = exVat * 0.2;
  const inc = exVat + vat;

  return (
    <div>
      {items.map((it, idx) => {
        const media = getMedia(it);
        const sitesLocal = Number(it?.sites ?? it?.quantity ?? 0);
        const prodUnit = Number(it?.productionRatePerUnit ?? it?.productionRate ?? 0);
        const prodProvided = Number(it?.productionCost ?? 0);
        const creativeUnit = Number(it?.creativeUnit ?? it?.creativeRate ?? 0);
        const creativeCount = Number(it?.creativeAssets ?? it?.creativeCount ?? 0);
        const runs = media.printRuns || 1;
        const production = prodUnit > 0 ? prodUnit * sitesLocal * runs : prodProvided;
        const creative = creativeUnit > 0 ? creativeUnit * creativeCount : Number(it?.creativeCost ?? 0);
        const subtotalExVatItem = media.after + production + creative;
        const safeTotal = exVat || 1;
        const shareOfPlan = subtotalExVatItem / safeTotal;
        const mediaShareBefore = media.before / safeTotal;
        return (
          <FormatBreakdown
            key={idx}
            item={it}
            shareOfPlan={shareOfPlan}
            mediaShareBefore={mediaShareBefore}
          />
        );
      })}

      <div className="rounded-lg border mt-4 p-4 bg-slate-900/60 text-sm">
        <div>Campaign total (ex VAT): <strong>{formatGBP(exVat)}</strong></div>
        <div>VAT (20%): <strong>{formatGBP(vat)}</strong></div>
        <div>Campaign total (inc VAT): <strong>{formatGBP(inc)}</strong></div>
      </div>
    </div>
  );
};

export default PlanBreakdown;