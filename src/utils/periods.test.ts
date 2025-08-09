import { describe, it, expect } from 'vitest';
import { countPrintRuns } from './periods';

describe('countPrintRuns', () => {
  it('returns 0 for empty', () => {
    expect(countPrintRuns([])).toBe(0);
  });
  it('returns 1 for single period', () => {
    expect(countPrintRuns([17])).toBe(1);
  });
  it('returns 1 for consecutive periods', () => {
    expect(countPrintRuns([17, 18, 19, 20])).toBe(1);
  });
  it('returns 3 for split periods', () => {
    expect(countPrintRuns([17, 19, 21])).toBe(3);
  });
  it('handles unsorted input', () => {
    expect(countPrintRuns([20, 18, 17, 19])).toBe(1);
  });
  it('ignores duplicates', () => {
    expect(countPrintRuns([17, 17, 18, 19, 19])).toBe(1);
  });
});
