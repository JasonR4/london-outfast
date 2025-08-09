import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type PlanItem = {
  id: string
  formatSlug: string
  name: string
  sites: number
  periods: string[]        // campaign period IDs
  saleRate: number         // per in-charge
  productionRate: number   // per site per print run
  printRuns: number
  creativeAssets: number
  creativeRate: number
  locations?: string[]     // area IDs/names
}

type PlanState = {
  items: PlanItem[]
  setItems: (items: PlanItem[]) => void
  clear: () => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'mbl-plan-v2',
      storage: createJSONStorage(() => sessionStorage),
      version: 2,
      // Do NOT mutate state during hydration callbacks.
      // No onRehydrateStorage, no migrate that sets() in render.
      partialize: (s) => ({ items: s.items }),
    }
  )
)

// ---------- Derived helpers (pure functions, no store access) ----------
export const uniqueCampaignPeriods = (items: PlanItem[]): string[] => {
  const s = new Set<string>();
  items.forEach(i => {
    (i.periods || []).forEach(p => s.add(String(p)));
  });
  return Array.from(s).sort();
};

export const displayInCharges = (item: PlanItem): number =>
  item.periods?.length ?? 0;

export const mediaInChargesForCost = (item: PlanItem): number =>
  item.sites * item.periods.length;

export const mediaCostBeforeDiscount = (item: PlanItem): number =>
  item.saleRate * mediaInChargesForCost(item);

export const volumeDiscount = (item: PlanItem): number => {
  const qualifies = item.periods.length >= 3;
  return qualifies ? -0.10 * mediaCostBeforeDiscount(item) : 0;
};

export const mediaCostAfterDiscount = (item: PlanItem): number =>
  mediaCostBeforeDiscount(item) + volumeDiscount(item);

export const productionCost = (item: PlanItem): number =>
  item.productionRate * item.sites * item.printRuns;

export const creativeCost = (item: PlanItem): number =>
  item.creativeRate * item.creativeAssets;

export const formatSubtotalExVat = (item: PlanItem): number =>
  mediaCostAfterDiscount(item) + productionCost(item) + creativeCost(item);

export const campaignTotals = (items: PlanItem[]) => {
  const mediaBefore = items.reduce((a,i)=>a+mediaCostBeforeDiscount(i),0);
  const volDisc    = items.reduce((a,i)=>a+volumeDiscount(i),0);
  const mediaAfter = mediaBefore + volDisc;
  const prod       = items.reduce((a,i)=>a+productionCost(i),0);
  const creative   = items.reduce((a,i)=>a+creativeCost(i),0);
  const exVat      = mediaAfter + prod + creative;
  return { mediaBefore, volDisc, mediaAfter, prod, creative, exVat };
};