import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateVAT, VATCalculation } from '@/utils/vat';

export interface RateCard {
  id: string;
  media_format_id: string;
  location_area: string;
  base_rate_per_incharge: number;
  sale_price: number | null;
  reduced_price: number | null;
  location_markup_percentage: number;
  quantity_per_medium: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  incharge_period: number;
  is_date_specific: boolean;
}

export interface DiscountTier {
  id: string;
  media_format_id: string;
  min_periods: number;
  max_periods: number | null;
  discount_percentage: number;
  is_active: boolean;
}

export interface ProductionCostTier {
  id: string;
  media_format_id: string;
  location_area: string | null;
  min_quantity: number;
  max_quantity: number | null;
  cost_per_unit: number;
  category: string | null;
  is_active: boolean;
}

export interface CreativeCostTier {
  id: string;
  media_format_id: string;
  location_area: string | null;
  min_quantity: number;
  max_quantity: number | null;
  cost_per_unit: number;
  category: string;
  is_active: boolean;
}

export interface MediaFormat {
  id: string;
  format_name: string;
  format_slug: string;
  description: string | null;
  dimensions: string | null;
  is_active: boolean;
}

export interface InchargePeriod {
  id: string;
  period_number: number;
  start_date: string;
  end_date: string;
}

export interface RateCardPeriod {
  id: string;
  rate_card_id: string;
  incharge_period_id: string;
  is_enabled: boolean;
  incharge_periods?: InchargePeriod;
}

export function useRateCards(formatSlug?: string) {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([]);
  const [productionCostTiers, setProductionCostTiers] = useState<ProductionCostTier[]>([]);
  const [creativeCostTiers, setCreativeCostTiers] = useState<CreativeCostTier[]>([]);
  const [mediaFormat, setMediaFormat] = useState<MediaFormat | null>(null);
  const [inchargePeriods, setInchargePeriods] = useState<InchargePeriod[]>([]);
  const [rateCardPeriods, setRateCardPeriods] = useState<RateCardPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formatSlug) {
      fetchRateData(formatSlug);
    }
  }, [formatSlug]);

  const fetchRateData = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      // First get the media format
      const { data: formatData, error: formatError } = await supabase
        .from('media_formats')
        .select('*')
        .eq('format_slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (formatError) throw formatError;
      if (!formatData) {
        setError('Media format not found');
        return;
      }

      setMediaFormat(formatData);

      // Get incharge periods
      const { data: periodsData, error: periodsError } = await supabase
        .from('incharge_periods')
        .select('*')
        .order('period_number');

      console.log('🔍 INCHARGE PERIODS DEBUG:', {
        periodsData,
        periodsError,
        periodsLength: periodsData?.length
      });

      if (periodsError) throw periodsError;
      setInchargePeriods(periodsData || []);

      // Get rate cards for this format
      const { data: ratesData, error: ratesError } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('media_format_id', formatData.id)
        .eq('is_active', true)
        .order('location_area');

      if (ratesError) throw ratesError;
      setRateCards(ratesData || []);

      // Get rate card periods with incharge period details
      const { data: rateCardPeriodsData, error: rateCardPeriodsError } = await supabase
        .from('rate_card_periods')
        .select(`
          id,
          rate_card_id,
          incharge_period_id,
          is_enabled,
          incharge_periods(
            id,
            period_number,
            start_date,
            end_date
          )
        `)
        .eq('is_enabled', true)
        .in('rate_card_id', (ratesData || []).map(r => r.id));

      if (rateCardPeriodsError) {
        console.error('Rate card periods error:', rateCardPeriodsError);
        // Don't throw, just log and continue with empty array
        setRateCardPeriods([]);
      } else {
        console.log('✅ Rate card periods loaded:', rateCardPeriodsData);
        setRateCardPeriods(rateCardPeriodsData || []);
      }

      // Get discount tiers for this format
      const { data: discountsData, error: discountsError } = await supabase
        .from('discount_tiers')
        .select('*')
        .eq('media_format_id', formatData.id)
        .eq('is_active', true)
        .order('min_periods');

      if (discountsError) throw discountsError;
      setDiscountTiers(discountsData || []);

      // Get production cost tiers for this format
      const { data: productionData, error: productionError } = await supabase
        .from('production_cost_tiers')
        .select('*')
        .eq('media_format_id', formatData.id)
        .eq('is_active', true)
        .order('location_area', { nullsFirst: true })
        .order('min_quantity');

      if (productionError) {
        console.error('Production cost tiers error:', productionError);
        setProductionCostTiers([]);
      } else {
        console.log('✅ Production cost tiers loaded:', productionData);
        setProductionCostTiers(productionData || []);
      }

      // Get creative cost tiers for this format
      const { data: creativeData, error: creativeError } = await supabase
        .from('creative_design_cost_tiers')
        .select('*')
        .eq('media_format_id', formatData.id)
        .eq('is_active', true)
        .order('location_area', { nullsFirst: true })
        .order('min_quantity');

      if (creativeError) throw creativeError;
      setCreativeCostTiers(creativeData || []);

    } catch (err) {
      console.error('Error fetching rate data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rate data');
    } finally {
      setLoading(false);
    }
  };


  const calculateProductionCost = (sites: number, periods: number, category?: string) => {
    console.log('🔍 Production Cost Debug:', {
      sites,
      periods,
      category,
      availableTiers: productionCostTiers.length,
      allTiers: productionCostTiers.map(t => ({
        id: t.id,
        location_area: t.location_area,
        min_quantity: t.min_quantity,
        max_quantity: t.max_quantity,
        cost_per_unit: t.cost_per_unit,
        category: t.category
      }))
    });

    const totalUnits = sites * periods;
    
    const applicableTiers = productionCostTiers.filter(tier => 
      tier.min_quantity <= totalUnits &&
      (!tier.max_quantity || totalUnits <= tier.max_quantity) &&
      (!category || tier.category === category || tier.category === null)
    );

    console.log('🎯 Applicable Production Tiers:', applicableTiers);

    // Prioritize by category match
    const bestTier = applicableTiers.sort((a, b) => {
      if (a.category === category && b.category !== category) return -1;
      if (a.category !== category && b.category === category) return 1;
      return 0;
    })[0];

    console.log('✅ Best Production Tier:', bestTier);

    if (!bestTier) return null;

    const totalCost = bestTier.cost_per_unit * totalUnits;

    const result = {
      costPerUnit: bestTier.cost_per_unit,
      totalUnits,
      totalCost,
      tier: bestTier,
      ...calculateVAT(totalCost) // Add VAT calculations
    };

    console.log('💰 Production Cost Result:', result);
    return result;
  };

  const calculateCreativeCost = (locationArea: string, quantity: number, category: string) => {
    console.log('🎨 calculateCreativeCost called with:', { locationArea, quantity, category });
    console.log('🎨 Available creative tiers:', creativeCostTiers);
    
    const applicableTiers = creativeCostTiers.filter(tier => 
      (tier.location_area === locationArea || tier.location_area === null) &&
      tier.min_quantity <= quantity &&
      (!tier.max_quantity || quantity <= tier.max_quantity) &&
      (tier.category === category || tier.category === null)
    );

    console.log('🎯 Applicable Creative Tiers:', applicableTiers);

    // Prioritize location-specific over global
    const bestTier = applicableTiers.sort((a, b) => {
      if (a.location_area && !b.location_area) return -1;
      if (!a.location_area && b.location_area) return 1;
      return 0;
    })[0];

    console.log('✅ Best Creative Tier:', bestTier);

    if (!bestTier) return null;

    const result = {
      costPerUnit: bestTier.cost_per_unit,
      totalCost: bestTier.cost_per_unit * quantity,
      tier: bestTier,
      ...calculateVAT(bestTier.cost_per_unit * quantity) // Add VAT calculations
    };
    
    console.log('💰 Creative Cost Result:', result);
    return result;
  };

  // Helper function to map location names to rate card location codes
  const getLocationCodeForArea = (areaName: string) => {
    // For now, since we only have one rate card with "GD" (likely Greater London/General District)
    // We'll map all London areas to "GD"
    // In a production system, you'd have a proper mapping table
    console.log('🗺️ Mapping area name to location code:', areaName);
    return "GD"; // Default to GD for all London areas for now
  };

  const calculatePrice = (locationArea: string, selectedPeriods: number[]) => {
    console.log('🔍 calculatePrice called with:', { locationArea, selectedPeriods, selectedPeriodsLength: selectedPeriods.length });
    
    // Map the location area name to the rate card location code
    const locationCode = getLocationCodeForArea(locationArea);
    console.log('🗺️ Mapped location code:', locationCode);
    console.log('📊 Available rate cards:', rateCards.map(r => ({ id: r.id, location_area: r.location_area, base_rate: r.base_rate_per_incharge, sale_price: r.sale_price })));
    
    const rateCard = rateCards.find(r => r.location_area === locationCode);
    console.log('🎯 Found rate card:', rateCard);
    
    if (!rateCard) {
      console.log('❌ No rate card found for location:', locationCode);
      return null;
    }
    
    if (selectedPeriods.length === 0) {
      console.log('❌ No periods selected');
      return null;
    }

    // Apply location markup to base rate
    const baseRate = rateCard.base_rate_per_incharge;
    const markupMultiplier = 1 + (rateCard.location_markup_percentage / 100);
    const adjustedRate = baseRate * markupMultiplier;

    // Check for sale or reduced price first
    const finalRate = rateCard.sale_price || rateCard.reduced_price || adjustedRate;
    let totalPrice = finalRate * selectedPeriods.length;

    console.log('💰 Pricing calculation:', {
      baseRate,
      markupMultiplier,
      adjustedRate,
      finalRate,
      periodsCount: selectedPeriods.length,
      totalPrice
    });

    // Apply discount tiers based on number of periods
    const applicableDiscount = discountTiers
      .filter(d => d.min_periods <= selectedPeriods.length && (!d.max_periods || selectedPeriods.length <= d.max_periods))
      .sort((a, b) => b.discount_percentage - a.discount_percentage)[0]; // Get highest discount

    if (applicableDiscount) {
      console.log('🎫 Applying discount:', applicableDiscount);
      totalPrice = totalPrice * (1 - applicableDiscount.discount_percentage / 100);
    }

    const result = {
      basePrice: baseRate,
      adjustedRate,
      totalPrice,
      discount: applicableDiscount?.discount_percentage || 0,
      locationMarkup: rateCard.location_markup_percentage,
      isOnSale: !!rateCard.sale_price,
      isReduced: !!rateCard.reduced_price && !rateCard.sale_price,
      periodsCount: selectedPeriods.length,
      ...calculateVAT(totalPrice) // Add VAT calculations
    };

    console.log('✅ Final price calculation result:', result);
    return result;
  };

  const getAvailablePeriodsForLocation = (locationArea: string) => {
    const rateCard = rateCards.find(r => r.location_area === locationArea);
    if (!rateCard) return [];

    const enabledPeriods = rateCardPeriods
      .filter(rcp => rcp.rate_card_id === rateCard.id && rcp.is_enabled)
      .map(rcp => rcp.incharge_periods)
      .filter(Boolean);

    return enabledPeriods as InchargePeriod[];
  };

  // Get all available periods across all locations for this format
  const getAllAvailablePeriods = () => {
    console.log('🔍 getAllAvailablePeriods Debug:', {
      rateCardPeriodsLength: rateCardPeriods.length,
      rateCardPeriods: rateCardPeriods.map(rcp => ({
        id: rcp.id,
        rate_card_id: rcp.rate_card_id,
        is_enabled: rcp.is_enabled,
        incharge_periods: rcp.incharge_periods
      }))
    });

    const allEnabledPeriods = rateCardPeriods
      .filter(rcp => rcp.is_enabled)
      .map(rcp => rcp.incharge_periods)
      .filter(Boolean);

    console.log('📋 All enabled periods:', allEnabledPeriods);

    // Remove duplicates based on period_number
    const uniquePeriods = allEnabledPeriods.reduce((acc: InchargePeriod[], period) => {
      if (period && !acc.some(p => p.period_number === period.period_number)) {
        acc.push(period);
      }
      return acc;
    }, []);

    const sortedPeriods = uniquePeriods.sort((a, b) => a.period_number - b.period_number);
    console.log('✅ Final sorted periods:', sortedPeriods);
    
    return sortedPeriods;
  };

  const getAvailableLocations = () => {
    return rateCards.map(r => r.location_area);
  };

  const getAvailableCreativeCategories = () => {
    const categories = [...new Set(creativeCostTiers.map(tier => tier.category))];
    return categories.length > 0 ? categories : ['Basic Design', 'Standard Design', 'Premium Design'];
  };

  return {
    rateCards,
    discountTiers,
    productionCostTiers,
    creativeCostTiers,
    mediaFormat,
    inchargePeriods: getAllAvailablePeriods(), // Use filtered periods enabled for this format
    rateCardPeriods,
    loading,
    error,
    calculatePrice,
    calculateProductionCost,
    calculateCreativeCost,
    getAvailableLocations,
    getAvailablePeriodsForLocation,
    getAllAvailablePeriods,
    getAvailableCreativeCategories
  };
}