import React, { useMemo } from "react";
import { usePlanStore, campaignTotals } from "@/state/planStore";

const currency = (v: number) =>
  v.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

const QuickSummary: React.FC = () => {
  const items = usePlanStore((s) => s.items);

  const data = useMemo(() => {
    const formatsCount = items.length;
    const sites = items.reduce((a, i) => a + (i.sites ?? 0), 0);
    const allPeriods = Array.from(
      new Set(items.flatMap((i) => i.periods ?? []))
    ).sort();
    const creatives = items.reduce((a, i) => a + (i.creativeAssets ?? 0), 0);
    const printRuns = items.reduce((a, i) => a + (i.printRuns ?? 0), 0);
    const totals = campaignTotals(items);
    return { formatsCount, sites, allPeriods, creatives, printRuns, totals };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-2">Quick Summary</h3>
        <p>No configured items yet. Select a format, set sites & periods.</p>
      </div>
    );
  }

  const firstTwo = items.slice(0, 2).map((i) => i.formatName).join(", ");
  const more = items.length > 2 ? ` +${items.length - 2} more` : "";

  return (
    <div className="rounded-xl border p-4 bg-white">
      <h3 className="font-semibold mb-3">Quick Summary</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-slate-500">Formats</div>
          <div className="font-medium">
            {items.length}{" "}
            <span className="text-slate-500 block">
              {firstTwo}
              {more}
            </span>
          </div>
        </div>

        <div>
          <div className="text-slate-500">Sites</div>
          <div className="font-medium">{data.sites}</div>
        </div>

        <div className="md:col-span-2">
          <div className="text-slate-500">Campaign periods</div>
          <div className="font-medium">{data.allPeriods.join(", ") || "—"}</div>
        </div>

        <div>
          <div className="text-slate-500">Creatives</div>
          <div className="font-medium">{data.creatives}</div>
        </div>
        <div>
          <div className="text-slate-500">Print runs</div>
          <div className="font-medium">{data.printRuns}</div>
        </div>
      </div>

      <hr className="my-3" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div>
          <div className="text-slate-500">Media (before discount)</div>
          <div className="font-medium">{currency(data.totals.mediaBefore)}</div>
        </div>
        <div>
          <div className="text-slate-500">Volume discount</div>
          <div className="font-medium">
            {data.totals.volDisc === 0 ? "—" : `- ${currency(-data.totals.volDisc)}`}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Media (after discount)</div>
          <div className="font-medium">{currency(data.totals.mediaAfter)}</div>
        </div>
        <div>
          <div className="text-slate-500">Production</div>
          <div className="font-medium">{currency(data.totals.prod)}</div>
        </div>
        <div>
          <div className="text-slate-500">Creative</div>
          <div className="font-medium">{currency(data.totals.creative)}</div>
        </div>
      </div>

      <div className="mt-3 text-sm">
        <div className="text-slate-500">Estimate total</div>
        <div className="font-semibold text-lg">{currency(data.totals.exVat)}</div>
      </div>
    </div>
  );
};

export default QuickSummary;