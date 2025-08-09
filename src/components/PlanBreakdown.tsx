import React from "react";
import {
  usePlanStore,
  mediaCostBeforeDiscount,
  mediaCostAfterDiscount,
  volumeDiscount,
  productionCost,
  creativeCost,
  campaignTotals,
} from "@/state/planStore";

const currency = (v: number) =>
  v.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

const PlanBreakdown: React.FC = () => {
  const items = usePlanStore((s) => s.items);
  const totals = campaignTotals(items);
  const allMediaBefore = items.reduce((a, i) => a + mediaCostBeforeDiscount(i), 0);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-2">Your Current Plan</h3>
        <p>No items yet. Configure sites & periods to see pricing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-3">Your Current Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>
            <div className="text-slate-500">Formats selected</div>
            <div className="font-medium">{items.length}</div>
          </div>
          <div>
            <div className="text-slate-500">Sites</div>
            <div className="font-medium">
              {items.reduce((a, i) => a + (i.sites ?? 0), 0)}
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="text-slate-500">Campaign periods</div>
            <div className="font-medium">
              {Array.from(new Set(items.flatMap((i) => i.periods ?? [])))
                .sort()
                .join(", ")}
            </div>
          </div>
        </div>
      </div>

      {items.map((it) => {
        const pct =
          allMediaBefore > 0
            ? Math.round((mediaCostBeforeDiscount(it) / allMediaBefore) * 1000) /
              10
            : 0;

        const cap = (it.sites ?? 0) * (it.periods?.length ?? 0);

        return (
          <div key={it.id} className="rounded-xl overflow-hidden border">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <div className="font-semibold">{it.formatName}</div>
              <div className="text-sm opacity-80">≈ {pct}% of campaign</div>
            </div>

            <div className="bg-white p-4 text-sm space-y-2">
              <div className="text-slate-600">
                {it.sites} sites • {it.periods.length} periods • {cap} site-periods
              </div>
              <div className="text-slate-600">
                Locations: {it.locationsCount} / {cap}
                <span className="ml-1 text-emerald-600">
                  {cap - it.locationsCount >= 0
                    ? `OK: ${cap - it.locationsCount} left`
                    : `Over by ${it.locationsCount - cap}`}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div>Media (before discount): {currency(mediaCostBeforeDiscount(it))}</div>
                  <div>
                    💰 Volume discount (over 3 campaign periods):{" "}
                    {volumeDiscount(it) === 0
                      ? "—"
                      : `-${currency(-volumeDiscount(it))}`}
                  </div>
                  <div>Media (after discount): {currency(mediaCostAfterDiscount(it))}</div>
                </div>
                <div className="space-y-1">
                  <div>Production: {currency(productionCost(it))}</div>
                  <div>Creative: {currency(creativeCost(it))}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="rounded-xl border p-4 bg-white">
        <div className="text-sm text-slate-500">Campaign total (ex VAT)</div>
        <div className="text-2xl font-semibold">{currency(totals.exVat)}</div>
      </div>
    </div>
  );
};

export default PlanBreakdown;