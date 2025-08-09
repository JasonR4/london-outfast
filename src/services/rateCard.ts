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
    // Fetch media format details
    const { data: mediaFormats, error: formatError } = await supabase
      .from('media_formats')
      .select('*')
      .eq('id', formatId)
      .eq('is_active', true)
      .single();

    if (formatError) throw formatError;

    // Fetch rate cards for this format
    const { data: rateCards, error: rateError } = await supabase
      .from('rate_cards')
      .select('*')
      .eq('media_format_id', formatId)
      .eq('is_active', true)
      .order('location_area', { ascending: true });

    if (rateError) throw rateError;

    // Fetch production cost tiers
    const { data: productionTiers, error: prodError } = await supabase
      .from('production_cost_tiers')
      .select('*')
      .eq('media_format_id', formatId)
      .eq('is_active', true)
      .order('location_area', { ascending: true, nullsFirst: true })
      .order('min_quantity', { ascending: true });

    if (prodError) throw prodError;

    // Fetch creative cost tiers
    const { data: creativeTiers, error: creativeError } = await supabase
      .from('creative_design_cost_tiers')
      .select('*')
      .eq('media_format_id', formatId)
      .eq('is_active', true)
      .order('location_area', { ascending: true, nullsFirst: true })
      .order('min_quantity', { ascending: true });

    if (creativeError) throw creativeError;

    // Fetch available periods
    const { data: inchargePeriods, error: periodsError } = await supabase
      .from('incharge_periods')
      .select('*')
      .order('period_number', { ascending: true });

    if (periodsError) throw periodsError;

    // Calculate rates with fallbacks
    const saleRatePerInCharge = rateCards[0]?.sale_price || 0;
    const productionRatePerUnit = productionTiers[0]?.cost_per_unit || 0;
    const creativeUnit = creativeTiers[0]?.cost_per_unit || 85; // Fallback to 85

    // Mock locations for now - in real implementation, this would come from rate cards
    const locations = [
      { id: 'GD', name: 'Greater London', type: 'zone' as const },
      { id: 'central', name: 'Central London', type: 'zone' as const },
      { id: 'north', name: 'North London', type: 'zone' as const },
      { id: 'south', name: 'South London', type: 'zone' as const },
      { id: 'east', name: 'East London', type: 'zone' as const },
      { id: 'west', name: 'West London', type: 'zone' as const }
    ];

    // Transform periods
    const inCharges = inchargePeriods.map(period => ({
      period_number: period.period_number,
      label: `Period ${period.period_number}`,
      start_date: period.start_date,
      end_date: period.end_date
    }));

    return {
      saleRatePerInCharge,
      productionRatePerUnit,
      creativeUnit,
      maxUnits: 100, // Default max units
      locations,
      inCharges
    };
  } catch (error) {
    console.error('Error fetching rate card:', error);
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