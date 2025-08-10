export const formatGBP = (v: number) =>
  Number(v || 0).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

export const uniquePeriodsCount = (periods: Array<number|string> = []): number =>
  Array.from(new Set(periods.map(String))).length;

// Count non-consecutive groups = number of print runs
export const countPrintRuns = (periods: Array<number|string> = []): number => {
  const arr = Array.from(new Set(periods.map(Number))).sort((a,b)=>a-b);
  if (arr.length === 0) return 0;
  let runs = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i-1] + 1) runs++;
  }
  return runs;
};

export type MediaInputs = {
  saleRate?: number;     // per in-charge
  sites?: number;        // count of sites across the campaign
  periods?: Array<number|string>; // selected period ids
};

export const computeMedia = (inp: MediaInputs) => {
  const rate = Number(inp.saleRate ?? 0);
  const sites = Number(inp.sites ?? 0);
  const pCount = uniquePeriodsCount(inp.periods);
  const before = rate * sites * pCount;
  const qualifies = pCount >= 3;
  const showDiscount = qualifies && before > 0;
  const discount = showDiscount ? before * 0.10 : 0; // 10% for 3+ periods
  const after = before - discount;
  const runs = countPrintRuns(inp.periods);
  return { rate, sites, periodCount: pCount, before, qualifies, showDiscount, discount, after, printRuns: runs };
};

// Percent helpers
export const pct = (part: number, whole: number) => (Number(whole) > 0 ? Number(part) / Number(whole) : 0);
export const pctText = (x: number) => `${(x * 100).toFixed(1)}%`;
