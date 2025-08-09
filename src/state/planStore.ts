import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PeriodId = string;

export type PlanItem = {
  id: string;
  formatId: string;
  formatName: string;
  saleRate: number;
  sites: number;
  periods: PeriodId[];
  locations?: string[];
  productionRate?: number;
  printRuns?: number;
  creativeAssets?: number;
  creativeRate?: number;
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
      name: "mbl-plan-store-v1",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      partialize: (state) => ({ items: state.items })
    }
  )
);

// ----------- CENTRALIZED SYNC FUNCTION -----------
export const syncPlanStore = (configState?: {
  selectedFormats: any[];
  formatQuantities: Record<string, number>;
  selectedPeriods: number[];
  selectedLocations: string[];
  needsCreative: boolean;
  creativeQuantity: number;
  rateCards: any[];
}) => {
  console.log('🔄 syncPlanStore called with:', configState);
  
  if (!configState) {
    console.log('❌ No config state provided, clearing store');
    usePlanStore.getState().clear();
    return;
  }

  const { 
    selectedFormats, 
    formatQuantities, 
    selectedPeriods, 
    selectedLocations, 
    needsCreative, 
    creativeQuantity, 
    rateCards 
  } = configState;

  if (!selectedFormats || selectedFormats.length === 0) {
    console.log('❌ No formats selected, clearing store');
    usePlanStore.getState().clear();
    return;
  }

  const items: PlanItem[] = selectedFormats.map((format) => {
    const formatKey = format.format_slug || format.id;
    const qty = formatQuantities[formatKey] || 1;
    const periods = selectedPeriods.map(String);
    
    // Look up rate card values
    const rateInfo = rateCards?.find((r: any) => r.media_format_id === format.id);
    const saleRate = rateInfo?.sale_price || 800; // fallback rate
    const productionRate = rateInfo?.production_rate || 25;
    const creativeRate = needsCreative ? 350 : 0;
    const creativeAssets = needsCreative ? creativeQuantity : 0;

    console.log('🏗️ Building item for format:', format.format_name, {
      sites: qty,
      periodsLength: periods.length,
      saleRate,
      locations: selectedLocations.length
    });

    return {
      id: formatKey,
      formatId: formatKey,
      formatName: format.format_name || format.name || formatKey,
      name: format.format_name || format.name || formatKey,
      saleRate,
      sites: qty,
      periods,
      locations: selectedLocations,
      productionRate,
      printRuns: 1, // default
      creativeAssets,
      creativeRate,
    };
  });

  console.log('📦 Setting items in store:', items.length, 'items');
  usePlanStore.getState().setItems(items);
};

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
  (item?.periods?.length ?? item?.selectedPeriods?.length ?? 0);

export const mediaInChargesForCost = (item: PlanItem | any): number =>
  (item?.sites ?? item?.quantity ?? 0) * (item?.periods?.length ?? item?.selectedPeriods?.length ?? 0);

export const mediaCostBeforeDiscount = (item: PlanItem | any): number =>
  (item?.saleRate ?? item?.saleRatePerInCharge ?? 0) * mediaInChargesForCost(item);

export const volumeDiscount = (item: PlanItem | any): number => {
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