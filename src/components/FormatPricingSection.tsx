import React, { useMemo } from 'react';
import GatedCostPanel from '@/components/GatedCostPanel';

type Props = {
  isAuthenticated: boolean;
  format: { category?: string; slug?: string; name?: string; format_name?: string };
  quantity: number;
  selectedAreas: string[];
  selectedPeriods: number[];
  isDateSpecific: boolean;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  needsCreative: boolean;
  creativeAssets: number;
  rateLoading: boolean;
  getAvailableLocations: () => string[];
  calculatePrice: (location: string, periods: number[]) => { basePrice: number } | null;
  calculateProductionCost: (qty: number, periods: number[], category?: string) => { totalCost: number } | null;
};

export default function FormatPricingSection(props: Props) {
  const {
    isAuthenticated, format, quantity, selectedAreas, selectedPeriods,
    isDateSpecific, selectedStartDate, selectedEndDate, needsCreative,
    creativeAssets, rateLoading, getAvailableLocations, calculatePrice,
    calculateProductionCost
  } = props;

  const pricing = useMemo(() => {
    if (!isAuthenticated || rateLoading || selectedAreas.length === 0) {
      return undefined;
    }

    const availableLocations = getAvailableLocations();
    const representativeArea = selectedAreas[0];
    const match = availableLocations.find(loc =>
      selectedAreas.some(area =>
        (loc || '').toLowerCase().includes((area || '').toLowerCase()) ||
        (area || '').toLowerCase().includes((loc || '').toLowerCase())
      )
    ) || availableLocations[0];

    const location = match || representativeArea;

    let calc: { basePrice: number } | null = null;
    if (isDateSpecific && selectedPeriods.length > 0) {
      calc = calculatePrice(location, selectedPeriods);
    } else if (!isDateSpecific && selectedStartDate && selectedEndDate) {
      const diffTime = Math.abs(selectedEndDate.getTime() - selectedStartDate.getTime());
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      const pseudo = Array.from({ length: diffWeeks }, (_, i) => i + 1);
      calc = calculatePrice(location, pseudo);
    }

    if (!calc) return undefined;

    const units = quantity;
    const uniquePeriods = new Set(selectedPeriods).size || 1;
    const saleRate = calc.basePrice;
    const qualifiesVolume = uniquePeriods >= 3;

    const mediaCost = saleRate * units * uniquePeriods;
    const mediaDiscount = qualifiesVolume ? mediaCost * 0.10 : 0;
    const mediaAfterDiscount = mediaCost - mediaDiscount;

    const prod = calculateProductionCost(quantity, selectedPeriods, format.category)?.totalCost || 0;
    const creative = needsCreative ? (creativeAssets * 85) : 0;

    return {
      mediaPrice: mediaCost,
      mediaDiscount,
      mediaAfterDiscount,
      productionCost: prod,
      creativeCost: creative,
      totalCost: mediaAfterDiscount + prod + creative,
      qualifiesVolume
    };
  }, [
    isAuthenticated, rateLoading, selectedAreas, selectedPeriods, isDateSpecific,
    selectedStartDate, selectedEndDate, quantity, needsCreative, creativeAssets,
    calculatePrice, calculateProductionCost, getAvailableLocations, format?.category
  ]);

  // Masked/real rendering is handled by GatedCostPanel
  return (
    <div className="mt-6">
      <GatedCostPanel
        isAuthenticated={!!isAuthenticated}
        pricing={pricing as any}
        formatName={format?.format_name || format?.name || format?.slug || 'format'}
        className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2"
      />
    </div>
  );
}