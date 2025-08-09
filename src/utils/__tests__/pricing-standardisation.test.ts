import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/utils/money";
import { countPrintRuns } from "@/utils/periods";

function calculateVolumeDiscount(mediaCost: number, periods: number[]) {
  const uniquePeriods = new Set(periods).size;
  return uniquePeriods >= 3 ? mediaCost * 0.10 : 0;
}

describe("countPrintRuns", () => {
  it("returns 0 for empty", () => {
    expect(countPrintRuns([])).toBe(0);
  });
  it("returns 1 for single period", () => {
    expect(countPrintRuns([17])).toBe(1);
  });
  it("returns 1 for consecutive", () => {
    expect(countPrintRuns([17,18,19])).toBe(1);
  });
  it("returns 3 for split periods", () => {
    expect(countPrintRuns([17,19,21])).toBe(3);
  });
  it("handles unsorted", () => {
    expect(countPrintRuns([20,18,17,19])).toBe(1);
  });
  it("ignores duplicates", () => {
    expect(countPrintRuns([17,17,18,19,19])).toBe(1);
  });
});

describe("formatCurrency", () => {
  it("formats GBP with 2dp", () => {
    expect(formatCurrency(8929.2)).toBe("£8,929.20");
  });
  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("£0.00");
  });
  it("supports EUR", () => {
    expect(formatCurrency(10, "EUR")).toMatch(/10\.00/);
  });
});

describe("calculateVolumeDiscount", () => {
  it("applies 10% for 3+ periods", () => {
    expect(calculateVolumeDiscount(1000, [1,2,3])).toBe(100);
  });
  it("no discount for <3 periods", () => {
    expect(calculateVolumeDiscount(1000, [1,2])).toBe(0);
  });
  it("ignores duplicates when counting", () => {
    expect(calculateVolumeDiscount(1000, [1,1,2,3])).toBe(100);
  });
});

describe("UI copy sync", () => {
  const expectedCopy = "💰 Volume discount (10% for 3+ in-charge periods)";
  const components = {
    SmartQuoteForm: require("@/components/SmartQuoteForm.tsx").default?.toString() || "",
    FormatPage: require("@/pages/FormatPage.tsx").default?.toString() || "",
    QuotePlan: require("@/pages/QuotePlan.tsx").default?.toString() || "",
  };
  for (const [name, code] of Object.entries(components)) {
    it(`${name} uses standardised volume discount copy`, () => {
      expect(code.includes(expectedCopy)).toBe(true);
    });
  }
});