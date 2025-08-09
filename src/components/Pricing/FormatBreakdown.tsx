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
  const selectedLocations =
    (typeof locationsSelected === "number" ? locationsSelected : undefined) ??
    (typeof locationCount === "number" ? locationCount : undefined) ?? 0;
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
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">≈ {sharePct.toFixed(1)}% of campaign</div>
      </div>
      <div className="text-xs text-muted-foreground">
        {sites} sites • {periods} periods • {inCharges} site-periods
      </div>
      {capacity > 0 && (
        <div className="text-xs">
          <span className="text-muted-foreground">Locations:</span>{" "}
          <span className="font-medium">{selectedLocations.toLocaleString()}</span>
          <span className="text-muted-foreground"> / </span>
          <span className="font-medium">{capacity.toLocaleString()}</span>
          {capBadge}
        </div>
      )}
      
      <div className="text-sm">Media (before discount): {formatCurrency(mediaBeforeDiscount)}</div>
      <div className="text-sm text-emerald-500">
        💰 Volume discount (over 3 campaign periods): {formatCurrency(-volumeDiscount)}
      </div>
      <div className="text-xs text-muted-foreground">
        That's {formatCurrency(-volumeDiscount / inCharges)} per site per period ({inCharges} site-periods).
      </div>
      <div className="text-sm">Media (after discount): {formatCurrency(mediaAfterDiscount)}</div>
      <div className="text-sm">Production: {formatCurrency(productionCost)}</div>
      <div className="text-sm">Creative: {formatCurrency(creativeCost)}</div>
      <div className="text-sm font-medium border-t pt-2 mt-2">
        Subtotal (ex VAT): {formatCurrency(subTotalExVat)}
      </div>
    </div>
  );
};

export default FormatBreakdown;