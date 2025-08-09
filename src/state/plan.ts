// Working draft of the user's in-progress configuration (not yet "added to plan")
export type DraftItem = {
  id: string;                 // `${formatId}-${Date.now()}`
  formatId: string;
  formatName: string;
  saleRatePerInCharge: number;          // from Rate Card Manager
  productionRatePerUnit: number;        // from Rate Card Manager
  creativeUnit: number;                 // from Rate Card Manager (fallback 85)
  quantity: number;                     // sites
  selectedPeriods: number[];            // period numbers
  locations: string[];                  // ids/slugs
  creativeAssets: number;
  validation?: { capacityWarning?: string };
  // Computed costs
  mediaCost: number;
  productionCost: number;
  creativeCost: number;
  totalCost: number;
  discountAmount: number;
  qualifiesVolume: boolean;
};

type PlanDraftState = {
  items: DraftItem[];
  getItem(formatId: string): DraftItem | undefined;
  upsertItem(formatId: string, updates: Partial<Omit<DraftItem, 'id' | 'formatId'>>): void;
  removeItem(formatId: string): void;
  clear(): void;
};

import { create } from "zustand";

export const usePlanDraft = create<PlanDraftState>((set, get) => ({
  items: [],
  getItem: (formatId) => get().items.find(item => item.formatId === formatId),
  upsertItem: (formatId, updates) => set(state => {
    const existingIndex = state.items.findIndex(item => item.formatId === formatId);
    const existing = existingIndex >= 0 ? state.items[existingIndex] : null;
    
    const updatedItem: DraftItem = {
      id: formatId,
      formatId,
      formatName: updates.formatName || existing?.formatName || '',
      saleRatePerInCharge: updates.saleRatePerInCharge ?? existing?.saleRatePerInCharge ?? 0,
      productionRatePerUnit: updates.productionRatePerUnit ?? existing?.productionRatePerUnit ?? 0,
      creativeUnit: updates.creativeUnit ?? existing?.creativeUnit ?? 85,
      quantity: updates.quantity ?? existing?.quantity ?? 1,
      selectedPeriods: updates.selectedPeriods ?? existing?.selectedPeriods ?? [],
      locations: updates.locations ?? existing?.locations ?? [],
      creativeAssets: updates.creativeAssets ?? existing?.creativeAssets ?? 0,
      validation: updates.validation ?? existing?.validation,
      mediaCost: updates.mediaCost ?? existing?.mediaCost ?? 0,
      productionCost: updates.productionCost ?? existing?.productionCost ?? 0,
      creativeCost: updates.creativeCost ?? existing?.creativeCost ?? 0,
      totalCost: updates.totalCost ?? existing?.totalCost ?? 0,
      discountAmount: updates.discountAmount ?? existing?.discountAmount ?? 0,
      qualifiesVolume: updates.qualifiesVolume ?? existing?.qualifiesVolume ?? false,
    };

    const newItems = [...state.items];
    if (existingIndex >= 0) {
      newItems[existingIndex] = updatedItem;
    } else {
      newItems.push(updatedItem);
    }
    
    return { items: newItems };
  }),
  removeItem: (formatId) => set(state => ({
    items: state.items.filter(item => item.formatId !== formatId)
  })),
  clear: () => set({ items: [] }),
}));