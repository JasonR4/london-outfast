// Centralised period utilities
export const countPrintRuns = (periods: number[]) => {
  const p = [...new Set(periods)].sort((a, b) => a - b);
  if (!p.length) return 0;
  let runs = 1;
  for (let i = 1; i < p.length; i++) if (p[i] !== p[i - 1] + 1) runs++;
  return runs;
};
