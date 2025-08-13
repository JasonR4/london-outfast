import React from 'react';
import { useInvestorTotals } from '@/hooks/useInvestorTotals';
import { formatCurrency } from '@/utils/currency';

interface FundingTrackerProps {
  deadline: Date;
  target: number;
}

export function FundingTracker({ deadline, target }: FundingTrackerProps) {
  const { committed, loading } = useInvestorTotals();
  const now = new Date();
  const msLeft = Math.max(0, deadline.getTime() - now.getTime());
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const pct = Math.min(100, Math.round((committed / target) * 100));
  const barColor = pct >= 85 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-primary';

  return (
    <div className="rounded-lg border border-border p-6 bg-card">
      <div className="text-sm text-muted-foreground mb-2">Funding progress</div>
      <div className="text-2xl font-bold mb-1">
        {loading ? 'Loading…' : `${formatCurrency(committed)} committed`}
      </div>
      <div className="text-sm text-muted-foreground mb-4">
        Target {formatCurrency(target)} • {daysLeft} days left
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={`${barColor} h-3 transition-all duration-500`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Auto-updates hourly from investor_commitments (status = 'committed').
      </div>
    </div>
  );
}