import React from "react";
import type { FC } from "react";
import FormatBreakdown from "./Pricing/FormatBreakdown";
import type { PlanItem } from "@/state/planStore";
import {
  displayInCharges,
  mediaCostBeforeDiscount,
  mediaCostAfterDiscount,
  volumeDiscount,
  productionCost,
  creativeCost,
  uniqueCampaignPeriods,
  campaignTotals
} from "@/state/planStore";

type Props = { 
  items: (PlanItem | any)[];
  showKpis?: boolean;
};

const currency = (v:number) =>
  v.toLocaleString("en-GB",{ style:"currency", currency:"GBP" });

const pct = (num:number, den:number) => den > 0 ? ((num/den)*100) : 0;

const PlanBreakdown: FC<Props> = ({ items, showKpis = true }) => {
  const campaignPeriods = uniqueCampaignPeriods(items);
  const totalSites = items.reduce((sum, it) => sum + (it?.sites ?? it?.quantity ?? 0), 0);
  const totalInCharges = campaignPeriods.length;

  const totals = campaignTotals(items);
  const exVat = totals.exVat;
  const vat = exVat * 0.20;
  const incVat = exVat + vat;

  return (
    <div className="space-y-6">
      {showKpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Formats selected</div>
            <div className="text-lg font-semibold">{items.length}</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Sites (total)</div>
            <div className="text-lg font-semibold">{totalSites}</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Campaign periods</div>
            <div className="text-lg font-semibold">{campaignPeriods.length}</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Total in-charges</div>
            <div className="text-lg font-semibold">{totalInCharges}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {items.map((it, idx) => {
          const mediaBefore = mediaCostBeforeDiscount(it);
          const totalMediaBefore = items.reduce((a,i)=>a+mediaCostBeforeDiscount(i),0);
          const share = pct(mediaBefore, totalMediaBefore) / 100;
          return (
            <FormatBreakdown key={it.id || idx} item={it} shareOfCampaign={share} />
          );
        })}
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm">Campaign total (ex VAT): <strong>{exVat.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}</strong></div>
        <div className="text-sm">VAT (20%): <strong>{vat.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}</strong></div>
        <div className="text-sm">Campaign total (inc VAT): <strong>{incVat.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}</strong></div>
      </div>
    </div>
  );
};

export default PlanBreakdown;