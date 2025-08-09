// Quote calculation utilities
import { formatCurrency } from './money';

export type QuoteItem = {
  formatName: string;
  sites: number;
  selectedPeriods: number[];
  saleRate: number;
  productionCost: number;
  creativeCost: number;
};

export type EnrichedItem = QuoteItem & {
  incharges: number;
  mediaCost: number;
  qualifiesVolume: boolean;
  volumeDiscount: number;
  mediaAfterDiscount: number;
  subtotal: number;
};

export type FormatGroup = {
  formatName: string;
  sites: number;
  uniquePeriods: number;
  incharges: number;
  saleRate: number;
  mediaCost: number;
  volumeDiscount: number;
  mediaAfterDiscount: number;
  productionCost: number;
  creativeCost: number;
  subtotal: number;
  share: number;
};

export function enrichQuoteItem(item: QuoteItem): EnrichedItem {
  const uniquePeriods = [...new Set(item.selectedPeriods)];
  const incharges = item.sites * uniquePeriods.length;
  const mediaCost = item.saleRate * incharges;
  const qualifiesVolume = uniquePeriods.length >= 3;
  const volumeDiscount = qualifiesVolume ? mediaCost * 0.1 : 0;
  const mediaAfterDiscount = mediaCost - volumeDiscount;
  const subtotal = mediaAfterDiscount + item.productionCost + item.creativeCost;

  return {
    ...item,
    incharges,
    mediaCost,
    qualifiesVolume,
    volumeDiscount,
    mediaAfterDiscount,
    subtotal,
  };
}

export function groupByFormat(items: EnrichedItem[]): FormatGroup[] {
  const grandTotal = items.reduce((acc, it) => acc + it.subtotal, 0);

  const groups = Object.values(
    items.reduce((acc, it) => {
      if (!acc[it.formatName]) {
        acc[it.formatName] = {
          formatName: it.formatName,
          sites: 0,
          uniquePeriods: new Set<number>(),
          incharges: 0,
          saleRate: it.saleRate,
          mediaCost: 0,
          volumeDiscount: 0,
          mediaAfterDiscount: 0,
          productionCost: 0,
          creativeCost: 0,
          subtotal: 0,
        };
      }
      const g = acc[it.formatName];
      g.sites += it.sites;
      it.selectedPeriods.forEach(p => g.uniquePeriods.add(p));
      g.incharges += it.incharges;
      g.mediaCost += it.mediaCost;
      g.volumeDiscount += it.volumeDiscount;
      g.mediaAfterDiscount += it.mediaAfterDiscount;
      g.productionCost += it.productionCost;
      g.creativeCost += it.creativeCost;
      g.subtotal += it.subtotal;
      return acc;
    }, {} as Record<string, any>)
  ).map(g => ({
    ...g,
    uniquePeriods: g.uniquePeriods.size,
    share: grandTotal > 0 ? (g.subtotal / grandTotal) * 100 : 0,
  }));

  return groups.sort((a, b) => b.subtotal - a.subtotal);
}