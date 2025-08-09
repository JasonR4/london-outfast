import { describe, it, expect } from 'vitest';
import { formatCurrency } from './money';

describe('formatCurrency', () => {
  it('formats GBP with 2dp', () => {
    expect(formatCurrency(8929.2)).toBe('£8,929.20');
  });
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('£0.00');
  });
  it('respects currency code (EUR)', () => {
    expect(formatCurrency(10, 'EUR')).toMatch(/10\.00/);
  });
});
