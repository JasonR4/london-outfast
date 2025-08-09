import { formatCurrency } from "@/utils/money";

interface CampaignFormat {
  name: string;
  sites: number;
  periods: number;
  inCharges: number;
  saleRate: number;
  mediaBeforeDiscount: number;
  volumeDiscount: number;
  mediaAfterDiscount: number;
  productionCost: number;
  creativeCost: number;
  subTotalExVat: number;
  sharePct: number;
  // try a few likely field names for selected locations; fall back to 0
  locationCount?: number;
  locationsSelected?: number;
  // Additional location-related fields that might be present
  id?: string;
  locations?: any[];
  selectedLocations?: any[];
  selectedAreas?: any[];
  areaIds?: any[];
  locationIds?: any[];
  areas?: any[];
}

const FormatBreakdown = ({ format }: { format: CampaignFormat }) => {
  const {
    name,
    sites,
    periods,
    inCharges,
    saleRate,
    mediaBeforeDiscount,
    volumeDiscount,
    mediaAfterDiscount,
    productionCost,
    creativeCost,
    subTotalExVat,
    sharePct,
    // try a few likely field names for selected locations; fall back to 0
    locationCount,
    locationsSelected,
  } = format;

  // --- capacity maths ---
  // --- Robust location counting across possible shapes ---
  const metricsMap = null; // plan?.metrics?.locationsByFormat || plan?.metrics?.locationCountByFormat;
  const fromMetrics =
    (metricsMap && (metricsMap[format.name] ?? metricsMap[format.id || ''] ?? metricsMap[name])) ?? null;
  const locArrays: any[] = [
    format.locations,
    format.selectedLocations,
    format.selectedAreas,
    format.areaIds,
    format.locationIds,
    format.areas
  ].filter(Boolean);
  const firstArrayLen = locArrays.length ? (Array.isArray(locArrays[0]) ? locArrays[0].length : 0) : 0;
  const selectedLocations =
    (typeof locationsSelected === "number" ? locationsSelected : undefined) ??
    (typeof locationCount === "number" ? locationCount : undefined) ??
    (typeof fromMetrics === "number" ? fromMetrics : undefined) ??
    firstArrayLen ??
    0;
  const capacity = (sites || 0) * (periods || 0);
  const remaining = capacity - selectedLocations;
  const headroomRatio = capacity > 0 ? remaining / capacity : 0;
  const overBy = selectedLocations > capacity ? selectedLocations - capacity : 0;

  const capBadge = (() => {
    if (capacity === 0) return null;
    if (overBy > 0) {
      return (
        <span className="ml-2 inline-flex items-center rounded-md bg-red-500/10 text-red-400 px-2 py-0.5 text-[11px]">
          Over by {overBy}
        </span>
      );
    }
    if (headroomRatio <= 0.1) {
      return (
        <span className="ml-2 inline-flex items-center rounded-md bg-amber-500/10 text-amber-400 px-2 py-0.5 text-[11px]">
          Tight: {remaining} left
        </span>
      );
    }
    return (
      <span className="ml-2 inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[11px]">
        OK: {remaining} left
      </span>
    );
  })();

  return (
    <div className="
      rounded-2xl
      border border-zinc-800
      bg-zinc-950/90
      shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_8px_30px_rgba(0,0,0,0.35)]
      p-4 md:p-5
    ">
      <div className="flex items-center justify-between">
        <div className="font-medium text-zinc-100">{name}</div>
        <div className="text-xs text-zinc-400">≈ {sharePct.toFixed(1)}% of campaign</div>
      </div>
      <div className="text-sm text-zinc-400">
        {sites} sites • {periods} periods • {inCharges} site-periods
      </div>
      {capacity > 0 && (
        <div className="mt-3 text-xs">
          <span className="font-medium text-zinc-200">Locations:</span>{" "}
          <span className="text-zinc-300">{selectedLocations.toLocaleString()} / {capacity.toLocaleString()}</span>
          {capBadge}
        </div>
      )}
      
      <div className="mt-4 space-y-1.5">
        <div className="text-sm text-zinc-200">
          <span className="font-medium">Media (before discount):</span>{" "}
          {formatCurrency(mediaBeforeDiscount)}
        </div>
        {volumeDiscount > 0 && (
          <div className="text-xs">
            <span className="mr-1">💰</span>
            <span className="text-zinc-300">Volume discount (over 3 campaign periods):</span>{" "}
            <span className="text-emerald-400">{formatCurrency(-volumeDiscount)}</span>
            <div className="text-zinc-400">
              That's {formatCurrency(-volumeDiscount / inCharges)} per site per period ({inCharges} site-periods).
            </div>
          </div>
        )}
        <div className="text-sm text-zinc-200">
          <span className="font-medium">Media (after discount):</span>{" "}
          {formatCurrency(mediaAfterDiscount)}
        </div>
        <div className="text-sm text-zinc-200">
          <span className="font-medium">Production:</span> {formatCurrency(productionCost)}
        </div>
        <div className="text-sm text-zinc-200">
          <span className="font-medium">Creative:</span> {formatCurrency(creativeCost)}
        </div>
        <div className="pt-2 mt-2 border-t border-zinc-800 text-sm">
          <span className="font-semibold text-zinc-100">Subtotal (ex VAT):</span>{" "}
          <span className="text-zinc-100">{formatCurrency(subTotalExVat)}</span>
        </div>
      </div>
    </div>
  );
};

export default FormatBreakdown;