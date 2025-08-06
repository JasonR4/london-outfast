import { useMemo } from 'react';
import { londonAreas } from '@/data/londonAreas';

interface UpsellOption {
  title: string;
  description: string;
  currentValue: number;
  suggestedValue: number;
  costIncrease: number;
  percentageIncrease: number;
  benefitText: string;
  type: 'quantity' | 'periods';
}

interface LocationCapacityProps {
  quantity: number;
  selectedPeriods: number[];
  selectedAreas: string[];
  basePrice?: number;
}

export const useLocationCapacity = ({
  quantity,
  selectedPeriods,
  selectedAreas,
  basePrice = 1000
}: LocationCapacityProps) => {
  
  const calculations = useMemo(() => {
    const maxLocationCapacity = quantity * selectedPeriods.length;
    const locationCapacityUsed = selectedAreas.length;
    const remainingCapacity = Math.max(0, maxLocationCapacity - locationCapacityUsed);
    const isOverCapacity = locationCapacityUsed > maxLocationCapacity;
    const capacityUtilization = maxLocationCapacity > 0 ? (locationCapacityUsed / maxLocationCapacity) * 100 : 0;
    
    // Determine status
    let capacityStatus: 'available' | 'warning' | 'at-limit' | 'over-limit';
    if (isOverCapacity) {
      capacityStatus = 'over-limit';
    } else if (capacityUtilization >= 100) {
      capacityStatus = 'at-limit';
    } else if (capacityUtilization >= 80) {
      capacityStatus = 'warning';
    } else {
      capacityStatus = 'available';
    }

    return {
      maxLocationCapacity,
      locationCapacityUsed,
      remainingCapacity,
      isOverCapacity,
      capacityUtilization,
      capacityStatus
    };
  }, [quantity, selectedPeriods.length, selectedAreas.length]);

  const canSelectLocation = (locationName: string) => {
    if (selectedAreas.includes(locationName)) return true;
    return calculations.remainingCapacity > 0;
  };

  const canSelectZone = (zoneName: string) => {
    const zone = londonAreas.find(z => z.zone === zoneName);
    if (!zone) return false;
    
    const unselectedAreas = zone.areas.filter(area => !selectedAreas.includes(area));
    return unselectedAreas.length <= calculations.remainingCapacity;
  };

  const getZoneSelectionInfo = (zoneName: string) => {
    const zone = londonAreas.find(z => z.zone === zoneName);
    if (!zone) return null;
    
    const unselectedAreas = zone.areas.filter(area => !selectedAreas.includes(area));
    const requiredCapacity = unselectedAreas.length;
    const canSelect = requiredCapacity <= calculations.remainingCapacity;
    
    return {
      totalAreas: zone.areas.length,
      unselectedAreas: requiredCapacity,
      requiredCapacity,
      canSelect,
      capacityShortfall: Math.max(0, requiredCapacity - calculations.remainingCapacity)
    };
  };

  const generateUpsellOptions = (requiredCapacity: number): UpsellOption[] => {
    const options: UpsellOption[] = [];
    
    // Option 1: Increase quantity
    const quantityNeeded = Math.ceil(requiredCapacity / selectedPeriods.length);
    if (quantityNeeded > quantity) {
      const quantityIncrease = quantityNeeded - quantity;
      const costIncrease = quantityIncrease * basePrice * selectedPeriods.length;
      const percentageIncrease = Math.round((costIncrease / (basePrice * quantity * selectedPeriods.length)) * 100);
      
      options.push({
        title: `Upgrade to ${quantityNeeded} Sites`,
        description: `Increase from ${quantity} to ${quantityNeeded} sites to accommodate all selected locations`,
        currentValue: quantity,
        suggestedValue: quantityNeeded,
        costIncrease,
        percentageIncrease,
        benefitText: `Unlock ${quantityIncrease * selectedPeriods.length} additional location slots`,
        type: 'quantity'
      });
    }

    // Option 2: Increase periods (if we have periods selected)
    if (selectedPeriods.length > 0) {
      const periodsNeeded = Math.ceil(requiredCapacity / quantity);
      if (periodsNeeded > selectedPeriods.length) {
        const periodIncrease = periodsNeeded - selectedPeriods.length;
        const costIncrease = quantity * basePrice * periodIncrease;
        const percentageIncrease = Math.round((costIncrease / (basePrice * quantity * selectedPeriods.length)) * 100);
        
        options.push({
          title: `Extend to ${periodsNeeded} Periods`,
          description: `Increase from ${selectedPeriods.length} to ${periodsNeeded} periods for rotation coverage`,
          currentValue: selectedPeriods.length,
          suggestedValue: periodsNeeded,
          costIncrease,
          percentageIncrease,
          benefitText: `Enable rotation across ${periodIncrease * quantity} additional location slots`,
          type: 'periods'
        });
      }
    }

    // Sort by cost efficiency (lowest percentage increase first)
    return options.sort((a, b) => a.percentageIncrease - b.percentageIncrease);
  };

  const getSmartRecommendations = () => {
    const recommendations: string[] = [];
    
    if (calculations.capacityStatus === 'available' && calculations.remainingCapacity > 0) {
      recommendations.push(`You have ${calculations.remainingCapacity} location slots remaining. Consider adding premium areas like Oxford Street or Bond Street for maximum impact.`);
    }
    
    if (calculations.capacityStatus === 'warning') {
      recommendations.push(`You're near capacity (${calculations.capacityUtilization.toFixed(0)}% used). Plan your remaining ${calculations.remainingCapacity} selections strategically.`);
    }
    
    if (calculations.capacityStatus === 'at-limit') {
      recommendations.push(`Perfect! You've maximized your location coverage with ${calculations.locationCapacityUsed} strategic locations.`);
    }
    
    if (calculations.capacityStatus === 'over-limit') {
      const overBy = calculations.locationCapacityUsed - calculations.maxLocationCapacity;
      recommendations.push(`You've selected ${overBy} more locations than your current capacity allows. Consider upgrading for optimal coverage.`);
    }

    return recommendations;
  };

  return {
    ...calculations,
    canSelectLocation,
    canSelectZone,
    getZoneSelectionInfo,
    generateUpsellOptions,
    getSmartRecommendations
  };
};