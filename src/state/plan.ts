// Working draft of the user's in-progress configuration (not yet "added to plan")
export type DraftItem = {
  id: string;                 // `${formatId}-${Date.now()}`
  formatId: string;
  formatName: string;
  saleRate: number;           // per in-charge
  quantity: number;           // sites
  selectedPeriods: number[];
  locations: string[];        // area slugs/ids if applicable
  creativeAssets: number;     // count the user set
  productionCost: number;     // computed via tiers × print runs
  creativeCost: number;       // computed via tiers
};

type PlanDraftState = {
  items: DraftItem[];
  upsert(item: DraftItem): void;
  remove(id: string): void;
  clear(): void;
};

import { create } from "zustand";

export const usePlanDraft = create<PlanDraftState>((set) => ({
  items: [],
  upsert: (item) => set(s => {
    const i = s.items.findIndex(x => x.id === item.id);
    if (i >= 0) { 
      const next = [...s.items]; 
      next[i] = item; 
      return { items: next }; 
    }
    return { items: [...s.items, item] };
  }),
  remove: (id) => set(s => ({ items: s.items.filter(x => x.id !== id) })),
  clear: () => set({ items: [] }),
}));