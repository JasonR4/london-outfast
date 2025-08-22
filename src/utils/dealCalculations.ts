export type DealPeriod = {
  code: string;
  start: string;
  end: string;
};

export type DealItem = {
  format_slug: string;
  format_name: string;
  media_owner: string;
  location_area: string;
  qty: number;
  unit_rate_card: number;        // per panel per period
  unit_production: number;       // per panel (static) or 0 for digital
  production_uplift_pct?: number;// optional override
};

export type Deal = {
  slug: string;
  title: string;
  deadline_utc: string;
  discount_pct: number;                // e.g. 45
  production_uplift_pct?: number;      // e.g. 15
  periods: DealPeriod[];
  items: DealItem[];
  availability_left: number;
  notes?: string;
};

export type DealLineCalc = {
  format_slug: string;
  format_name: string;
  media_owner: string;
  area: string;
  qty: number;
  perPanelRateCard: number;
  perPanelDeal: number;
  perPanelProduction: number;
  mediaRateCard: number;   // qty * unit_rate_card * periodsCount
  mediaDeal: number;       // qty * unit_rate_card*(1-discount) * periodsCount
  productionTotal: number; // qty * unit_production*(1+uplift)
  lineSubtotal: number;    // mediaDeal + productionTotal
};

export type DealCalc = {
  periodsCount: number;
  lines: DealLineCalc[];
  totals: {
    mediaRateCard: number;
    mediaDeal: number;
    production: number;
    discountValue: number;     // mediaRateCard - mediaDeal
    grandTotal: number;        // mediaDeal + production
    savingPct: number;         // discountValue / mediaRateCard
  };
};

export function calcDeal(deal: Deal): DealCalc {
  const periodsCount = Math.max(1, deal.periods?.length || 1);
  const globalDisc = (deal.discount_pct ?? 45) / 100;
  const globalProdUp = (deal.production_uplift_pct ?? 0) / 100;

  const lines = deal.items.map(item => {
    // Use the unit_rate_card as the base panel price
    const perPanelRateCard = item.unit_rate_card;
    const uplift = (item.production_uplift_pct ?? (globalProdUp * 100)) / 100;
    const perPanelProduction = item.unit_production * (1 + uplift);

    // Calculate totals before discount
    const mediaRateCard = item.qty * perPanelRateCard * periodsCount;
    const productionTotal = item.qty * perPanelProduction;

    return {
      format_slug: item.format_slug,
      format_name: item.format_name,
      media_owner: item.media_owner,
      area: item.location_area,
      qty: item.qty,
      perPanelRateCard,
      perPanelDeal: perPanelRateCard, // Will be calculated after discount
      perPanelProduction,
      mediaRateCard,
      mediaDeal: mediaRateCard, // Will be calculated after discount
      productionTotal,
      lineSubtotal: mediaRateCard + productionTotal, // Will be calculated after discount
    };
  });

  // Apply discount to total media cost, not individual panel prices
  const mediaRateCard = lines.reduce((a, l) => a + l.mediaRateCard, 0);
  const mediaDeal = mediaRateCard * (1 - globalDisc);
  const production = lines.reduce((a, l) => a + l.productionTotal, 0);
  const discountValue = Math.max(0, mediaRateCard - mediaDeal);
  const grandTotal = mediaDeal + production;
  const savingPct = mediaRateCard ? discountValue / mediaRateCard : 0;

  // Update line items with proportional discount
  const discountRatio = mediaRateCard > 0 ? mediaDeal / mediaRateCard : 1;
  lines.forEach(line => {
    line.mediaDeal = line.mediaRateCard * discountRatio;
    line.perPanelDeal = line.perPanelRateCard * discountRatio;
    line.lineSubtotal = line.mediaDeal + line.productionTotal;
  });

  return {
    periodsCount,
    lines,
    totals: { mediaRateCard, mediaDeal, production, discountValue, grandTotal, savingPct }
  };
}

export function formatPeriodRange(periods: DealPeriod[]): string {
  if (!periods.length) return "";
  if (periods.length === 1) {
    return `${formatDate(periods[0].start)} - ${formatDate(periods[0].end)}`;
  }
  return `${formatDate(periods[0].start)} - ${formatDate(periods[periods.length - 1].end)}`;
}

export function formatPeriodCodes(periods: DealPeriod[]): string {
  return periods.map(p => p.code).join(", ");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short' 
  });
}