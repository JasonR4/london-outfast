import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RateCard {
  id: string;
  media_format_id: string;
  location_area: string;
  base_rate_per_incharge: number;
  production_cost: number;
  sale_price: number | null;
  reduced_price: number | null;
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

    } catch (err) {
      console.error('Error fetching rate data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rate data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (locationArea: string, incharges: number, includeProduction: boolean = false) => {
    const rateCard = rateCards.find(r => r.location_area === locationArea);
    if (!rateCard) return null;

    // Check for sale or reduced price first
    const basePrice = rateCard.sale_price || rateCard.reduced_price || rateCard.base_rate_per_incharge;
    let totalPrice = basePrice * incharges;

    // Apply discount tiers
    const applicableDiscount = discountTiers
      .filter(d => d.min_incharges <= incharges && (!d.max_incharges || incharges <= d.max_incharges))
      .sort((a, b) => b.discount_percentage - a.discount_percentage)[0]; // Get highest discount

    if (applicableDiscount) {
      totalPrice = totalPrice * (1 - applicableDiscount.discount_percentage / 100);
    }

    // Add production cost if requested
    if (includeProduction) {
      totalPrice += rateCard.production_cost;
    }

    return {
      basePrice,
      totalPrice,
      discount: applicableDiscount?.discount_percentage || 0,
      productionCost: rateCard.production_cost,
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
    mediaFormat,
    loading,
    error,
    calculatePrice,
    getAvailableLocations
  };
}