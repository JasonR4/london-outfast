import { supabase } from "@/integrations/supabase/client";

export interface RateCardResponse {
  saleRatePerInCharge: number;
  productionRatePerUnit: number;
  creativeUnit: number;
  maxUnits: number;
  locations: { id: string; name: string; type: 'zone'|'city'|'borough'|'county' }[];
  inCharges: { period_number: number; label: string; start_date: string; end_date: string }[];
}

export async function getRateCard(formatId: string): Promise<RateCardResponse> {
  try {
    console.log('🔍 getRateCard called with formatId:', formatId);
    
    // First try to get the media format by ID (UUID) or by slug
    let formatQuery = supabase
      .from('media_formats')
      .select('*')
      .eq('is_active', true);
    
    // Check if formatId looks like a UUID (contains hyphens and is 36 chars)
    if (formatId.includes('-') && formatId.length === 36) {
      formatQuery = formatQuery.eq('id', formatId);
    } else {
      // Assume it's a slug
      formatQuery = formatQuery.eq('format_slug', formatId);
    }
    
    const { data: mediaFormat, error: formatError } = await formatQuery.single();
    
    if (formatError) {
      console.error('❌ Error fetching media format:', formatError);
      throw formatError;
    }
    
    console.log('✅ Found media format:', mediaFormat);
    
    // Fetch rate cards for this format using the actual UUID
    const { data: rateCards, error: rateError } = await supabase
      .from('rate_cards')
      .select('*')
      .eq('media_format_id', mediaFormat.id)
      .eq('is_active', true)
      .order('location_area', { ascending: true });

    if (rateError) {
      console.error('❌ Error fetching rate cards:', rateError);
    }

    console.log('✅ Found rate cards:', rateCards);

    // Fetch production cost tiers
    const { data: productionTiers, error: prodError } = await supabase
      .from('production_cost_tiers')
      .select('*')
      .eq('media_format_id', mediaFormat.id)
      .eq('is_active', true)
      .order('location_area', { ascending: true, nullsFirst: true })
      .order('min_quantity', { ascending: true });

    if (prodError) {
      console.error('❌ Error fetching production tiers:', prodError);
    }

    console.log('✅ Found production tiers:', productionTiers);

    // Fetch creative cost tiers
    const { data: creativeTiers, error: creativeError } = await supabase
      .from('creative_design_cost_tiers')
      .select('*')
      .eq('media_format_id', mediaFormat.id)
      .eq('is_active', true)
      .order('location_area', { ascending: true, nullsFirst: true })
      .order('min_quantity', { ascending: true });

    if (creativeError) {
      console.error('❌ Error fetching creative tiers:', creativeError);
    }

    console.log('✅ Found creative tiers:', creativeTiers);

    // Fetch available periods
    const { data: inchargePeriods, error: periodsError } = await supabase
      .from('incharge_periods')
      .select('*')
      .order('period_number', { ascending: true });

    if (periodsError) {
      console.error('❌ Error fetching periods:', periodsError);
    }

    console.log('✅ Found periods:', inchargePeriods);

    // Calculate rates with fallbacks
    const saleRatePerInCharge = rateCards?.[0]?.sale_price || 0;
    const productionRatePerUnit = productionTiers?.[0]?.cost_per_unit || 0;
    const creativeUnit = creativeTiers?.[0]?.cost_per_unit || 85; // Fallback to 85

    // Mock locations for now
    const locations = [
      { id: 'GD', name: 'Greater London', type: 'zone' as const },
      { id: 'central', name: 'Central London', type: 'zone' as const },
      { id: 'north', name: 'North London', type: 'zone' as const },
      { id: 'south', name: 'South London', type: 'zone' as const },
      { id: 'east', name: 'East London', type: 'zone' as const },
      { id: 'west', name: 'West London', type: 'zone' as const }
    ];

    // Transform periods
    const inCharges = inchargePeriods?.map(period => ({
      period_number: period.period_number,
      label: `Period ${period.period_number}`,
      start_date: period.start_date,
      end_date: period.end_date
    })) || [];

    const response = {
      saleRatePerInCharge,
      productionRatePerUnit,
      creativeUnit,
      maxUnits: 100,
      locations,
      inCharges
    };

    console.log('✅ Final rate card response:', response);
    return response;
    
  } catch (error) {
    console.error('❌ getRateCard error:', error);
    // Return safe fallbacks
    return {
      saleRatePerInCharge: 0,
      productionRatePerUnit: 0,
      creativeUnit: 85,
      maxUnits: 100,
      locations: [
        { id: 'GD', name: 'Greater London', type: 'zone' }
      ],
      inCharges: []
    };
  }
}