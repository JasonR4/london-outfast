import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsCode {
  id: string;
  name: string;
  code_type: string;
  tracking_code: string;
  placement: string;
  is_active: boolean;
  priority: number;
  description?: string;
}

export function useAnalyticsCodes() {
  const [analyticsCodes, setAnalyticsCodes] = useState<AnalyticsCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsCodes();
  }, []);

  const fetchAnalyticsCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('analytics_codes')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      setAnalyticsCodes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics codes');
    } finally {
      setLoading(false);
    }
  };

  const getCodesByPlacement = (placement: 'head' | 'body_start' | 'body_end') => {
    return analyticsCodes.filter(code => code.placement === placement);
  };

  return {
    analyticsCodes,
    loading,
    error,
    getCodesByPlacement,
    refetch: fetchAnalyticsCodes
  };
}