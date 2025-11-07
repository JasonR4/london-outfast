import React from "react";
import { formatCurrency } from "@/utils/money";

interface CampaignBreakdownProps {
  campaignCost: number;      // Media cost after any discounts
  productionCost: number;    // Print runs × sites × production unit price
  creativeCost: number;      // Creative count × creative unit price
  subtotal: number;          // Ex VAT
  vat: number;               // VAT amount
  totalIncVat: number;       // Subtotal + VAT
  currency?: string;         // Defaults to GBP
}

export const CampaignBreakdown: React.FC<CampaignBreakdownProps> = ({
  campaignCost,
  productionCost,
  creativeCost,
  subtotal,
  vat,
  totalIncVat,
  currency = "GBP"
}) => {
  const items = [
    {
      label: "Campaign Cost",
      description: "Sites × periods at sale price, after any applicable media discounts.",
      value: formatCurrency(campaignCost, currency)
    },
    {
      label: "Production Cost",
      description: "Printing & posting based on print runs. Split (non-consecutive) in-charge periods require extra print runs. Media rate unchanged.",
      value: formatCurrency(productionCost, currency)
    },
    {
      label: "Creative Assets",
      description: "Number of distinct artworks supplied for your campaign.",
      value: formatCurrency(creativeCost, currency)
    },
  { label: "Subtotal (ex VAT)", value: formatCurrency(subtotal, currency) },
  { label: "VAT (20%)", value: formatCurrency(vat, currency) },
  { label: "Total inc VAT", value: `${formatCurrency(totalIncVat, currency)} inc VAT` }
  ];

  return (
    <div className="campaign-breakdown space-y-3">
      {items.map((it, i) => (
        <div
          key={i}
          className="breakdown-row flex items-start justify-between gap-4"
        >
          <div className="label text-sm md:text-base">
            <div className="font-medium">{it.label}</div>
            {it.description && (
              <div className="description text-xs opacity-70">
                {it.description}
              </div>
            )}
          </div>
          <div className="value text-right font-semibold">{it.value}</div>
        </div>
      ))}
    </div>
  );
};