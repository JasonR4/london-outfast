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
}

export interface DiscountTier {
  id: string;
  media_format_id: string;
  min_incharges: number;
  max_incharges: number | null;
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

export function useRateCards(formatSlug?: string) {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([]);
  const [productionCostTiers, setProductionCostTiers] = useState<ProductionCostTier[]>([]);
  const [creativeCostTiers, setCreativeCostTiers] = useState<CreativeCostTier[]>([]);
  const [mediaFormat, setMediaFormat] = useState<MediaFormat | null>(null);
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

      // Get rate cards for this format
      const { data: ratesData, error: ratesError } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('media_format_id', formatData.id)
        .eq('is_active', true)
        .order('location_area');

      if (ratesError) throw ratesError;
      setRateCards(ratesData || []);

      // Get discount tiers for this format
      const { data: discountsData, error: discountsError } = await supabase
        .from('discount_tiers')
        .select('*')
        .eq('media_format_id', formatData.id)
        .eq('is_active', true)
        .order('min_incharges');

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

      if (productionError) throw productionError;
      setProductionCostTiers(productionData || []);

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

  const calculatePrice = (locationArea: string, incharges: number) => {
    const rateCard = rateCards.find(r => r.location_area === locationArea);
    if (!rateCard) return null;

    // Apply location markup to base rate
    const baseRate = rateCard.base_rate_per_incharge;
    const markupMultiplier = 1 + (rateCard.location_markup_percentage / 100);
    const adjustedRate = baseRate * markupMultiplier;

    // Check for sale or reduced price first
    const finalRate = rateCard.sale_price || rateCard.reduced_price || adjustedRate;
    let totalPrice = finalRate * incharges;

    // Apply discount tiers
    const applicableDiscount = discountTiers
      .filter(d => d.min_incharges <= incharges && (!d.max_incharges || incharges <= d.max_incharges))
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
      isReduced: !!rateCard.reduced_price && !rateCard.sale_price
    };
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
    loading,
    error,
    calculatePrice,
    calculateProductionCost,
    calculateCreativeCost,
    getAvailableLocations
  };
}