import React from "react";
import FormatBreakdown from "./Pricing/FormatBreakdown";

type Props = {
  items: any[];
  showKpis?: boolean;
};

const PlanBreakdown: React.FC<Props> = ({ items, showKpis = true }) => {
  const totalSites = items.reduce((sum, it) => sum + (it?.quantity ?? 0), 0);
  // Campaign periods = union of all selected periods across items
  const allPeriods: number[] = Array.from(
    new Set(
      items.flatMap((it) => (Array.isArray(it?.selectedPeriods) ? it.selectedPeriods : []))
    )
  );
  const campaignPeriods = allPeriods.length;
  // In-charges = campaign period count (NOT sites × periods)
  const totalInCharges = campaignPeriods;

  const exVat = items.reduce((sum, it) => sum + ((it?.mediaCost ?? 0) + (it?.productionCost ?? 0) + (it?.creativeCost ?? 0)), 0);
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
            <div className="text-lg font-semibold">{campaignPeriods}</div>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Total in-charges</div>
            <div className="text-lg font-semibold">{totalInCharges}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {items.map((it, idx) => {
          const totalMedia = (it?.mediaCost ?? 0) + (it?.productionCost ?? 0) + (it?.creativeCost ?? 0);
          const share = totalMedia > 0 ? totalMedia : 0;
          return (
            <FormatBreakdown key={idx} item={it} shareOfCampaign={share} />
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