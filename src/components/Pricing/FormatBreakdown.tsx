import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MaybeNum = number | undefined | null;
type MaybeStr = string | undefined | null;

type PlanItem = {
  formatName?: MaybeStr;
  quantity?: MaybeNum;                    // sites (total across the campaign)
  selectedPeriods?: number[];             // campaign period numbers
  locations?: string[];                   // preferred primary key
  selectedLocations?: string[];           // fallbacks
  selectedAreas?: string[];               // fallbacks
  saleRatePerInCharge?: MaybeNum;         // £ per site per in-charge
  mediaCost?: MaybeNum;                   // media after discount
  productionCost?: MaybeNum;
  creativeCost?: MaybeNum;
  discountAmount?: MaybeNum;              // absolute £ discount
  mediaBeforeDiscount?: MaybeNum;         // optional: if present we use it
  percentageOfCampaign?: MaybeNum;        // 0..1 optional
};

type FormatBreakdownProps = {
  item: PlanItem;
  shareOfCampaign?: number; // 0..1 (kept for compatibility)
  className?: string;
};

const FormatBreakdown: React.FC<FormatBreakdownProps> = ({ item, shareOfCampaign }) => {
  const sites = item?.quantity ?? 0; // TOTAL sites across the whole campaign
  const periods = (item?.selectedPeriods?.length ?? 0); // in-charges count
  const inChargesCount = periods; // NEW: in-charges = number of campaign periods (not multiplied)
  const saleRate = item?.saleRatePerInCharge ?? 0;

  // Locations: use whichever field exists
  const rawLocs = item?.locations ?? item?.selectedLocations ?? item?.selectedAreas ?? [];
  const locations = Array.isArray(rawLocs) ? rawLocs.length : 0;

  // Media maths (per site per in-charge × sites × periods) remains correct,
  // we just don't *display* sites×periods as "site-periods".
  const computedMediaBefore = saleRate * sites * periods;
  const mediaBefore = (item?.mediaBeforeDiscount ?? computedMediaBefore);
  const discount = item?.discountAmount ?? 0;
  const mediaAfter = item?.mediaCost ?? (mediaBefore - discount);
  const production = item?.productionCost ?? 0;
  const creative = item?.creativeCost ?? 0;
  const subtotal = (mediaAfter + production + creative);

  const pct = (typeof item?.percentageOfCampaign === "number" ? item.percentageOfCampaign : shareOfCampaign) ?? 0;
  const pctText = `≈ ${(pct * 100).toFixed(1)}% of campaign`;

  const overLocations = locations > sites ? (locations - sites) : 0;
  const locStatus: "ok" | "warn" = overLocations > 0 ? "warn" : "ok";

  const gbp = (n: number) =>
    n.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });

  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground p-4 space-y-2")}>
      <div className="flex items-center justify-between">
        <div className="font-medium">{item?.formatName ?? "Format"}</div>
        <div className="text-xs text-muted-foreground">{pctText}</div>
      </div>

      {/* Top line: sites are TOTAL across campaign, in-charges = period count */}
      <div className="text-sm mt-1">
        {sites} site{sites === 1 ? "" : "s"} total • {inChargesCount} in-charge{inChargesCount === 1 ? "" : "s"}
      </div>

      {/* Locations status — recommendation is ≤ sites */}
      <div className="text-xs flex items-center gap-2">
        <span>Locations selected: <strong>{locations}</strong></span>
        <Badge variant={locStatus === "ok" ? "secondary" : "destructive"} className="text-[10px]">
          {locStatus === "ok"
            ? `≤ ${sites} recommended`
            : `over by ${overLocations} (recommend ≤ ${sites})`}
        </Badge>
      </div>

      <div className="text-sm mt-2">Sale rate (per in-charge): {gbp(saleRate)}</div>
      <div className="text-sm">Media (before discount): {gbp(mediaBefore)}</div>
      {discount > 0 && (
        <>
          <div className="text-sm">
            💰 Volume discount (over 3 campaign periods): -{gbp(discount)}
          </div>
          <div className="text-xs text-muted-foreground">
            That&apos;s -{gbp((saleRate * 0.10))} per site per in-charge ({(sites * periods).toLocaleString()} site-in-charges).
          </div>
        </>
      )}
      <div className="text-sm">Media (after discount): {gbp(mediaAfter)}</div>
      <div className="text-sm">Production: {gbp(production)}</div>
      <div className="text-sm">Creative: {gbp(creative)}</div>
      <div className="font-medium pt-1">Subtotal (ex VAT): {gbp(subtotal)}</div>
    </div>
  );
};

export default FormatBreakdown;