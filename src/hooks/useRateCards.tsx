import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  incharge_period?: InchargePeriod;
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

  const calculateProductionCost = (locationArea: string, quantity: number, category?: string) => {
    console.log('🔍 Production Cost Debug:', {
      locationArea,
      quantity,
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

    const applicableTiers = productionCostTiers.filter(tier => 
      (tier.location_area === locationArea || tier.location_area === null) &&
      tier.min_quantity <= quantity &&
      (!tier.max_quantity || quantity <= tier.max_quantity) &&
      (!category || tier.category === category || tier.category === null)
    );

    console.log('🎯 Applicable Production Tiers:', applicableTiers);

    // Prioritize location-specific over global, then by category match
    const bestTier = applicableTiers.sort((a, b) => {
      if (a.location_area && !b.location_area) return -1;
      if (!a.location_area && b.location_area) return 1;
      if (a.category === category && b.category !== category) return -1;
      if (a.category !== category && b.category === category) return 1;
      return 0;
    })[0];

    console.log('✅ Best Production Tier:', bestTier);

    if (!bestTier) return null;

    const result = {
      costPerUnit: bestTier.cost_per_unit,
      totalCost: bestTier.cost_per_unit * quantity,
      tier: bestTier
    };

    console.log('💰 Production Cost Result:', result);
    return result;
  };

  const calculateCreativeCost = (locationArea: string, quantity: number, category: string) => {
    const applicableTiers = creativeCostTiers.filter(tier => 
      (tier.location_area === locationArea || tier.location_area === null) &&
      tier.min_quantity <= quantity &&
      (!tier.max_quantity || quantity <= tier.max_quantity) &&
      tier.category === category
    );

    // Prioritize location-specific over global
    const bestTier = applicableTiers.sort((a, b) => {
      if (a.location_area && !b.location_area) return -1;
      if (!a.location_area && b.location_area) return 1;
      return 0;
    })[0];

    if (!bestTier) return null;

    return {
      costPerUnit: bestTier.cost_per_unit,
      totalCost: bestTier.cost_per_unit * quantity,
      tier: bestTier
    };
  };

  const calculatePrice = (locationArea: string, selectedPeriods: number[]) => {
    const rateCard = rateCards.find(r => r.location_area === locationArea);
    if (!rateCard || selectedPeriods.length === 0) return null;

    // Apply location markup to base rate
    const baseRate = rateCard.base_rate_per_incharge;
    const markupMultiplier = 1 + (rateCard.location_markup_percentage / 100);
    const adjustedRate = baseRate * markupMultiplier;

    // Check for sale or reduced price first
    const finalRate = rateCard.sale_price || rateCard.reduced_price || adjustedRate;
    let totalPrice = finalRate * selectedPeriods.length;

    // Apply discount tiers based on number of periods
    const applicableDiscount = discountTiers
      .filter(d => d.min_periods <= selectedPeriods.length && (!d.max_periods || selectedPeriods.length <= d.max_periods))
      .sort((a, b) => b.discount_percentage - a.discount_percentage)[0]; // Get highest discount

    if (applicableDiscount) {
      totalPrice = totalPrice * (1 - applicableDiscount.discount_percentage / 100);
    }

    return {
      basePrice: baseRate,
      adjustedRate,
      totalPrice,
      discount: applicableDiscount?.discount_percentage || 0,
      locationMarkup: rateCard.location_markup_percentage,
      isOnSale: !!rateCard.sale_price,
      isReduced: !!rateCard.reduced_price && !rateCard.sale_price,
      periodsCount: selectedPeriods.length
    };
  };

  const getAvailablePeriodsForLocation = (locationArea: string) => {
    const rateCard = rateCards.find(r => r.location_area === locationArea);
    if (!rateCard) return [];

    const enabledPeriods = rateCardPeriods
      .filter(rcp => rcp.rate_card_id === rateCard.id && rcp.is_enabled)
      .map(rcp => rcp.incharge_period)
      .filter(Boolean);

    return enabledPeriods;
  };

  const getAvailableLocations = () => {
    return rateCards.map(r => r.location_area);
  };

  return {
    rateCards,
    discountTiers,
    productionCostTiers,
    creativeCostTiers,
    mediaFormat,
    inchargePeriods,
    rateCardPeriods,
    loading,
    error,
    calculatePrice,
    calculateProductionCost,
    calculateCreativeCost,
    getAvailableLocations,
    getAvailablePeriodsForLocation
  };
}