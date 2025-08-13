import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useInvestorTotals() {
  const [committed, setCommitted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchTotals() {
      setLoading(true);
      const { data, error } = await supabase
        .from('investor_commitments')
        .select('amount')
        .eq('status', 'committed');
      
      if (!active) return;
      
      if (error) {
        console.error('Error fetching investor totals:', error);
        setCommitted(0);
        setLoading(false);
        return;
      }
      
      const sum = (data || []).reduce((acc, record: any) => acc + (Number(record.amount) || 0), 0);
      setCommitted(sum);
      setLoading(false);
    }

    fetchTotals();
    
    // Update every hour
    const intervalId = setInterval(fetchTotals, 60 * 60 * 1000);
    
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return { committed, loading };
}