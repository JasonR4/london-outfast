import React from "react";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/utils/periods";

export type PlanItemInput = {
  formatName: string;
  sites: number;
  selectedPeriods: number[] | string[];
  saleRate: number;           // per in-charge
  productionCost: number;
  creativeCost: number;
};

type Enriched = PlanItemInput & {
  incharges: number;
  mediaCost: number;
  qualifiesVolume: boolean;
  volumeDiscount: number;
  mediaAfterDiscount: number;
  subtotal: number;
  uniquePeriods: number;
};

function enrich(item: PlanItemInput): Enriched {
  const uniq = Array.from(new Set(item.selectedPeriods.map(String)));
  const incharges = item.sites * uniq.length;
  const mediaCost = item.saleRate * incharges;
  const qualifiesVolume = uniq.length >= 3;
  const volumeDiscount = qualifiesVolume ? mediaCost * 0.10 : 0;
  const mediaAfterDiscount = mediaCost - volumeDiscount;
  const subtotal = mediaAfterDiscount + item.productionCost + item.creativeCost;
  return {
    ...item,
    incharges,
    mediaCost,
    qualifiesVolume,
    volumeDiscount,
    mediaAfterDiscount,
    subtotal,
    uniquePeriods: uniq.length,
  };
}

function groupByFormat(items: Enriched[]) {
  const grand = items.reduce((a, b) => a + b.subtotal, 0) || 0;
  const map = new Map<string, any>();
  for (const it of items) {
    const key = it.formatName;
    if (!map.has(key)) {
      map.set(key, {
        formatName: key,
        sites: 0,
        uniquePeriodsSet: new Set<string>(),
        incharges: 0,
        saleRate: it.saleRate,
        mediaCost: 0,
        volumeDiscount: 0,
        mediaAfterDiscount: 0,
        productionCost: 0,
        creativeCost: 0,
        subtotal: 0,
      });
    }
    const g = map.get(key);
    g.sites += it.sites;
    it.selectedPeriods.map(String).forEach((p: string) => g.uniquePeriodsSet.add(p));
    g.incharges += it.incharges;
    g.mediaCost += it.mediaCost;
    g.volumeDiscount += it.volumeDiscount;
    g.mediaAfterDiscount += it.mediaAfterDiscount;
    g.productionCost += it.productionCost;
    g.creativeCost += it.creativeCost;
    g.subtotal += it.subtotal;
  }
  return Array.from(map.values())
    .map((g) => ({
      ...g,
      uniquePeriods: g.uniquePeriodsSet.size,
      share: grand ? (g.subtotal / grand) * 100 : 0,
    }))
    .sort((a, b) => b.subtotal - a.subtotal);
}

export default function PlanBreakdown({
  items,
  showKpis = true,
}: {
  items: PlanItemInput[];
  showKpis?: boolean;
}) {
  const enriched = items.map(enrich);
  const groups = groupByFormat(enriched);

  const totalSites = enriched.reduce((s, i) => s + i.sites, 0);
  const totalUniquePeriods = new Set(enriched.flatMap(i => i.selectedPeriods.map(String))).size;
  const totalIncharges = enriched.reduce((s, i) => s + i.incharges, 0);
  const subtotal = enriched.reduce((s, i) => s + i.subtotal, 0);
  const vat = subtotal * 0.20;
  const total = subtotal + vat;

  if (!enriched.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No items in your current plan yet.</p>
        <p className="text-sm">Add formats above to see your breakdown here.</p>
      </div>
    );
  }

  return (
    <div>
      {showKpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Formats selected</div>
            <div className="font-bold text-lg">{new Set(enriched.map(i=>i.formatName)).size}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Sites</div>
            <div className="font-bold text-lg">{totalSites}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Campaign periods</div>
            <div className="font-bold text-lg">{totalUniquePeriods}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total in-charges</div>
            <div className="font-bold text-lg">{totalIncharges}</div>
          </div>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4">Format Breakdown</h3>
      {groups.map((g:any) => (
        <div key={g.formatName} className="format-breakdown">
          <div className="format-breakdown-header">
            <div>
              <strong>{g.formatName}</strong>
              <div className="text-sm text-muted-foreground">
                {g.sites} sites • {g.uniquePeriods} periods • {g.incharges} in-charges
              </div>
            </div>
            <div className="text-right">
              <div>Sale rate (per in-charge): {formatCurrency(g.saleRate)}</div>
              <div className="text-xs text-muted-foreground">≈ {g.share.toFixed(0)}% of campaign</div>
            </div>
          </div>

          <div className="format-breakdown-body">
            <div>Media cost at sale rate: {formatCurrency(g.mediaCost)}</div>
            {g.volumeDiscount > 0 && (
              <>
                <div>💰 Volume discount (10% for 3+ in-charge periods): −{formatCurrency(g.volumeDiscount)}</div>
                <div className="text-xs text-muted-foreground">
                  That's −{formatCurrency(g.volumeDiscount / g.incharges)} per unit per period ({g.incharges} in-charges).
                </div>
              </>
            )}
            <div>Media cost after discount: {formatCurrency(g.mediaAfterDiscount)}</div>
            <div>Production cost: {formatCurrency(g.productionCost)}</div>
            <div>Creative cost: {formatCurrency(g.creativeCost)}</div>
            <hr className="my-3 border-border" />
            <div className="font-semibold">Format subtotal (exc VAT): {formatCurrency(g.subtotal)}</div>
          </div>
        </div>
      ))}

      <div className="grand-total">
        <div className="font-bold text-lg">Campaign total (ex VAT): {formatCurrency(subtotal)}</div>
        <div className="text-sm text-muted-foreground">VAT (20%): {formatCurrency(vat)}</div>
        <div className="font-bold text-xl mt-1">Campaign total (inc VAT): {formatCurrency(total)}</div>
      </div>
    </div>
  );
}