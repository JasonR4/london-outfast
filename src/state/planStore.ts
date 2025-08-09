import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PeriodId = string;     // e.g. "16"

export type PlanItem = {
  id: string;                      // stable key per selected format
  formatId: string;
  formatName: string;
  saleRate: number;                // media rate per in-charge (per period)
  sites: number;                   // total sites across the whole campaign
  periods: PeriodId[];             // selected periods for this format
  locations?: string[];            // selected area ids/names (capacity check only)
  productionRate?: number;         // per site per print run
  printRuns?: number;              // derived in UI (non-consecutive), optional
  creativeAssets?: number;
  creativeRate?: number;           // per asset
  name?: string;
};

type StoreState = {
  items: PlanItem[];
  upsertItem: (item: PlanItem) => void;
  removeItem: (id: string) => void;
  setItems: (items: PlanItem[]) => void;
  clear: () => void;
};

export const usePlanStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      upsertItem: (item) => {
        const items = get().items.slice();
        const idx = items.findIndex(i => i.id === item.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...item };
        } else {
          items.push(item);
        }
        set({ items });
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      setItems: (items) => set({ items }),
      clear: () => set({ items: [] })
    }),
    {
      name: "mbl-plan-v2",
      storage: createJSONStorage(() => sessionStorage),
      version: 2,
      migrate: (state: any, version) => {
        console.log('🔄 Plan store migration:', { state, version });
        // If we detect an unexpected shape from a previous session, drop it.
        if (!state || !Array.isArray(state.items)) {
          console.log('⚠️ Invalid state detected, clearing items');
          return { items: [] };
        }
        const items = (state.items as any[]).filter(isValidPlanItem);
        console.log('✅ Migration completed with', items.length, 'valid items');
        return { items };
      },
      partialize: (state) => ({ items: state.items }) // store only items
    }
  )
);

// ---------- Guards & selectors ----------
export const isValidPlanItem = (it: any): it is PlanItem => {
  const sites = Number(it?.sites ?? it?.quantity ?? 0);
  const periods = Array.isArray(it?.periods ?? it?.selectedPeriods) ? (it?.periods ?? it?.selectedPeriods) : [];
  const rate = Number(it?.saleRate ?? it?.saleRatePerInCharge ?? 0);
  return sites > 0 && periods.length > 0 && rate > 0;
};

export const selectValidItems = (s: { items: PlanItem[] }) =>
  (s.items ?? []).filter(isValidPlanItem);

export const selectHasActivePlan = (s: { items: PlanItem[] }) =>
  selectValidItems(s).length > 0;

// ---------- Derived helpers (pure) ----------
export const uniqueCampaignPeriods = (items: (PlanItem | any)[]): PeriodId[] => {
  const s = new Set<PeriodId>();
  items.forEach(i => {
    const periods = i?.periods ?? i?.selectedPeriods ?? [];
    (Array.isArray(periods) ? periods : []).forEach(p => s.add(String(p)));
  });
  return Array.from(s).sort();
};

export const displayInCharges = (item: PlanItem | any): number =>
  (item?.periods?.length ?? item?.selectedPeriods?.length ?? 0); // DISPLAY ONLY (period windows)

export const mediaInChargesForCost = (item: PlanItem | any): number =>
  (item?.sites ?? item?.quantity ?? 0) * (item?.periods?.length ?? item?.selectedPeriods?.length ?? 0); // COST math

export const mediaCostBeforeDiscount = (item: PlanItem | any): number =>
  (item?.saleRate ?? item?.saleRatePerInCharge ?? 0) * mediaInChargesForCost(item);

export const volumeDiscount = (item: PlanItem | any): number => {
  // 10% when 3+ periods (as per app rules)
  const qualifies = (item?.periods?.length ?? item?.selectedPeriods?.length ?? 0) >= 3;
  return qualifies ? -0.10 * mediaCostBeforeDiscount(item) : 0;
};

export const mediaCostAfterDiscount = (item: PlanItem | any): number =>
  mediaCostBeforeDiscount(item) + volumeDiscount(item);

export const productionCost = (item: PlanItem | any): number => {
  const runs = item?.printRuns ?? 1;
  return (item?.productionRate ?? item?.productionCost ?? 0) * (item?.sites ?? item?.quantity ?? 0) * runs;
};

export const creativeCost = (item: PlanItem | any): number =>
  (item?.creativeRate ?? 0) * (item?.creativeAssets ?? item?.creativeCost ?? 0);

export const formatSubtotalExVat = (item: PlanItem | any): number =>
  mediaCostAfterDiscount(item) + productionCost(item) + creativeCost(item);

export const campaignTotals = (items: (PlanItem | any)[]) => {
  const mediaBefore = items.reduce((a,i)=>a+mediaCostBeforeDiscount(i),0);
  const volDisc    = items.reduce((a,i)=>a+volumeDiscount(i),0);
  const mediaAfter = mediaBefore + volDisc;
  const prod       = items.reduce((a,i)=>a+productionCost(i),0);
  const creative   = items.reduce((a,i)=>a+creativeCost(i),0);
  const exVat      = mediaAfter + prod + creative;
  return { mediaBefore, volDisc, mediaAfter, prod, creative, exVat };
};