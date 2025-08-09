import { create } from "zustand";

export type PlanItem = {
  id: string;                     // stable key per format (e.g., "16-sheet-lu")
  formatName: string;             // display name
  saleRate: number;               // £ per site-per-period
  productionRate: number;         // £ per site per print run
  creativeRate: number;           // £ per creative asset
  sites: number;                  // total sites across the campaign (not per period)
  periods: string[];              // period ids (e.g., ["16","19","20"])
  locationsCount: number;         // how many areas/locations selected for this format
  printRuns: number;              // calculated from non-consecutive groups of periods
  creativeAssets: number;         // count of creative assets
};

type PlanState = {
  items: PlanItem[];
  replace: (items: PlanItem[]) => void;
  clear: () => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  items: [],
  replace: (items) => set({ items }),
  clear: () => set({ items: [] }),
}));

// ---------- helpers (pure) ----------
export const mediaInChargesForCost = (i: PlanItem) =>
  i.sites * (i.periods?.length ?? 0);

export const mediaCostBeforeDiscount = (i: PlanItem) =>
  i.saleRate * mediaInChargesForCost(i);

export const volumeDiscount = (i: PlanItem) =>
  (i.periods?.length ?? 0) >= 3 ? -0.1 * mediaCostBeforeDiscount(i) : 0;

export const mediaCostAfterDiscount = (i: PlanItem) =>
  mediaCostBeforeDiscount(i) + volumeDiscount(i);

export const productionCost = (i: PlanItem) =>
  (i.productionRate ?? 0) * (i.sites ?? 0) * (i.printRuns ?? 1);

export const creativeCost = (i: PlanItem) =>
  (i.creativeRate ?? 0) * (i.creativeAssets ?? 0);

export const formatSubtotalExVat = (i: PlanItem) =>
  mediaCostAfterDiscount(i) + productionCost(i) + creativeCost(i);

export const campaignTotals = (items: PlanItem[]) => {
  const mediaBefore = items.reduce((a, it) => a + mediaCostBeforeDiscount(it), 0);
  const volDisc = items.reduce((a, it) => a + volumeDiscount(it), 0);
  const mediaAfter = mediaBefore + volDisc;
  const prod = items.reduce((a, it) => a + productionCost(it), 0);
  const creative = items.reduce((a, it) => a + creativeCost(it), 0);
  const exVat = mediaAfter + prod + creative;
  return { mediaBefore, volDisc, mediaAfter, prod, creative, exVat };
};