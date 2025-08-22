import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deal } from '@/utils/dealCalculations';

export function useRealDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRealDeals() {
      try {
        // Fetch rate cards with media format info
        const { data: rateCards, error: rateError } = await supabase
          .from('rate_cards')
          .select(`
            *,
            media_formats (
              format_name,
              format_slug
            )
          `)
          .eq('is_active', true);

        if (rateError) throw rateError;

        // Create deals using real rate card data
        const realDeals: Deal[] = [
          {
            slug: "central-london-premium-mix",
            title: "Central London: Premium Digital Mix",
            deadline_utc: "2025-08-29T15:00:00Z",
            discount_pct: 45,
            production_uplift_pct: 15,
            availability_left: 3,
            periods: [
              { code: "2025-P19", start: "2025-09-01", end: "2025-09-14" },
              { code: "2025-P20", start: "2025-09-15", end: "2025-09-28" }
            ],
            items: rateCards
              ?.filter(rc => 
                rc.location_area?.includes('GD') && 
                rc.media_formats?.format_name?.includes('Digital')
              )
              .slice(0, 3)
              .map(rc => ({
                format_slug: rc.media_formats?.format_slug || 'digital-format',
                format_name: rc.media_formats?.format_name || 'Digital Format',
                media_owner: 'Premium Network',
                location_area: formatLocationArea(rc.location_area || 'Central London'),
                qty: Math.floor(Math.random() * 6) + 2, // 2-8 panels
                unit_rate_card: Number(rc.sale_price || rc.base_rate_per_incharge || 1500),
                unit_production: rc.media_formats?.format_name?.includes('Digital') ? 0 : 120
              })) || [],
            notes: "Premium digital sites across central London"
          },
          {
            slug: "transport-hub-combo",
            title: "London Transport Hub Combo",
            deadline_utc: "2025-08-29T15:00:00Z",
            discount_pct: 50,
            production_uplift_pct: 12,
            availability_left: 2,
            periods: [
              { code: "2025-P19", start: "2025-09-01", end: "2025-09-14" },
              { code: "2025-P20", start: "2025-09-15", end: "2025-09-28" }
            ],
            items: rateCards
              ?.filter(rc => 
                rc.media_formats?.format_name?.toLowerCase().includes('bus') ||
                rc.media_formats?.format_name?.toLowerCase().includes('underground') ||
                rc.media_formats?.format_name?.toLowerCase().includes('rail')
              )
              .slice(0, 2)
              .map(rc => ({
                format_slug: rc.media_formats?.format_slug || 'transport-format',
                format_name: rc.media_formats?.format_name || 'Transport Format',
                media_owner: 'Transport Network',
                location_area: formatLocationArea(rc.location_area || 'Central London'),
                qty: Math.floor(Math.random() * 8) + 4, // 4-12 panels
                unit_rate_card: Number(rc.sale_price || rc.base_rate_per_incharge || 900),
                unit_production: 95
              })) || [],
            notes: "Multi-modal transport coverage across London"
          },
          {
            slug: "roadside-premium-package",
            title: "Roadside Premium Package",
            deadline_utc: "2025-08-29T15:00:00Z",
            discount_pct: 40,
            production_uplift_pct: 10,
            availability_left: 1,
            periods: [
              { code: "2025-P19", start: "2025-09-01", end: "2025-09-14" }
            ],
            items: rateCards
              ?.filter(rc => 
                rc.media_formats?.format_name?.includes('48') ||
                rc.media_formats?.format_name?.includes('6-Sheet') ||
                rc.media_formats?.format_name?.toLowerCase().includes('roadside')
              )
              .slice(0, 2)
              .map(rc => ({
                format_slug: rc.media_formats?.format_slug || 'roadside-format',
                format_name: rc.media_formats?.format_name || 'Roadside Format',
                media_owner: 'Premium Network',
                location_area: formatLocationArea(rc.location_area || 'Central London'),
                qty: Math.floor(Math.random() * 4) + 2, // 2-6 panels
                unit_rate_card: Number(rc.sale_price || rc.base_rate_per_incharge || 2200),
                unit_production: rc.media_formats?.format_name?.includes('Digital') ? 0 : 140
              })) || [],
            notes: "High-impact roadside advertising in premium locations"
          },
          {
            slug: "east-london-mixed-bundle",
            title: "East London: Mixed Format Bundle",
            deadline_utc: "2025-08-29T15:00:00Z",
            discount_pct: 45,
            production_uplift_pct: 8,
            availability_left: 4,
            periods: [
              { code: "2025-P19", start: "2025-09-01", end: "2025-09-14" },
              { code: "2025-P20", start: "2025-09-15", end: "2025-09-28" }
            ],
            items: rateCards
              ?.slice(2, 5) // Take different rates for variety
              .map(rc => ({
                format_slug: rc.media_formats?.format_slug || 'mixed-format',
                format_name: rc.media_formats?.format_name || 'Mixed Format',
                media_owner: 'Media Network',
                location_area: formatLocationArea(rc.location_area || 'East London'),
                qty: Math.floor(Math.random() * 6) + 3, // 3-9 panels
                unit_rate_card: Number(rc.sale_price || rc.base_rate_per_incharge || 1100),
                unit_production: 80
              })) || [],
            notes: "Mixed format coverage across East London"
          }
        ];

        // Filter out deals with no items
        const validDeals = realDeals.filter(deal => deal.items.length > 0);
        setDeals(validDeals);
        
      } catch (err) {
        console.error('Error fetching real deals:', err);
        setError('Failed to load deals');
        
        // Fallback to sample data if real data fails
        setDeals([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRealDeals();
  }, []);

  return { deals, loading, error };
}

// Helper functions
function getMediaOwnerByArea(area: string): string {
  if (area?.includes('Central') || area?.includes('GD')) return 'Global';
  if (area?.includes('East')) return 'Ocean';
  if (area?.includes('West')) return 'Clear Channel';
  if (area?.includes('North')) return 'JCDecaux';
  return 'Media Owner';
}

function getMediaOwnerByFormat(format: string): string {
  if (format?.toLowerCase().includes('digital')) return 'Ocean';
  if (format?.toLowerCase().includes('bus')) return 'Global';
  if (format?.toLowerCase().includes('underground') || format?.toLowerCase().includes('tube')) return 'TfL Partners';
  if (format?.toLowerCase().includes('rail')) return 'Admedia';
  return 'JCDecaux';
}

function formatLocationArea(area: string): string {
  if (area === 'GD') return 'Greater London';
  if (area?.includes('Central')) return 'Central London';
  return area || 'London';
}